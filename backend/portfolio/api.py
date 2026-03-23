from typing import List
from ninja import Router
from django.shortcuts import get_object_or_404
from .models import Portfolio, Holding
from .schemas import PortfolioIn, PortfolioOut
from .engine import calculate_portfolio_metrics
from assets.models import Asset

router = Router()

# --- Guest / Ephemeral Routes ---


@router.post("/simulate", auth=None)
def simulate_portfolio(request, payload: PortfolioIn):
    """
    Runs analytics on a portfolio WITHOUT saving it to the DB.
    Used by guests or for 'draft' mode.
    """
    # Convert Schema to standard dict list for the engine
    holdings_data = [{"ticker": h.ticker, "weight": h.weight} for h in payload.holdings]

    try:
        results = calculate_portfolio_metrics(holdings_data)
        return results
    except ValueError as e:
        return {"error": str(e)}


# --- User / Persistence Routes ---


@router.get("/", response=List[PortfolioOut])
def list_portfolios(request):
    # TODO: Filter by request.user once Auth is fully wired
    # For now, return all public + user's
    return Portfolio.objects.all()


@router.post("/", response=PortfolioOut)
def create_portfolio(request, payload: PortfolioIn):
    # 1. Create Portfolio
    # TODO: Assign request.user
    portfolio = Portfolio.objects.create(
        name=payload.name,
        description=payload.description,
        # user=request.user
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
