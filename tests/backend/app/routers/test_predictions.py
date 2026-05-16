import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


BACKEND_ROOT = Path(__file__).resolve().parents[4] / "src" / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app.database import Base
from app.models import Patient, PredictionRecord
from app.routers import predictions


class FakeMlService:
    def predict(self, _payload):
        return 12345.0

    def explain_top_factors(self, _payload, top_k=3):
        return []


class Payload:
    def __init__(self, **data):
        self._data = data
        for key, value in data.items():
            setattr(self, key, value)

    def model_dump(self, **_kwargs):
        return dict(self._data)


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


def prediction_record(patient_id=None):
    return PredictionRecord(
        full_name="Test Patient",
        patient_id=patient_id,
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
        predicted_cost=10000.0,
    )


class PredictionRecalculatePatientTest(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_recalculate_clears_existing_patient_contact_fields(self):
        patient = Patient(
            full_name="Test Patient",
            snils="12345678901",
            phone="+79001234567",
            address="test address",
        )
        self.db.add(patient)
        self.db.flush()
        record = prediction_record(patient_id=patient.id)
        self.db.add(record)
        self.db.commit()

        payload = prediction_payload(phone="   ", address=None)

        with patch.object(predictions, "get_ml_service", return_value=FakeMlService()):
            response = predictions.recalculate_prediction(payload, record.id, self.db)

        self.db.refresh(patient)
        self.assertEqual(response.patient_id, patient.id)
        self.assertIsNone(patient.phone)
        self.assertIsNone(patient.address)

    def test_recalculate_unlinks_patient_when_snils_is_removed(self):
        patient = Patient(
            full_name="Test Patient",
            snils="12345678901",
            phone="+79001234567",
            address="test address",
        )
        self.db.add(patient)
        self.db.flush()
        record = prediction_record(patient_id=patient.id)
        self.db.add(record)
        self.db.commit()

        payload = prediction_payload(snils=None, phone=None, address=None)

        with patch.object(predictions, "get_ml_service", return_value=FakeMlService()):
            response = predictions.recalculate_prediction(payload, record.id, self.db)

        self.db.refresh(record)
        self.assertIsNone(response.patient_id)
        self.assertIsNone(record.patient_id)


if __name__ == "__main__":
    unittest.main()
