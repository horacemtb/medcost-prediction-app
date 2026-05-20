from fastapi import APIRouter, Query

from ..services.dadata_service import suggest_address

router = APIRouter(prefix="/api/dadata", tags=["dadata"])


@router.get("/suggestions")
def get_suggestions(
    query: str = Query(..., min_length=1),
    count: int = Query(default=5, ge=1, le=10),
):
    suggestions = suggest_address(query, count=count)
    return {"suggestions": suggestions}