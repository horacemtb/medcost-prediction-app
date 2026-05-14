from pathlib import Path
import numpy as np
import pandas as pd
from fastapi import APIRouter

from ..database import SessionLocal
from ..models import SyntheticCohort

router = APIRouter(prefix="/api", tags=["ml"])


_DATASET_PATH = Path(__file__).resolve().parents[0] / "medical_cost_prediction_dataset.csv"
_cached_predictions: np.ndarray | None = None


def _get_predictions() -> np.ndarray:
    global _cached_predictions

    if _cached_predictions is None:
        
        if _DATASET_PATH.exists():
            df = pd.read_csv(_DATASET_PATH)
            predictions = (
                pd.to_numeric(df["annual_medical_cost"], errors="coerce")
                .dropna()
                .to_numpy(dtype=float)
            )
        else:
            session = SessionLocal()
            try:
                rows = session.query(SyntheticCohort.annual_medical_cost).filter(
                    SyntheticCohort.annual_medical_cost != None
                ).all()
                vals = [float(r[0]) for r in rows] if rows else []
                predictions = np.array(vals, dtype=float)
            finally:
                session.close()

        
        if isinstance(predictions, np.ndarray):
            arr = predictions.astype(float)
        else:
            arr = np.array(predictions, dtype=float)

        if arr.size:
            _cached_predictions = np.sort(arr)
        else:
            _cached_predictions = np.array([], dtype=float)

    return _cached_predictions


def calculate_percentile(predicted_cost: float) -> float:
    predictions = _get_predictions()

    if predictions.size == 0:
        return 50.0

    count_less = np.searchsorted(
        predictions,
        predicted_cost,
        side="left",
    )

    return float((count_less / predictions.size) * 100)


@router.post("/percentile")
def percentile_from_dataset(prediction_data: dict):
    """
    Рассчитать процентиль на основе тренировочного датасета.
    """
    predicted_cost = float(prediction_data.get("predicted_cost", 0) or 0)
    percentile = calculate_percentile(predicted_cost)

    return {"percentile": percentile}