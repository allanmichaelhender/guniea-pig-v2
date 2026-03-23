from typing import List, Optional
from ninja import Schema
from pydantic import validator


class HoldingSchema(Schema):
    ticker: str
    weight: float


class PortfolioIn(Schema):
    name: str
    description: Optional[str] = None
    holdings: List[HoldingSchema]

    @validator("holdings")
    def validate_weights(cls, v):
        if not v:
            raise ValueError("Portfolio must have at least one holding")

        total_weight = sum(h.weight for h in v)
        # Allow small float error margin (0.9999 - 1.0001)
        if not (0.99 <= total_weight <= 1.01):
            raise ValueError(f"Weights must sum to 1.0 (got {total_weight:.2f})")
        return v


class PortfolioOut(PortfolioIn):
    id: int
    is_public: bool
