# 🎵 Groove Analytics Lab — Spotify Dataset Analytics

O **Groove Analytics Lab** é uma plataforma analítica interativa construída para explorar, correlacionar e visualizar características de mais de **89.400 faixas**, **113 gêneros musicais** e **31.300+ artistas** do ecossistema Spotify.

---

## 🚀 Funcionalidades

### 1. 📊 Visão Geral & KPIs Dinâmicos
- **Cards de Métricas em Tempo Real**: Total de Faixas, Gêneros Únicos, Artistas Únicos, Percentual de Conteúdo Explícito, Média de Popularidade e Média de Energia.
- **Gráfico de Dispersão Multidimensional (Scatter Plot)**:
  - Seleção livre dos eixos X e Y entre múltiplos atributos de áudio (*Danceability*, *Energy*, *Valence*, *Acousticness*, *Speechiness*, *Liveness*, *Instrumentalness*, *Tempo*, *Loudness*, *Popularity*).
  - Filtro por gênero musical e conteúdo explícito.
  - Clique direto em qualquer ponto para abrir o modal de detalhes da faixa.
- **Comparação Explícito vs. Clean**: Análise de popularidade média entre faixas explícitas e limpas.
- **Leaderboard de Gêneros**: Ranking interativo dos gêneros musicais com alternância de métricas (*Popularidade*, *Dançabilidade*, *Energia*, *Valência*, *Volume de faixas*).

### 2. 🧬 Perfil Acústico dos Gêneros (Genre Audio DNA)
- Gráfico de **Radar Multi-Gênero** comparando até 5 gêneros simultaneamente em 7 dimensões acústicas normalizadas (0.0 a 1.0).
- Cards comparativos com destaques de popularidade, BPM médio, energia e positividade (*valence*).

### 3. 👑 Hall da Fama dos Artistas (Top Artists)
- Ranking dos artistas mais influentes e prolíficos da base de dados.
- Ordenação por **Maior Popularidade Média** ou **Maior Volume de Faixas**.
- Tags de gêneros principais e barras visuais de características sonoras.

### 4. 🔍 Explorador de Faixas (Track Explorer)
- Tabela interativa com **busca em tempo real (debounced)** por nome, artista ou álbum.
- **Ordenação por Colunas**: Clique nos cabeçalhos para ordenar de forma ascendente ou descendente.
- **Filtros por Gênero e Conteúdo Explícito**.
- **Exportação para CSV**: Download dos resultados filtrados da página atual em formato CSV.
- **Link Direto para o Spotify Web**: Abertura da faixa no player oficial do Spotify com um clique.
- **Modal de Detalhes da Faixa (Track Modal)**:
  - Fingerprint acústico em gráfico radar individual.
  - Especificações musicais detalhadas: *Tempo (BPM)*, *Tom Musical (Key)*, *Modo (Maior/Menor)*, *Compasso (Time Signature)*, *Volume (Loudness)* e *Duração*.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com **TypeScript**
- **Vite** para empacotamento rápido e HMR
- **Recharts** para renderização de gráficos vetoriais SVG (*Scatter, Bar, Radar, Polar*)
- **Lucide React** para ícones modernos
- **CSS3 com Glassmorphism**, variáveis CSS e design responsivo com tema escuro

### Backend
- **Node.js** com **Express**
- **CORS** para comunicação com o frontend
- Normalização e indexação de dados em memória para resposta instantânea

---

## 📁 Estrutura do Projeto

