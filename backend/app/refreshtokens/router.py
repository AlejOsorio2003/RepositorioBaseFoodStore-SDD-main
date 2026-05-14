from fastapi import APIRouter

router = APIRouter(
    prefix="/api/v1/refresh-tokens",
    tags=["refresh-tokens"]
)
