import os
from typing import List, Dict, Any, TypedDict, Optional
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from assets.models import Asset


def get_llm():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("WARNING: GROQ_API_KEY not found. LLM features will fail.")
        return None

    return ChatGroq(
        temperature=0.5, model_name="llama-3.3-70b-versatile", api_key=api_key
    )


class PortfolioAnalysisState(TypedDict):
    holdings: List[Dict[str, Any]]  # List of {ticker, weight}
    metrics: Dict[str, Any]  # Portfolio level metrics
    asset_context: Optional[str]  # Enriched data from DB
    analysis: Optional[str]  # Final LLM output


def fetch_asset_context(state: PortfolioAnalysisState):
    holdings = state["holdings"]
    tickers = [h["ticker"] for h in holdings]

    # Fetch assets with relevant risk/sector info
    assets = Asset.objects.filter(ticker__in=tickers)
    asset_map = {a.ticker: a for a in assets}
    context_lines = []

    for h in holdings:
        ticker = h["ticker"]
        weight = (h.get("weight") or 0.0) * 100
        asset = asset_map.get(ticker)

        if asset:
            # Ensure numeric fields are not None before applying float formatting
            cx = asset.cluster_x if asset.cluster_x is not None else 0.0
            cy = asset.cluster_y if asset.cluster_y is not None else 0.0
            vz = (
                asset.volatility_z_score
                if asset.volatility_z_score is not None
                else 0.0
            )

            info = (
                f"- {ticker} ({weight:.1f}%): {asset.name}. "
                f"Sector: {asset.sector}, Industry: {asset.industry}. "
                f"Risk Cluster: {asset.cluster_id or 'N/A'} (x={cx:.2f}, y={cy:.2f}). "
                f"Vol Surge: {asset.is_volatility_surge} (Z: {vz:.2f})."
            )
        else:
            info = f"- {ticker} ({weight:.1f}%): Metadata not found."

        context_lines.append(info)

    return {"asset_context": "\n".join(context_lines)}


def generate_portfolio_narrative(state: PortfolioAnalysisState):
    llm = get_llm()
    if not llm:
        return {"analysis": "Error: LLM service not configured."}

    metrics = state["metrics"]
    context = state["asset_context"]

    # Use "or 0" inside the format block to prevent NoneType formatting errors
    prompt = f"""
    You are a sophisticated financial risk assistant for the 'Guniea Pig Portfolio' platform.
    Analyze the following portfolio simulation results.

    PORTFOLIO METRICS:
    - Annualized Return: {metrics.get("annualized_return") or 0:.2%}
    - Volatility (Sigma-52): {metrics.get("volatility") or 0:.2%}
    - Sharpe Ratio: {metrics.get("sharpe_ratio") or 0:.2f}
    - Max Drawdown: {metrics.get("max_drawdown") or 0:.2%}

    ASSET BREAKDOWN & RISK CONTEXT:
    {context}

    INSTRUCTIONS:
    1. Highlight the primary drivers of performance and risk.
    2. Identify if the portfolio is concentrated in specific sectors or "hidden risk" clusters.
    3. Note any assets currently experiencing a volatility surge.
    4. Keep the tone professional, insightful, but accessible. 
    5. Disclaimer: Remind the user this is a simulation, not financial advice.
    """

    response = llm.invoke(
        [
            SystemMessage(content="You are a helpful financial analyst."),
            HumanMessage(content=prompt),
        ]
    )

    return {"analysis": response.content}


# Build the Portfolio Graph
portfolio_builder = StateGraph(PortfolioAnalysisState)
portfolio_builder.add_node("fetch_context", fetch_asset_context)
portfolio_builder.add_node("analyze", generate_portfolio_narrative)
portfolio_builder.set_entry_point("fetch_context")
portfolio_builder.add_edge("fetch_context", "analyze")
portfolio_builder.add_edge("analyze", END)
portfolio_graph = portfolio_builder.compile()


class SmartSearchState(TypedDict):
    user_prompt: str
    optimized_query: Optional[str]


def optimize_search_query(state: SmartSearchState):
    llm = get_llm()

    # If llm is not working we return the user prompt string without changes
    if not llm:
        return {"optimized_query": state["user_prompt"]}

    prompt = f"""
    The user is searching for investment assets. Convert their description into a concise semantic search query suitable for vector embedding matching.
    User Input: "{state["user_prompt"]}"
    Output ONLY the optimized query string. Do not include quotes or explanations.
    """

    response = llm.invoke([HumanMessage(content=prompt)])
    print(response.content)
    return {"optimized_query": response.content.strip()}


search_builder = StateGraph(SmartSearchState)
search_builder.add_node("optimize", optimize_search_query)
search_builder.set_entry_point("optimize")
search_builder.add_edge("optimize", END)
search_graph = search_builder.compile()
