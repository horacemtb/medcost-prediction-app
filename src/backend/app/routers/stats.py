from collections import Counter
from statistics import median, quantiles
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PredictionRecord, RiskFactor, SyntheticCohort

router = APIRouter(prefix="/api/stats", tags=["stats"])


def _percentile(values: List[float], percentile: float) -> float:
    if not values:
        return 0.0
    if len(values) == 1:
        return float(values[0])
    percentile_index = int(percentile * 100) - 1
    return float(quantiles(values, n=100, method="inclusive")[percentile_index])


def _compute_high_cost_prediction_share(pred_values: List[float], synthetic_values: List[float]) -> float:
    if not pred_values or not synthetic_values:
        return 0.0

    synthetic_p90 = _percentile(synthetic_values, 0.9)
    high_cost_count = sum(1 for value in pred_values if value > synthetic_p90)
    return (high_cost_count / len(pred_values)) * 100


def _compute_histogram(values: List[float], bins: int = 5):
    if not values:
        return {"bins": [], "counts": []}
    vals = sorted(values)

    vmin, vmax = vals[0], vals[-1]
    if vmin == vmax:
        return {"bins": [vmin, vmax], "counts": [len(vals)]}
    width = (vmax - vmin) / bins
    edges = [vmin + i * width for i in range(bins + 1)]
    counts = [0] * bins
    for value in vals:
        if value == vmax:
            counts[-1] += 1
            continue
        idx = int((value - vmin) / width)
        if idx < 0:
            idx = 0
        if idx >= bins:
            idx = bins - 1
        counts[idx] += 1
    return {"bins": edges, "counts": counts}


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    synthetic_count = db.query(func.count(SyntheticCohort.id)).scalar() or 0
    synthetic_values = [
        row[0]
        for row in (
            db.query(SyntheticCohort.annual_medical_cost)
            .filter(SyntheticCohort.annual_medical_cost.is_not(None))
            .all()
        )
    ]
    synthetic_values = [float(value) for value in synthetic_values] if synthetic_values else []
    synthetic_avg = float(sum(synthetic_values) / len(synthetic_values)) if synthetic_values else 0.0
    synthetic_median = float(median(synthetic_values)) if synthetic_values else 0.0

    smokers = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.smoker.is_(True)).scalar() or 0
    diabetes = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.diabetes.is_(True)).scalar() or 0
    hypertension = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.hypertension.is_(True)).scalar() or 0
    heart_disease = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.heart_disease.is_(True)).scalar() or 0
    asthma = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.asthma.is_(True)).scalar() or 0

    gender_rows = db.query(SyntheticCohort.gender, func.count(SyntheticCohort.id)).group_by(SyntheticCohort.gender).all()
    gender_distribution = {gender if gender is not None else "unknown": int(count) for gender, count in gender_rows}

    synthetic_hist = _compute_histogram(synthetic_values, bins=5)

    pred_rows = [
        row[0]
        for row in (
            db.query(PredictionRecord.predicted_cost)
            .filter(PredictionRecord.predicted_cost.is_not(None))
            .all()
        )
    ]
    pred_values = [float(value) for value in pred_rows] if pred_rows else []
    predictions_count = db.query(func.count(PredictionRecord.id)).scalar() or 0
    predictions_avg = float(sum(pred_values) / len(pred_values)) if pred_values else 0.0
    predictions_median = float(median(pred_values)) if pred_values else 0.0
    high_cost_prediction_share = _compute_high_cost_prediction_share(pred_values, synthetic_values)
    predictions_hist = _compute_histogram(pred_values, bins=5)

    factor_rows = db.query(RiskFactor.feature_name).all()
    factor_list = [row[0] for row in factor_rows]
    top_factors = []
    if factor_list:
        counter = Counter(factor_list)
        top = counter.most_common(10)
        top_factors = [{"feature_name": name, "count": count} for name, count in top]

    return {
        "synthetic": {
            "count": int(synthetic_count),
            "avg_annual_medical_cost": synthetic_avg,
            "median_annual_medical_cost": synthetic_median,
            "smokers_count": int(smokers),
            "diabetes_count": int(diabetes),
            "hypertension_count": int(hypertension),
            "heart_disease_count": int(heart_disease),
            "asthma_count": int(asthma),
            "gender_distribution": gender_distribution,
            "annual_cost_histogram": synthetic_hist,
        },
        "predictions": {
            "count": int(predictions_count),
            "avg_predicted_cost": predictions_avg,
            "median_predicted_cost": predictions_median,
            "high_cost_prediction_share": high_cost_prediction_share,
            "predicted_cost_histogram": predictions_hist,
            "top_factors": top_factors,
        },
    }