```text
SpotifyDS/
├── spotify_dataset.json             # Dataset raiz do Spotify (~56.5 MB)
├── README.md                        # Documentação do projeto
└── groove-analytics-lab/
    ├── backend/
    │   ├── data/
    │   │   └── spotify_dataset.json # Cópia de dados utilizada pela API
    │   ├── routes/
    │   │   ├── stats.js             # Rotas de agregação analítica e métricas
    │   │   └── tracks.js            # Rotas de busca, paginação, detalhes e gêneros
    │   ├── package.json
    │   └── server.js                # Servidor Express (porta 3001)
    ├── src/
    │   ├── api/
    │   │   └── client.ts            # Cliente HTTP tipado para consumo da API
    │   ├── components/
    │   │   ├── Header.tsx           # Cabeçalho com identidade visual
    │   │   ├── KPICards.tsx         # Cards de indicadores-chave
    │   │   ├── ScatterPlot.tsx      # Dispersão correlacional multidimensional
    │   │   ├── ExplicitComparison.tsx# Gráfico comparativo explícito vs clean
    │   │   ├── TopGenresChart.tsx   # Gráfico de barras de gêneros com filtros
    │   │   ├── GenreComparisonRadar.tsx # Radar de DNA acústico dos gêneros
    │   │   ├── TopArtistsLeaderboard.tsx # Ranking de artistas
    │   │   ├── TrackTable.tsx       # Tabela completa de faixas com ordenação e CSV
    │   │   ├── TrackModal.tsx       # Modal de detalhes técnicos e radar da faixa
    │   │   └── Shared.tsx           # Skeleton loaders e estados de erro
    │   ├── hooks/
    │   │   └── useApi.ts            # Hook customizado de requisição e caching
    │   ├── types/
    │   │   └── index.ts             # Interfaces TypeScript de dados e respostas
    │   ├── App.tsx                  # Componente raiz com navegação por abas
    │   ├── index.css                # Estilos globais e variáveis de design
    │   └── main.tsx                 # Ponto de entrada React
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior instalada.
- Gerenciador de pacotes `npm`.

---

### Passo 1: Instalar Dependências

Abra o terminal na pasta `groove-analytics-lab`:

```bash
cd /home/gabriel/SpotifyDS/groove-analytics-lab

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend && npm install && cd ..
```

---

### Passo 2: Iniciar os Servidores

Você precisará de dois terminais (ou executar um em background):

#### Terminal 1 — Backend (Porta 3001):
```bash
cd /home/gabriel/SpotifyDS/groove-analytics-lab
npm run server
```
> O servidor carregará e normalizará os dados do dataset e exibirá: `Server running on port 3001`.

#### Terminal 2 — Frontend (Vite):
```bash
cd /home/gabriel/SpotifyDS/groove-analytics-lab
npm run dev
```
> O Vite iniciará o servidor de desenvolvimento (geralmente em `http://localhost:5173`). Abra o link no seu navegador.

---

### Passo 3: Build para Produção (Opcional)

Para verificar os tipos e compilar os artefatos de produção otimizados:

```bash
cd /home/gabriel/SpotifyDS/groove-analytics-lab
npm run build
```

---

## 📡 Endpoints da API REST

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/stats/summary` | Retorna métricas globais agregadas do dataset |
| `GET` | `/api/stats/scatter-plot` | Retorna pontos correlacionais com eixos `xAxis` e `yAxis` customizáveis |
| `GET` | `/api/stats/explicit-comparison` | Retorna médias de popularidade e contagem entre explícitas e clean |
| `GET` | `/api/stats/top-genres` | Retorna ranking de gêneros por popularidade ou atributos |
| `GET` | `/api/stats/top-artists` | Retorna ranking dos melhores artistas por popularidade ou faixas |
| `GET` | `/api/stats/genre-profile` | Retorna médias acústicas para gêneros selecionados |
| `GET` | `/api/stats/feature-distribution` | Retorna histograma de distribuição de um atributo |
| `GET` | `/api/tracks` | Busca paginada com ordenação (`sortBy`, `sortOrder`), busca textual e filtros |
| `GET` | `/api/tracks/genres` | Retorna lista de todos os gêneros disponíveis com contagem de faixas |
| `GET` | `/api/tracks/:id` | Retorna todos os dados e atributos detalhados de uma faixa específica |
