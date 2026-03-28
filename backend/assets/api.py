from typing import List, Optional
from ninja import Router, Query
from assets.models import Asset
from pgvector.django import CosineDistance
from sentence_transformers import SentenceTransformer
from assets.schemas import AssetSchema, SemanticSearchSchema
from ninja_jwt.authentication import JWTAuth


router = Router(tags=["assets"])


class JWTAuthSoft(JWTAuth):
    def authenticate(self, request, key):
        try:
            return super().authenticate(request, key)
        except Exception:
            return None


class TickerSearchAssetSchema(AssetSchema):
    """Ensures is_base_asset is included for the frontend badge logic."""

    is_base_asset: bool


# Lazy-load the model to avoid overhead if this process isn't serving requests
# In a production environment, you might load this in apps.py ready() or a separate service
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model = None


def get_embedding_model():
    global _model
    if _model is None:
        print(f"Loading {MODEL_NAME} for API usage...")
        _model = SentenceTransformer(MODEL_NAME)
    return _model


@router.get("/", response=List[AssetSchema])
def list_assets(
    request, search: Optional[str] = None, limit: int = 50, offset: int = 0
):
    qs = Asset.objects.all()
    if search:
        # Basic case-insensitive matching
        qs = qs.filter(ticker__icontains=search) | qs.filter(name__icontains=search)
    return qs[offset : offset + limit]


@router.get(
    "/ticker-search",
    auth=[JWTAuthSoft(), lambda r: True],
    response=List[TickerSearchAssetSchema],
)
def search_tickers(request, q: str = Query(..., min_length=1)):
    # Determine auth status - guests only see base assets
    is_authenticated = request.auth is not True

    queryset = Asset.objects.all()
    if not is_authenticated:
        queryset = queryset.filter(is_base_asset=True)

    return queryset.filter(ticker__icontains=q).order_by("-is_base_asset", "ticker")[:5]


@router.post("/semantic-search", response=List[AssetSchema])
def semantic_search(request, payload: SemanticSearchSchema):
    """
    Performs a semantic search using pgvector cosine distance.
    """
    model = get_embedding_model()
    # Encode the user query into a vector
    query_vector = model.encode(payload.query).tolist()

    # Calculate distance and sort by nearest neighbors
    qs = (
        Asset.objects.filter(embedding__isnull=False)
        .alias(distance=CosineDistance("embedding", query_vector))
        .order_by("distance")[: payload.limit]
    )

    return qs
