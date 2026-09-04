from __future__ import annotations

import json
from pathlib import Path

import lightgbm as lgb
import numpy as np
import pandas as pd
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODELS_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODELS_DIR / "popularity_lgb.txt"
META_PATH = MODELS_DIR / "preprocessamento.json"

app = FastAPI(title="Groove Popularity API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

booster: Optional[lgb.Booster] = None
meta: Optional[dict] = None


def _load_artifacts() -> None:
    global booster, meta
    if not MODEL_PATH.exists() or not META_PATH.exists():
        booster = None
        meta = None
        return
    meta = json.loads(META_PATH.read_text(encoding="utf-8"))
    booster = lgb.Booster(model_file=str(MODEL_PATH))


_load_artifacts()


def _require_model() -> tuple[lgb.Booster, dict]:
    if booster is None or meta is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Modelo LightGBM não encontrado. Rode a última célula de "
                "Regressao_modelo.ipynb para salvar popularity_lgb.txt."
            ),
        )
    return booster, meta


class PredictIn(BaseModel):
    energy: float = Field(..., ge=0, le=1.5)
    danceability: float = Field(..., ge=0, le=1.5)
    liveness: float = Field(..., ge=0, le=1.5)
    valence: float = Field(..., ge=0, le=1.5)
    duration_ms: float = Field(..., gt=0)
    acousticness: float = Field(..., ge=0, le=1.5)
    track_genre: str


class PredictOut(BaseModel):
    predicted: float
    mae: float
    range_low: int
    range_high: int
    range_label: str
    modelo: str


@app.get("/health")
def health() -> dict:
    loaded = booster is not None and meta is not None
    return {
        "ok": loaded,
        "modelo": None if meta is None else meta.get("modelo"),
        "mae": None if meta is None else meta.get("mae"),
    }


@app.get("/meta")
def get_meta() -> dict:
    _, current = _require_model()
    return {
        "modelo": current["modelo"],
        "mae": current["mae"],
        "numeric_feature_cols": current["numeric_feature_cols"],
        "genres": current["lgb_categories"],
    }


@app.post("/predict", response_model=PredictOut)
def predict(body: PredictIn) -> PredictOut:
    model, current = _require_model()
    categories = current["lgb_categories"]
    if body.track_genre not in categories:
        raise HTTPException(
            status_code=400,
            detail=f'Gênero "{body.track_genre}" não foi visto no treino.',
        )

    row = {
        col: float(np.clip(getattr(body, col), 0, 1))
        if col != "duration_ms"
        else float(body.duration_ms)
        for col in current["numeric_feature_cols"]
    }
    row["track_genre"] = body.track_genre
    X = pd.DataFrame([row])
    X["track_genre"] = pd.Categorical(X["track_genre"], categories=categories)

    predicted = float(np.clip(model.predict(X)[0], 0, 100))
    mae = float(current["mae"])
    range_low = int(round(max(0.0, predicted - mae)))
    range_high = int(round(min(100.0, predicted + mae)))

    return PredictOut(
        predicted=round(predicted, 1),
        mae=round(mae, 3),
        range_low=range_low,
        range_high=range_high,
        range_label=f"{range_low}–{range_high}",
        modelo=current["modelo"],
    )
