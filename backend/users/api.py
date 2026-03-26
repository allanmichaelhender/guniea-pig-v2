from typing import Optional
from ninja import Router, Schema
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import IntegrityError
from ninja_jwt.routers.obtain import obtain_pair_router
from ninja_jwt.routers.verify import verify_router
from ninja_jwt.tokens import RefreshToken

router = Router(tags=["users"])

# Mount JWT routes: /api/users/token/pair, /api/users/token/refresh, etc.
router.add_router("/token", obtain_pair_router)
router.add_router("/token", verify_router)


class AuthIn(Schema):
    username: str
    password: str
    email: Optional[str] = None


@router.post("/register", auth=None)
def register(request, data: AuthIn):
    try:
        user = User.objects.create_user(
            username=data.username, password=data.password, email=data.email or ""
        )
        refresh = RefreshToken.for_user(user)
        return {"token": str(refresh.access_token), "username": user.username}
    except IntegrityError:
        return 400, {"message": "Username already exists"}


@router.post("/login", auth=None)
def login(request, data: AuthIn):
    user = authenticate(username=data.username, password=data.password)
    if not user:
        return 401, {"message": "Invalid credentials"}

    refresh = RefreshToken.for_user(user)
    return {"token": str(refresh.access_token), "username": user.username}
