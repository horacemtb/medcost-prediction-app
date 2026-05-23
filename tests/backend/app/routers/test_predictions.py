from datetime import datetime, timedelta
from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.models import Patient, PredictionRecord, RiskFactor
from app.routers import predictions


class FakeMlService:
    def predict(self, _payload):
        return 12345.0

    def explain_top_factors(self, _payload, top_k=3):
        return [
            {
                "feature_name": "bmi",
                "feature_value": "27.5",
                "shap_value": 1.25,
                "direction": "increase",
            },
            {
                "feature_name": "sleep_hours",
                "feature_value": "7.0",
                "shap_value": -0.4,
                "direction": "decrease",
            },
        ][:top_k]


class Payload:
    def __init__(self, **data):
        self._data = data
        for key, value in data.items():
            setattr(self, key, value)

    def model_dump(self, include=None, **_kwargs):
        if include is None:
            return dict(self._data)
        return {key: value for key, value in self._data.items() if key in include}


def prediction_payload(**overrides):
    data = {
        "full_name": "Test Patient",
        "snils": "123-456-789 01",
        "phone": "+79001234567",
        "address": "test address",
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
    }
    data.update(overrides)
    return Payload(**data)


def add_patient(db, snils="12345678901", full_name="Test Patient"):
    patient = Patient(
        full_name=full_name,
        snils=snils,
        phone="+79001234567",
        address="test address",
    )
    db.add(patient)
    db.flush()
    return patient


def add_prediction_record(db, patient=None, predicted_cost=10000.0, created_at=None):
    patient = patient or add_patient(db)
    record = PredictionRecord(
        full_name=patient.full_name,
        patient_id=patient.id,
        age=45,
        gender=1,
        bmi=27.5,
        smoker=False,
        diabetes=False,
        hypertension=False,
        heart_disease=False,
        asthma=False,
        physical_activity_level="Medium",
        daily_steps=6000,
        sleep_hours=7.0,
        stress_level=4,
        doctor_visits_per_year=2,
        hospital_admissions=0,
        medication_count=1,
        city_type="Urban",
        previous_year_cost=1200.0,
        predicted_cost=predicted_cost,
        created_at=created_at or datetime.utcnow(),
    )
    db.add(record)
    db.flush()
    return record


def test_create_prediction_creates_patient_record_and_response(db_session):
    payload = prediction_payload()

    with patch.object(predictions, "get_ml_service", return_value=FakeMlService()):
        response = predictions.create_prediction(payload, db_session)

    patient = db_session.query(Patient).one()
    record = db_session.query(PredictionRecord).one()
    assert patient.snils == "12345678901"
    assert record.patient_id == patient.id
    assert response.patient_id == patient.id
    assert response.predicted_cost == 12345.0


def test_create_prediction_updates_existing_patient_contact_data(db_session):
    patient = add_patient(db_session, full_name="Old Name")
    db_session.commit()

    with patch.object(predictions, "get_ml_service", return_value=FakeMlService()):
        response = predictions.create_prediction(
            prediction_payload(full_name="New Name", phone="   ", address=None),
            db_session,
        )

    db_session.refresh(patient)
    assert response.patient_id == patient.id
    assert patient.full_name == "New Name"
    assert patient.phone is None
    assert patient.address is None


def test_get_prediction_factors_uses_existing_factors(db_session):
    record = add_prediction_record(db_session)
    db_session.add(
        RiskFactor(
            prediction_id=record.id,
            feature_name="bmi",
            feature_value="27.5",
            shap_value=2.0,
            rank=1,
        )
    )
    db_session.commit()

    result = predictions.get_prediction_factors(record.id, db_session)

    assert result[0].feature_name == "bmi"
    assert result[0].direction == "increase"


def test_get_prediction_factors_builds_and_persists_missing_factors(db_session):
    record = add_prediction_record(db_session)
    db_session.commit()

    with patch.object(predictions, "get_ml_service", return_value=FakeMlService()):
        result = predictions.get_prediction_factors(record.id, db_session)

    persisted = db_session.query(RiskFactor).order_by(RiskFactor.rank).all()
    assert [factor.feature_name for factor in result] == ["bmi", "sleep_hours"]
    assert [factor.feature_name for factor in persisted] == ["bmi", "sleep_hours"]


def test_get_prediction_details_returns_patient_and_risk_factors(db_session):
    patient = add_patient(db_session)
    record = add_prediction_record(db_session, patient=patient)
    db_session.add(
        RiskFactor(
            prediction_id=record.id,
            feature_name="bmi",
            feature_value="27.5",
            shap_value=-1.0,
            rank=1,
        )
    )
    db_session.commit()

    details = predictions.get_prediction_details(record.id, db_session)

    assert details.prediction_id == record.id
    assert details.snils == "123-456-789 01"
    assert details.risk_factors[0].direction == "decrease"


def test_get_prediction_assessment_maps_percentile_to_recommendation(db_session):
    record = add_prediction_record(db_session)
    db_session.commit()

    with patch.object(predictions, "calculate_percentile", return_value=96.0):
        assessment = predictions.get_prediction_assessment(record.id, db_session)

    assert assessment.risk_category == "Экстремальный риск (топ-5%)"
    assert "Не рекомендуется" in assessment.recommendation_title


def test_recalculate_clears_existing_patient_contact_fields(db_session):
    patient = add_patient(db_session)
    record = add_prediction_record(db_session, patient=patient)
    db_session.commit()

    with patch.object(predictions, "get_ml_service", return_value=FakeMlService()):
        response = predictions.recalculate_prediction(
            prediction_payload(phone="   ", address=None),
            record.id,
            db_session,
        )

    db_session.refresh(patient)
    assert response.patient_id == patient.id
    assert patient.phone is None
    assert patient.address is None


def test_recalculate_rejects_missing_snils(db_session):
    record = add_prediction_record(db_session)
    db_session.commit()

    with pytest.raises(HTTPException) as exc_info:
        predictions.recalculate_prediction(
            prediction_payload(snils=None, phone=None, address=None),
            record.id,
            db_session,
        )

    assert exc_info.value.status_code == 422


def test_history_filters_by_name_snils_and_prediction_id(db_session):
    patient = add_patient(db_session, snils="12345678901", full_name="Alice Smith")
    another = add_patient(db_session, snils="98765432109", full_name="Bob Brown")
    first = add_prediction_record(db_session, patient=patient, created_at=datetime.utcnow() - timedelta(days=1))
    second = add_prediction_record(db_session, patient=another)
    db_session.commit()

    by_name = predictions.get_history(search="Alice", limit=100, db=db_session)
    by_snils = predictions.get_history(search="123-456-789 01", limit=100, db=db_session)
    by_id = predictions.get_history(search=str(second.id), limit=100, db=db_session)

    assert by_name.total == 1
    assert by_name.items[0].id == first.id
    assert by_snils.items[0].snils == "123-456-789 01"
    assert by_id.items[0].id == second.id


def test_delete_prediction_removes_record(db_session):
    record = add_prediction_record(db_session)
    db_session.commit()

    response = predictions.delete_prediction(record.id, db_session)

    assert response.message == f"Prediction {record.id} deleted"
    assert db_session.query(PredictionRecord).count() == 0


def test_missing_prediction_endpoints_return_404(db_session):
    with pytest.raises(HTTPException) as exc_info:
        predictions.get_prediction_details(404, db_session)

    assert exc_info.value.status_code == 404
