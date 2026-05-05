from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import PredictionRecord, RiskFactor
from ..schemas import (
    DeleteResponse,
    HistoryResponse,
    PredictionAssessmentResponse,
    PredictionDetailsResponse,
    PredictionHistoryItem,
    PredictionInput,
    PredictionResponse,
    RiskFactorResponse,
)
from ..services.ml_service import get_ml_service
from .ml_stats import calculate_percentile

router = APIRouter(prefix="/api", tags=["predictions"])

FEATURE_FIELDS = [
    "age",
    "gender",
    "bmi",
    "smoker",
    "diabetes",
    "hypertension",
    "heart_disease",
    "asthma",
    "physical_activity_level",
    "daily_steps",
    "sleep_hours",
    "stress_level",
    "doctor_visits_per_year",
    "hospital_admissions",
    "medication_count",
    "city_type",
    "previous_year_cost",
]


def _risk_category_by_percentile(percentile: float) -> str:
    # Mirrors frontend/pdf_export.py create_report_data thresholds.
    if percentile <= 50:
        return "Низкий"
    if percentile <= 75:
        return "Стандартный"
    if percentile <= 95:
        return "Высокий риск"
    return "Экстремальный риск (топ-5%)"


def _build_recommendation(risk_profile_category: str) -> dict[str, str]:
    if risk_profile_category == "Низкий":
        return {
            "title": "Рекомендуется к страхованию по стандартному полису.",
            "description": (
                "Пациент демонстрирует низкий уровень медицинского риска. "
                "Страхование является экономически выгодным для компании."
            ),
        }
    if risk_profile_category == "Стандартный":
        return {
            "title": "Рекомендуется к страхованию с повышенными условиями.",
            "description": (
                "Пациент имеет умеренный уровень риска. "
                "Стандартное страхование требует корректировки."
            ),
        }
    if risk_profile_category == "Высокий риск":
        return {
            "title": "Рекомендуется к страхованию с повышенными условиями.",
            "description": (
                "Пациент демонстрирует уровень риска значительно выше среднего. "
                "Рекомендуется применение повышающего коэффициента к базовой премии."
            ),
        }
    return {
        "title": "Не рекомендуется к стандартному страхованию.",
        "description": (
            "Пациент относится к группе высокого медицинского риска. "
            "Стандартное страхование экономически нецелесообразно."
        ),
    }



def _build_or_create_risk_factors(record: PredictionRecord, db: Session) -> list[RiskFactorResponse]:
    if record.risk_factors:
        return [
            RiskFactorResponse(
                feature_name=f.feature_name,
                feature_value=f.feature_value,
                shap_value=f.shap_value,
                direction="increase" if f.shap_value >= 0 else "decrease",
            )
            for f in sorted(record.risk_factors, key=lambda x: x.rank)
        ]

    ml_service = get_ml_service()
    feature_payload = {field: getattr(record, field) for field in FEATURE_FIELDS}
    factors = ml_service.explain_top_factors(feature_payload, top_k=3)

    for idx, factor in enumerate(factors, start=1):
        db.add(
            RiskFactor(
                prediction_id=record.id,
                feature_name=factor["feature_name"],
                feature_value=factor["feature_value"],
                shap_value=factor["shap_value"],
                rank=idx,
            )
        )
    db.commit()

    return [RiskFactorResponse(**factor) for factor in factors]


@router.get("/health")
def healthcheck():
    return {"status": "ok"}


@router.post("/predict", response_model=PredictionResponse)
def create_prediction(payload: PredictionInput, db: Session = Depends(get_db)):
    ml_service = get_ml_service()
    feature_payload = payload.model_dump(include=set(FEATURE_FIELDS))
    predicted_cost = ml_service.predict(feature_payload)

    record = PredictionRecord(
        **payload.model_dump(),
        predicted_cost=predicted_cost,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return PredictionResponse(
        prediction_id=record.id,
        full_name=record.full_name,
        predicted_cost=record.predicted_cost,
        created_at=record.created_at,
    )


@router.get("/predictions/{prediction_id}/factors", response_model=list[RiskFactorResponse])
def get_prediction_factors(prediction_id: int, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    return _build_or_create_risk_factors(record, db)


@router.get("/predictions/{prediction_id}", response_model=PredictionDetailsResponse)
def get_prediction_details(prediction_id: int, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    factors = _build_or_create_risk_factors(record, db)

    return PredictionDetailsResponse(
        prediction_id=record.id,
        full_name=record.full_name,
        age=record.age,
        gender=record.gender,
        bmi=record.bmi,
        smoker=record.smoker,
        diabetes=record.diabetes,
        hypertension=record.hypertension,
        heart_disease=record.heart_disease,
        asthma=record.asthma,
        physical_activity_level=record.physical_activity_level,
        daily_steps=record.daily_steps,
        sleep_hours=record.sleep_hours,
        stress_level=record.stress_level,
        doctor_visits_per_year=record.doctor_visits_per_year,
        hospital_admissions=record.hospital_admissions,
        medication_count=record.medication_count,
        city_type=record.city_type,
        previous_year_cost=record.previous_year_cost,
        predicted_cost=record.predicted_cost,
        created_at=record.created_at,
        risk_factors=factors,
    )


@router.get("/predictions/{prediction_id}/assessment", response_model=PredictionAssessmentResponse)
def get_prediction_assessment(prediction_id: int, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    percentile = float(calculate_percentile(record.predicted_cost))
    category = _risk_category_by_percentile(percentile)
    recommendation = _build_recommendation(category)
    return PredictionAssessmentResponse(
        prediction_id=record.id,
        risk_category=category,
        percentile=percentile,
        recommendation_title=recommendation["title"],
        recommendation_description=recommendation["description"],
    )


@router.put("/predictions/{prediction_id}/recalculate", response_model=PredictionResponse)
def recalculate_prediction(payload: PredictionInput, prediction_id: int, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    ml_service = get_ml_service()
    payload_data = payload.model_dump()
    for key, value in payload_data.items():
        setattr(record, key, value)

    feature_payload = {field: payload_data[field] for field in FEATURE_FIELDS}
    record.predicted_cost = ml_service.predict(feature_payload)

    for factor in list(record.risk_factors):
        db.delete(factor)
    db.commit()
    db.refresh(record)
    _build_or_create_risk_factors(record, db)

    return PredictionResponse(
        prediction_id=record.id,
        full_name=record.full_name,
        predicted_cost=record.predicted_cost,
        created_at=record.created_at,
    )


@router.get("/history", response_model=HistoryResponse)
def get_history(
    search: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(PredictionRecord)
    if search:
        if search.isdigit():
            query = query.filter(
                or_(
                    PredictionRecord.id == int(search),
                    PredictionRecord.full_name.ilike(f"%{search}%"),
                )
            )
        else:
            query = query.filter(PredictionRecord.full_name.ilike(f"%{search}%"))

    total = query.with_entities(func.count(PredictionRecord.id)).scalar() or 0
    items = query.order_by(PredictionRecord.created_at.desc()).limit(limit).all()
    return HistoryResponse(
        items=[PredictionHistoryItem.model_validate(item) for item in items],
        total=total,
    )


@router.delete("/history/{prediction_id}", response_model=DeleteResponse)
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    db.delete(record)
    db.commit()
    return DeleteResponse(message=f"Prediction {prediction_id} deleted")
