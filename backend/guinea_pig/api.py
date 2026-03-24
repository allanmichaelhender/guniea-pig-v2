from ninja import NinjaAPI
from assets.api import router as assets_router
from users.api import router as users_router
from portfolio.api import router as portfolio_router



api = NinjaAPI(
    title="Guniea Pig Portfolio API",
    description="Backend for portfolio simulation and risk analytics.",
    version="1.0.0",
)

api.add_router("/assets", assets_router)
api.add_router("/users", users_router)
api.add_router("/portfolios", portfolio_router)