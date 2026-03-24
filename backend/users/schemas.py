from ninja import Schema


class UserCreate(Schema):
    username: str
    password: str


class UserOut(Schema):
    id: int
    username: str
