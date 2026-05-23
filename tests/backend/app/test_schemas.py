import pytest
from pydantic import ValidationError

from app.schemas import PredictionInput


def valid_payload(**overrides):
    data = {
        "full_name": "  Test   Patient  ",
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
    return data


def test_prediction_input_normalizes_full_name():
    payload = PredictionInput(**valid_payload())

    assert payload.full_name == "Test Patient"


@pytest.mark.parametrize(
    ("field_name", "value"),
    [
        ("age", 17),
        ("age", 101),
        ("bmi", 9.9),
        ("bmi", 60.1),
        ("stress_level", 0),
        ("stress_level", 11),
        ("daily_steps", -1),
        ("sleep_hours", 24.1),
        ("doctor_visits_per_year", 101),
        ("hospital_admissions", 51),
        ("medication_count", 101),
        ("previous_year_cost", -1.0),
    ],
)
def test_prediction_input_rejects_out_of_range_values(field_name, value):
    with pytest.raises(ValidationError):
        PredictionInput(**valid_payload(**{field_name: value}))


@pytest.mark.parametrize("snils", ["123", "123-456-789 0a", "123456789012"])
def test_prediction_input_rejects_invalid_snils(snils):
    with pytest.raises(ValidationError):
        PredictionInput(**valid_payload(snils=snils))


@pytest.mark.parametrize(
    ("field_name", "value"),
    [
        ("gender", 2),
        ("physical_activity_level", "Extreme"),
        ("city_type", "Village"),
    ],
)
def test_prediction_input_rejects_unknown_literals(field_name, value):
    with pytest.raises(ValidationError):
        PredictionInput(**valid_payload(**{field_name: value}))
