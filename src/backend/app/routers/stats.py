from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from statistics import median
from collections import Counter
from typing import List

from ..database import get_db
from ..models import SyntheticCohort, PredictionRecord, RiskFactor

router = APIRouter(prefix="/api/stats", tags=["stats"])


def _compute_histogram(values: List[float], bins: int = 5):
    if not values:
        return {"bins": [], "counts": []}
    vals = sorted(values)
    n = len(vals)
    if n == 0:
        return {"bins": [], "counts": []}
    
    vmin, vmax = vals[0], vals[-1]
    if vmin == vmax:
        return {"bins": [vmin, vmax], "counts": [n]}
    width = (vmax - vmin) / bins
    edges = [vmin + i * width for i in range(bins + 1)]
    counts = [0] * bins
    for v in vals:
        
        if v == vmax:
            counts[-1] += 1
            continue
        idx = int((v - vmin) / width)
        if idx < 0:
            idx = 0
        if idx >= bins:
            idx = bins - 1
        counts[idx] += 1
    return {"bins": edges, "counts": counts}


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    
    synthetic_count = db.query(func.count(SyntheticCohort.id)).scalar() or 0
    synthetic_values = [r[0] for r in db.query(SyntheticCohort.annual_medical_cost).filter(SyntheticCohort.annual_medical_cost != None).all()]
    synthetic_values = [float(v[0]) if isinstance(v, tuple) else float(v) for v in synthetic_values] if synthetic_values else []
    synthetic_avg = float(sum(synthetic_values) / len(synthetic_values)) if synthetic_values else 0.0
    synthetic_median = float(median(synthetic_values)) if synthetic_values else 0.0

    smokers = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.smoker == True).scalar() or 0
    diabetes = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.diabetes == True).scalar() or 0
    hypertension = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.hypertension == True).scalar() or 0
    heart_disease = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.heart_disease == True).scalar() or 0
    asthma = db.query(func.count(SyntheticCohort.id)).filter(SyntheticCohort.asthma == True).scalar() or 0

    
    gender_rows = db.query(SyntheticCohort.gender, func.count(SyntheticCohort.id)).group_by(SyntheticCohort.gender).all()
    gender_distribution = {g if g is not None else "unknown": int(cnt) for g, cnt in gender_rows}

    synthetic_hist = _compute_histogram(synthetic_values, bins=5)

    
    pred_rows = [r[0] for r in db.query(PredictionRecord.predicted_cost).filter(PredictionRecord.predicted_cost != None).all()]
    pred_values = [float(v[0]) if isinstance(v, tuple) else float(v) for v in pred_rows] if pred_rows else []
    predictions_count = db.query(func.count(PredictionRecord.id)).scalar() or 0
    predictions_avg = float(sum(pred_values) / len(pred_values)) if pred_values else 0.0
    predictions_median = float(median(pred_values)) if pred_values else 0.0
    predictions_hist = _compute_histogram(pred_values, bins=5)

    
    factor_rows = db.query(RiskFactor.feature_name).all()
    factor_list = [r[0] for r in factor_rows]
    top_factors = []
    if factor_list:
        counter = Counter(factor_list)
        top = counter.most_common(10)
        top_factors = [{"feature_name": name, "count": cnt} for name, cnt in top]

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
            "predicted_cost_histogram": predictions_hist,
            "top_factors": top_factors,
        },
    }
