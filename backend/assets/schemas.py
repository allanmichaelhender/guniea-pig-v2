from typing import List, Optional
from ninja import Schema

class AssetSchema(Schema):
    ticker: str
    name: Optional[str] = None
    exchange: str
    assetType: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    country: Optional[str] = None
    
    # Risk Metrics
    cluster_id: Optional[int] = None
    sigma_52: Optional[float] = None
    cluster_x: Optional[float] = None
    cluster_y: Optional[float] = None
    volatility_z_score: Optional[float] = None
    volatility_median: Optional[float] = None
    is_volatility_surge: Optional[bool] = None


class SemanticSearchSchema(Schema):
    query: str
    limit: int = 5