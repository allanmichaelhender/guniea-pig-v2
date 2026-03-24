from typing import List
from ninja import Router
from django.shortcuts import get_object_or_404
from ninja_jwt.authentication import JWTAuth
from .models import Portfolio, Holding
from .schemas import PortfolioIn, PortfolioOut, SimulationResponse
from .engine import calculate_portfolio_metrics
from assets.models import Asset

router = Router()

# --- Guest Routes ---


@router.post("/simulate", auth=None, response=SimulationResponse)
def simulate_portfolio(request, payload: PortfolioIn):
    """
    Runs analytics on a portfolio WITHOUT saving it to the DB.
    Used by guests or for 'draft' mode.
    """
    # Convert Schema to standard dict list for the engine
    holdings_data = [{"ticker": h.ticker, "weight": h.weight} for h in payload.holdings]

    try:
        results = calculate_portfolio_metrics(
            holdings_data, start_date=payload.start_date
        )
        return results
    except ValueError as e:
        # in a real app, use 422 or 400 response code
        return {"error": str(e)}


# --- User Routes ---


@router.get("/", response=List[PortfolioOut], auth=JWTAuth())
def list_portfolios(request):
    return Portfolio.objects.filter(user=request.user)


@router.post("/", response=PortfolioOut, auth=JWTAuth())
def create_portfolio(request, payload: PortfolioIn):
    # 1. Create Portfolio

    # 1a. Run Calculation immediately
    holdings_data = [{"ticker": h.ticker, "weight": h.weight} for h in payload.holdings]
    metrics_data = {}
    try:
        engine_result = calculate_portfolio_metrics(
            holdings_data, start_date=payload.start_date
        )
        if "metrics" in engine_result:
            metrics_data = engine_result["metrics"]
            # Add history to separate var
            metrics_data["performance_history"] = engine_result.get("performance_chart")
    except Exception:
        # If calc fails, we still create portfolio but with empty stats
        pass

    portfolio = Portfolio.objects.create(
        name=payload.name,
        description=payload.description,
        start_date=payload.start_date,
        user=request.user,
        # Save computed metrics
        annualized_return=metrics_data.get("annualized_return"),
        volatility=metrics_data.get("volatility"),
        sharpe_ratio=metrics_data.get("sharpe_ratio"),
        max_drawdown=metrics_data.get("max_drawdown"),
        performance_history=metrics_data.get("performance_history"),
    )

    # 2. Create Holdings (Bulk)
    # We need to fetch Asset objects first to link ForeignKeys
    tickers = [h.ticker for h in payload.holdings]
    assets = Asset.objects.filter(ticker__in=tickers).in_bulk(field_name="ticker")

    holdings_to_create = []
    for item in payload.holdings:
        if item.ticker not in assets:
            # Cleanup if validation fails mid-stream
            portfolio.delete()
            return 400, {"message": f"Invalid ticker: {item.ticker}"}

        holdings_to_create.append(
            Holding(portfolio=portfolio, asset=assets[item.ticker], weight=item.weight)
        )

    Holding.objects.bulk_create(holdings_to_create)

    return portfolio


x
