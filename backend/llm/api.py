from ninja import Router
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


@router.post("/analyze", auth=None, response=AnalysisResponse)
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


@router.post("/smart-search", response=List[AssetSchema])
def smart_search(request, payload: SmartSearchRequest):
    """
    Uses LLM to convert a natural language description into a vector search query.
    """
    # 1. Optimize Query via LangGraph
    result = search_graph.invoke({"user_prompt": payload.prompt})
    optimized_query = result.get("optimized_query", payload.prompt)

    # 2. Perform Standard Semantic Search with the optimized query
    # Delegate to the existing logic helper or logic pattern
    # We construct a synthetic payload to reuse the logic or just repeat it
    model = get_embedding_model()
    query_vector = model.encode(optimized_query).tolist()

    qs = (
        Asset.objects.filter(embedding__isnull=False)
        .alias(distance=CosineDistance("embedding", query_vector))
        .order_by("distance")[: payload.limit]
    )

    return qs
