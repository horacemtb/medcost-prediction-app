from pathlib import Path

import pandas as pd
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["ml"])

_DATASET_PATH = Path("/app/app/routers/medical_cost_prediction_dataset.csv")
_cached_predictions: list[float] | None = None


def _get_predictions() -> list[float]:
    global _cached_predictions
    if _cached_predictions is None:
        df = pd.read_csv(_DATASET_PATH)
        _cached_predictions = [float(v) for v in df["annual_medical_cost"].tolist()]
    return _cached_predictions


def calculate_percentile(predicted_cost: float) -> float:
    predictions = _get_predictions()
    if not predictions:
        return 50.0
    return (sum(1 for p in predictions if p < predicted_cost) / len(predictions)) * 100


@router.post("/percentile")
async def percentile_from_dataset(prediction_data: dict):
    """Рассчитать перцентиль на основе тренировочного датасета."""
    predicted_cost = float(prediction_data.get("predicted_cost", 0) or 0)
    percentile = calculate_percentile(predicted_cost)
    return {"percentile": percentile}
