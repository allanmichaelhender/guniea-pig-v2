# Guniea Pig Portfolio

**Guniea Pig Portfolio** is a high-performance interactive risk analytics platform designed for long-horizon investors. Unlike traditional day-trading tools, it utilizes unsupervised machine learning and RAG-driven AI to uncover "hidden" correlations and volatility surges across 5+ years of adjusted market data.

## 🚀 Key Features

- **Multi-Horizon Risk Engine**: Utilizes **KMeans Clustering** and **PCA** on 3 years of weekly log returns to identify asset co-movement profiles independent of traditional sectors.
- **Volatility Surge Detection**: Implements annualized **σ52** monitoring to flag idiosyncratic and regime-based stress signals against a 5-year baseline.
- **Semantic Asset Discovery**: A RAG pipeline using **pgvector** and **Hugging Face embeddings** (`all-MiniLM-L6-v2`) to enable natural language asset search.
- **LLM Narratives**: Automated portfolio risk explanations orchestrated via **LangGraph** and **Grok**, translating complex quantitative metrics into institutional-grade insights.
- **Automated ETL Pipeline**: Asynchronous ingestion of **Tiingo** price data and **FinanceDatabase** metadata via a deterministic identifier ladder.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts.
- **Backend**: Python, Django, Django Ninja (FastAPI-style routing).
- **Async Processing**: Django Q2, Redis.
- **Database**: PostgreSQL with **pgvector** for high-dimensional similarity search.
- **AI/ML**: LangChain/LangGraph, scikit-learn (KMeans, PCA), Hugging Face Transformers.
- **Infrastructure**: Docker Compose, Nginx (Reverse Proxy), SSL/TLS (Certbot).

## 📁 Project Structure

```text
.
├── backend/                       # Django Ninja API & ML Engine
│   ├── api/                       # Central API routing and schema definitions
│   ├── assets/                    # Asset metadata & enrichment (Tiingo + FinanceDatabase)
│   │   └── management/commands/   # ETL scripts (load_prices, enrich_assets)
│   ├── guinea_pig/                # Core settings, ASGI/WSGI, and Middleware
│   ├── llm/                       # LangGraph orchestration & Grok prompts
│   ├── ml/                        # KMeans clustering & σ52 surge logic
│   ├── portfolio/                 # Simulation engine & backtesting logic
│   ├── tasks/                     # Django Q2 background job definitions
│   ├── Dockerfile
│   └── manage.py
├── frontend/                      # React SPA
│   ├── src/
│   │   ├── components/            # Reusable UI (Charts, Dashboards)
│   │   ├── hooks/                 # Custom React hooks for API state
│   │   └── store/                 # State management (Zustand or Redux)
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker/                        # Orchestration & Proxy configs
│   └── nginx/                     # Nginx configuration & SSL templates
├── docker-compose.yml             # Full-stack orchestration
└── README.md
```

## 🛠 Getting Started

### Prerequisites

- Docker & Docker Compose
- API Keys for: Tiingo, Groq (for Grok/Llama 3), and FinanceDatabase (optional bulk files).

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/guniea-pig-v2.git
   cd guniea-pig-v2
   ```

2. **Configure Environment**
   Create a `.env` file in the docker directory with env variables listed in backend service of docker compose. Create a `.env` file in the frontend directory with your VITE API URL.

3. **Build and Run**

   ```bash
   docker compose up --build
   ```

4. **Initial Data Load**
   ```bash
   docker compose exec backend python manage.py load_tiingo_tickers data/supported_tickers.csv
    docker compose exec backend python manage.py load_historical_prices data/initial_tickers.csv
    docker compose exec backend python manage.py generate_embeddings
    docker compose exec backend python manage.py enrich_assets
    docker compose exec backend python manage.py calculate_risk_metrics
   ```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

_Disclaimer: This is a simulation tool for research purposes and does not constitute financial advice._
