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


class SemanticSearchSchema(Schema):
    query: str
    limit: int = 5