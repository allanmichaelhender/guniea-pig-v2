# Guniea Pig Portfolio

Interactive portfolio simulation and long-horizon risk analytics (historical backtests, cluster-based “hidden” concentration, volatility signals, semantic asset search, and LLM-assisted explanations).

**Documentation:** see [docs/plan.md](docs/plan.md) for the full technical plan and architecture.

**Layout (planned):** monorepo with `backend/` (Django) and `frontend/` (React/Vite); production target is **one GCP VM** running Docker Compose.

backend/
├── guinea_pig/                    # Main project settings (already created)
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── assets/                        # Tiingo asset metadata and price data
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                  # Asset model (ticker, exchange, etc.) + pgvector for embeddings
│   ├── views.py
│   ├── serializers.py             # DRF serializers
│   ├── urls.py
│   ├── management/
│   │   └── commands/              # load_tiingo.py for CSV import
│   └── migrations/
├── portfolio/                     # User portfolios and simulations
│   ├── models.py                  # Portfolio, Holding models
│   ├── views.py
│   ├── serializers.py
│   └── ...
├── api/                           # Main API routing (DRF)
│   ├── views.py                   # Aggregated API views
│   ├── urls.py                    # Include sub-app URLs
│   └── ...
├── ml/                            # ML logic (KMeans, volatility, Grok)
│   ├── models.py                  # If needed for ML artifacts
│   ├── utils.py                   # Clustering, embedding functions
│   └── ...
├── tasks/                         # Django Q2 task definitions
│   ├── __init__.py
│   ├── tasks.py                   # Background jobs (data fetching, ML)
│   └── ...
├── requirements.txt               # Already created
├── Dockerfile                     # Already created
├── manage.py                      # Already created
└── .dockerignore                  # Already created