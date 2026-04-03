from typing import List, Optional, Dict, Union, Any
from datetime import date, timedelta
from ninja import Schema
from pydantic import BaseModel, field_validator, Field
import math


class HoldingSchema(Schema):
    ticker: str
    weight: float


def default_start_date():
    return date.today() - timedelta(days=365 * 5)


class PortfolioIn(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = Field(
        default_factory=default_start_date
    )  # Default factory means we call on a new row being created, default would be call on model creation
    holdings: List[HoldingSchema]

    @field_validator("holdings")
    @classmethod
    def validate_weights(cls, v):
        if not v:
            raise ValueError("Portfolio must have at least one holding")

        total_weight = sum(h.weight for h in v)

        # Use math.isclose for a cleaner precision check
        if not math.isclose(total_weight, 1.0, rel_tol=1e-2):
            raise ValueError(f"Weights must sum to 1.0 (got {total_weight:.2f})")
        return v


class PortfolioOut(PortfolioIn):
    id: int
    is_public: bool

    # Flattened Metrics for easy frontend consumption
    annualized_return: Optional[float] = None
    volatility: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    performance_history: Optional[List[Dict[str, Any]]] = None


class SimulationResponse(Schema):
    metrics: Dict[str, float]
    performance_chart: List[Dict[str, Any]]
    simulation_metadata: Dict[str, Any]
    narrative: Optional[str] = None
