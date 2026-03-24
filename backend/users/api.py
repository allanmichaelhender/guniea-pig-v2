from ninja import Router
from django.contrib.auth.models import User
from django.db import IntegrityError
from ninja_jwt.routers.obtain import obtain_pair_router
from ninja_jwt.routers.verify import verify_router
from .schemas import UserCreate, UserOut

router = Router()

# Mount JWT routes: /api/users/token/pair, /api/users/token/refresh, etc.
router.add_router("/token", obtain_pair_router)
router.add_router("/token", verify_router)


@router.post("/register", response={201: UserOut, 400: dict}, auth=None)
def register(request, payload: UserCreate):
    try:
        # create_user handles password hashing automatically
        user = User.objects.create_user(
            username=payload.username,
            password=payload.password,
        )
        return 201, user
    except IntegrityError:
        return 400, {"message": "Username already exists"}
