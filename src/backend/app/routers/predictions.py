from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
import re
from ..database import get_db
from ..models import PredictionRecord, RiskFactor, Patient
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

PREDICTION_EXAMPLE = {
    "full_name": "Иван Иванов",
    "age": 45,
    "gender": 1,
    "bmi": 27.5,
    "smoker": False,
    "diabetes": False,
    "hypertension": False,
    "heart_disease": False,
    "asthma": False,
    "physical_activity_level": "Medium",
    "daily_steps": 6000,
    "sleep_hours": 7.0,
    "stress_level": 4,
    "doctor_visits_per_year": 2,
    "hospital_admissions": 0,
    "medication_count": 1,
    "city_type": "Urban",
    "previous_year_cost": 1200.0,
    "snils": "123-456-789 00",
    "phone": "+7-900-000-00-00",
    "address": "г. Москва",
}

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

def normalize_snils(snils: str | None) -> str | None:
    if not snils:
        return None
    digits = re.sub(r"\D", "", snils)
    if len(digits) != 11:
        return None
    return digits


def format_snils(snils: str | None) -> str | None:
    digits = normalize_snils(snils)
    if digits is None:
        return snils
    return f"{digits[:3]}-{digits[3:6]}-{digits[6:9]} {digits[9:]}"


def _clean_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _apply_patient_data(patient: Patient, payload: PredictionInput) -> None:
    patient.full_name = payload.full_name
    patient.phone = _clean_optional_text(payload.phone)
    patient.address = _clean_optional_text(payload.address)


def _resolve_patient(payload: PredictionInput, db: Session) -> Patient | None:
    snils = normalize_snils(payload.snils)
    if not snils:
        return None

    patient = db.query(Patient).filter(Patient.snils == snils).first()
    if patient is None:
        patient = Patient(
            full_name=payload.full_name,
            snils=snils,
            phone=_clean_optional_text(payload.phone),
            address=_clean_optional_text(payload.address),
        )
        db.add(patient)
        db.flush()
    else:
        _apply_patient_data(patient, payload)

    return patient

@router.get("/health")
def healthcheck():
    return {"status": "ok"}


@router.post("/predict", response_model=PredictionResponse)
def create_prediction(
    payload: PredictionInput = Body(
        ...,
        example=PREDICTION_EXAMPLE,
    ),
    db: Session = Depends(get_db),
):
    patient = _resolve_patient(payload, db)
    
    ml_service = get_ml_service()
    feature_payload = payload.model_dump(include=set(FEATURE_FIELDS))
    predicted_cost = ml_service.predict(feature_payload)

    
    record_payload = {k: v for k, v in payload.model_dump().items() if k in set(FEATURE_FIELDS + ["full_name", "previous_year_cost"]) }
    record = PredictionRecord(
        **record_payload,
        predicted_cost=predicted_cost,
        patient_id=patient.id if patient else None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return PredictionResponse(
        prediction_id=record.id,
        full_name=record.full_name,
        predicted_cost=record.predicted_cost,
        patient_id=record.patient_id,
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
    patient = record.patient

    return PredictionDetailsResponse(
        prediction_id=record.id,
        patient_id=record.patient_id,
        full_name=record.full_name,
        snils=format_snils(patient.snils) if patient else None,
        phone=patient.phone if patient else None,
        address=patient.address if patient else None,
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
    patient = _resolve_patient(payload, db)
    record.patient_id = patient.id if patient is not None else None
    
    for key, value in payload_data.items():
        if key in set(FEATURE_FIELDS + ["full_name", "previous_year_cost"]):
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
        patient_id=record.patient_id,
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
