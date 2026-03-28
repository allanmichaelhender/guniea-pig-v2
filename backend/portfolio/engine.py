import pandas as pd
import numpy as np
from datetime import date, timedelta
from typing import List, Dict
from assets.models import Asset, Price


def calculate_portfolio_metrics(
    holdings: List[Dict[str, float]], start_date: date = None
) -> Dict:
    """
    Pure function: Input -> Math -> Output.
    Does not care if data is from DB or JSON.
    """
    # 1. Normalize Input to DataFrame for easier manipulation
    holdings_df = pd.DataFrame(holdings)
    # Ensure tickers are uppercase for consistency with the database
    holdings_df["ticker"] = holdings_df["ticker"].str.upper()
    tickers = holdings_df["ticker"].tolist()

    # 2. Validate Tickers exist in our Universe
    assets = Asset.objects.filter(ticker__in=tickers)
    found_tickers = set(a.ticker for a in assets)
    missing = set(tickers) - found_tickers

    if missing:
        raise ValueError(f"Tickers not found in universe: {', '.join(missing)}")

    # 3. Fetch Price History
    requested_start_date = start_date
    if not requested_start_date:
        # This is handled by the schema default factory, but good to have a fallback
        # if `null` is explicitly passed.
        requested_start_date = date.today() - timedelta(days=365 * 5)

    prices_qs = Price.objects.filter(
        asset__in=tickers, date__gte=requested_start_date
    ).values("asset_id", "date", "adj_close")

    if not prices_qs:
        return {
            "error": "No price history found for the selected assets in the given date range."
        }

    # 4. Pivot Data & Handle Missing History
    prices_df = pd.DataFrame.from_records(prices_qs)
    prices_pivot = prices_df.pivot(index="date", columns="asset_id", values="adj_close")
    prices_pivot.sort_index(inplace=True)

    # --- Edge Case Handling & Warning Generation ---
    warnings = []
    # Find the first valid date for each asset
    first_valid_dates = prices_pivot.apply(lambda col: col.first_valid_index())

    # The actual start date is the latest of all first valid dates
    actual_start_date = first_valid_dates.max()

    # Check if the actual start date is later than requested
    if actual_start_date and (actual_start_date - requested_start_date) >= timedelta(
        days=7
    ):
        # Identify which tickers caused the delay
        late_tickers = first_valid_dates[
            first_valid_dates == actual_start_date
        ].index.tolist()
        warnings.append(
            f"Short history for {', '.join(late_tickers)}. "
            f"Simulation started on {actual_start_date.strftime('%Y-%m-%d')} instead of {requested_start_date.strftime('%Y-%m-%d')}."
        )

    # Trim the dataframe to the actual start date
    if actual_start_date:
        prices_pivot = prices_pivot.loc[actual_start_date:]

    # Forward-fill to handle any intermediate missing weekly data points
    prices_pivot.ffill(inplace=True)
    # Drop any assets that *still* have no data after ffill (i.e., no data at all in range)
    prices_pivot.dropna(axis=1, how="all", inplace=True)

    if len(prices_pivot) < 2:
        return {"error": "Not enough overlapping price history to simulate."}

    # 5. Calculate Returns (using simple returns for portfolio attribution)
    returns_df = prices_pivot.pct_change().iloc[1:]

    # 6. Apply Weights
    weights = holdings_df.set_index("ticker").reindex(returns_df.columns)["weight"]
    portfolio_returns = returns_df.dot(weights)

    # 7. Calculate Key Metrics
    n_weeks = len(portfolio_returns)
    n_years = n_weeks / 52.0
    total_return = (1 + portfolio_returns).prod() - 1
    annualized_return = ((1 + total_return) ** (1 / n_years)) - 1 if n_years > 0 else 0
    volatility = portfolio_returns.std() * np.sqrt(52)
    risk_free_rate = 0.02  # Assumption for v1
    sharpe_ratio = (
        (annualized_return - risk_free_rate) / volatility if volatility > 0 else 0
    )
    wealth_index = (1 + portfolio_returns).cumprod()
    previous_peaks = wealth_index.cummax()
    drawdowns = (wealth_index - previous_peaks) / previous_peaks
    max_drawdown = drawdowns.min() if not drawdowns.empty else 0

    # 8. Generate Performance Chart Data (Wealth Index)
    # Format: [{"date": "2020-01-01", "value": 1.05}, ...]
    # We assume starting value of 1.0 implicitly, so we just plot the growth
    performance_chart = [
        {"date": d.strftime("%Y-%m-%d"), "value": round(v, 4)}
        for d, v in wealth_index.items()
    ]

    # 9. Structure the output
    return {
        "status": "success",
        "metrics": {
            "annualized_return": annualized_return,
            "volatility": volatility,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
        },
        "performance_chart": performance_chart,
        "simulation_metadata": {
            "requested_start_date": requested_start_date.strftime("%Y-%m-%d"),
            "actual_start_date": actual_start_date.strftime("%Y-%m-%d")
            if actual_start_date
            else None,
            "holdings": holdings,
            "warnings": warnings,
        },
    }
