from ninja import NinjaAPI
from assets.api import router as assets_router

api = NinjaAPI(
    title="Guniea Pig Portfolio API",
    description="Backend for portfolio simulation and risk analytics.",
    version="1.0.0",
)

api.add_router("/assets", assets_router)
