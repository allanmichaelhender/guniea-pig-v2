from ninja import Router
from ninja_jwt.authentication import JWTAuth
from portfolio.schemas import PortfolioIn
from portfolio.engine import calculate_portfolio_metrics
from llm.graphs import portfolio_graph
from typing import List
from assets.models import Asset
from pgvector.django import CosineDistance
from llm.graphs import search_graph
from assets.schemas import AssetSchema
from llm.schemas import AnalysisResponse, SmartSearchRequest
from assets.api import get_embedding_model


router = Router(tags=["llm"])


class JWTAuthSoft(JWTAuth):
    """
    A 'Soft' JWT authenticator that allows invalid/expired tokens to
    fall through to the next authentication method (None) instead of raising 401.
    """

    def authenticate(self, request, key):
        try:
            return super().authenticate(request, key)
        except Exception:
            return None


class SmartSearchAssetSchema(AssetSchema):
    """
    Extends the base AssetSchema to include the is_base_asset flag for the frontend.
    """

    is_base_asset: bool


@router.post(
    "/analyze", auth=[JWTAuthSoft(), lambda r: True], response=AnalysisResponse
)
def analyze_portfolio(request, payload: PortfolioIn):
    """
    Generates an LLM-powered analysis of the portfolio.
    Calculates metrics on the fly to ensure context is accurate.
    """
    holdings_data = [{"ticker": h.ticker, "weight": h.weight} for h in payload.holdings]

    # 1. Run Calculation Engine
    try:
        metrics_result = calculate_portfolio_metrics(
            holdings_data, start_date=payload.start_date
        )

        if "error" in metrics_result:
            return {
                "analysis": f"Could not analyze portfolio: {metrics_result['error']}"
            }

    except ValueError as e:
        return {"analysis": f"Error validating portfolio: {str(e)}"}

    # 2. Run LangGraph
    inputs = {
        "holdings": holdings_data,
        "metrics": metrics_result.get("metrics", {}),
    }
    result = portfolio_graph.invoke(inputs)

    return {"analysis": result.get("analysis", "No analysis generated.")}


@router.post(
    "/smart-search",
    auth=[JWTAuthSoft(), lambda r: True],
    response=List[SmartSearchAssetSchema],
)
def smart_search(request, payload: SmartSearchRequest):
    """
    Uses LLM to convert a natural language description into a vector search query.
    """
    # Determine auth status - guests only see base assets
    is_authenticated = request.auth is not True

    # 1. Optimize Query via LangGraph
    result = search_graph.invoke({"user_prompt": payload.prompt})
    optimized_query = result.get("optimized_query", payload.prompt)

    # 2. Perform Standard Semantic Search
    model = get_embedding_model()
    query_vector = model.encode(optimized_query).tolist()

    queryset = Asset.objects.filter(embedding__isnull=False)

    if not is_authenticated:
        queryset = queryset.filter(is_base_asset=True)

    # Sort: Base Assets first, then by semantic distance
    qs = queryset.alias(distance=CosineDistance("embedding", query_vector)).order_by(
        "-is_base_asset", "distance"
    )[: payload.limit]

    return qs
