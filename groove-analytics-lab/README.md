# 🎵 Groove Analytics Lab

Plataforma de visualização e análise de dados para o dataset de músicas do Spotify (+89.000 faixas).

Consulte a documentação completa no arquivo [README.md principal](file:///home/gabriel/SpotifyDS/README.md).

## 🚀 Como Executar

### 1. Iniciar o Backend (porta 3001)
```bash
npm run server
```

### 2. Iniciar a API do modelo (porta 8000)
Primeiro rode a última célula de `Regressao_modelo.ipynb` para salvar o LightGBM em `ml-api/models/`. Depois:

```bash
pip install -r ml-api/requirements.txt
npm run ml-api
```

### 3. Iniciar o Frontend
```bash
npm run dev
```

A aba **Predict Popularity** chama o FastAPI e mostra a popularidade como intervalo (previsão ± MAE).

### Subir tudo com Docker

Na pasta `groove-analytics-lab`, com o modelo já em `ml-api/models/`:

```bash
docker compose up --build
```

Abra [http://localhost:8080](http://localhost:8080). O Compose sobe o Express (3001), o FastAPI (8000) e o front no Nginx, que encaminha `/api` e `/ml`.

```bash
docker compose down
```

### 4. Build de Produção
```bash
npm run build
```
