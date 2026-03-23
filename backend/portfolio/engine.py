import pandas as pd
from typing import List, Dict
from assets.models import Asset, Price


def calculate_portfolio_metrics(holdings: List[Dict[str, float]]) -> Dict:
    """
    Pure function: Input -> Math -> Output.
    Does not care if data is from DB or JSON.
    """
    tickers = [h["ticker"] for h in holdings]

    # 1. Validate Tickers exist in our Universe
    # We use the DB here only to look up Asset metadata/prices, not the Portfolio itself
    assets = Asset.objects.filter(ticker__in=tickers)
    found_tickers = set(a.ticker for a in assets)
    missing = set(tickers) - found_tickers

    if missing:
        raise ValueError(f"Tickers not found in universe: {', '.join(missing)}")

    # 2. Fetch Price History (Simulated efficiency)
    # In a real heavy ML run, we might load pre-calculated covariance matrices here
    # For now, we prove we can fetch data for these arbitrary tickers
    prices_qs = Price.objects.filter(asset__ticker__in=tickers, date__gte="2023-01-01")

    if not prices_qs.exists():
        return {
            "error": "Not enough price history to simulate",
            "annualized_ret": 0.0,
            "volatility": 0.0,
        }

    # Placeholder for the actual calculation logic (Pandas/NumPy)
    # This effectively "normalizes" the data pipeline

    # df = pd.DataFrame.from_records(prices_qs.values())
    # ... math ...

    # For V1 skeleton, return dummy calculated stats
    # This confirms the pipeline works
    return {
        "status": "success",
        "ticker_count": len(tickers),
        "simulated_metrics": {
            "annualized_ret": 0.12,  # 12% dummy
            "volatility": 0.15,  # 15% dummy
            "sharpe": 0.8,
            "max_drawdown": -0.10,
        },
    }
