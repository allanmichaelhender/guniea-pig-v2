from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from ninja import Router, Schema
from ninja_jwt.tokens import RefreshToken

router = Router(tags=["users"])


class AuthIn(Schema):
    username: str
    password: str
    email: str = None


@router.post("/register")
def register(request, data: AuthIn):
    if User.objects.filter(username=data.username).exists():
        return 400, {"message": "User already exists"}

    user = User.objects.create_user(
        username=data.username, password=data.password, email=data.email or ""
    )

    refresh = RefreshToken.for_user(user)
    return {"token": str(refresh.access_token), "username": user.username}


@router.post("/login")
def login(request, data: AuthIn):
    user = authenticate(username=data.username, password=data.password)
    if not user:
        return 401, {"message": "Invalid credentials"}

    refresh = RefreshToken.for_user(user)
    return {"token": str(refresh.access_token), "username": user.username}
