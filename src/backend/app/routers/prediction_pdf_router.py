from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PredictionRecord
from ..services.pdf_report_service import create_report_data, export_report_to_pdf_bytes
from .ml_stats import calculate_percentile
from .predictions import _build_recommendation, _risk_category_by_percentile

router = APIRouter(prefix="/api", tags=["predictions"])

FEATURE_RU_LABELS = {
    "age": "Возраст",
    "gender": "Пол",
    "bmi": "ИМТ",
    "smoker": "Курение",
    "diabetes": "Диабет",
    "hypertension": "Гипертония",
    "heart_disease": "Болезни сердца",
    "asthma": "Астма",
    "physical_activity_level": "Уровень физической активности",
    "daily_steps": "Шагов в день",
    "sleep_hours": "Часы сна",
    "stress_level": "Уровень стресса",
    "doctor_visits_per_year": "Визитов к врачу в год",
    "hospital_admissions": "Госпитализаций",
    "medication_count": "Количество лекарств",
    "city_type": "Тип населенного пункта",
    "previous_year_cost": "Расходы за прошлый год",
}


def _gender_label(value: int) -> str:
    return "Мужской" if value == 1 else "Женский"


def _activity_label(value: str) -> str:
    if value == "High":
        return "Высокий"
    if value == "Low":
        return "Низкий"
    return "Средний"


def _city_label(value: str) -> str:
    if value == "Semi-Urban":
        return "Пригород"
    if value == "Rural":
        return "Сельская местность"
    return "Город"


@router.get("/predictions/{prediction_id}/pdf")
def export_prediction_pdf(prediction_id: int, db: Session = Depends(get_db)) -> Response:
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    previous = (
        db.query(PredictionRecord)
        .filter(
            PredictionRecord.full_name == record.full_name,
            PredictionRecord.id != record.id,
            PredictionRecord.created_at < record.created_at,
        )
        .order_by(PredictionRecord.created_at.desc())
        .first()
    )

    factors = sorted(record.risk_factors, key=lambda x: x.rank)[:3]
    total_abs_shap = sum(abs(f.shap_value) for f in factors) or 1.0
    top_factors = [
        {
            "name": FEATURE_RU_LABELS.get(f.feature_name, f.feature_name),
            "impact": (abs(f.shap_value) / total_abs_shap) * 100,
            "direction": "increase" if f.shap_value >= 0 else "decrease",
            "shap_value": f.shap_value,
        }
        for f in factors
    ]

    percentile = float(calculate_percentile(record.predicted_cost))
    category = _risk_category_by_percentile(percentile)
    confidence = max(0.0, min(1.0, percentile / 100))
    recommendation = _build_recommendation(category)

    report_data = create_report_data(
        prediction={
            "prediction_id": record.id,
            "full_name": record.full_name,
            "predicted_cost": record.predicted_cost,
            "created_at": record.created_at,
        },
        patient_data={
            "age": record.age,
            "gender_label": _gender_label(record.gender),
            "bmi": record.bmi,
            "physical_activity_label": _activity_label(record.physical_activity_level),
            "city_type_label": _city_label(record.city_type),
            "sleep_hours": record.sleep_hours,
            "daily_steps": record.daily_steps,
            "stress_level": record.stress_level,
            "hospital_admissions": record.hospital_admissions,
            "medication_count": record.medication_count,
            "smoker": record.smoker,
            "diabetes": record.diabetes,
            "hypertension": record.hypertension,
            "heart_disease": record.heart_disease,
            "asthma": record.asthma,
        },
        percentile=percentile,
        previous_prediction=(
            {
                "id": previous.id,
                "predicted_cost": previous.predicted_cost,
                "created_at": previous.created_at,
            }
            if previous
            else None
        ),
        top_factors=top_factors,
        risk_score=confidence,
        risk_category_label=category,
        risk_recommendation=category,
        final_recommendation=f"{recommendation['title']} {recommendation['description']}",
    )

    try:
        pdf_bytes = export_report_to_pdf_bytes(report_data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}") from exc

    stamp = datetime.now().strftime("%Y%m%d-%H%M")
    filename = f"prediction-report-{prediction_id}-{stamp}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
