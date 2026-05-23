import pytest

from app.models import Patient, PredictionRecord, RiskFactor, SyntheticCohort
from app.routers import stats


def add_patient(db):
    patient = Patient(full_name="Test Patient", snils="12345678901")
    db.add(patient)
    db.flush()
    return patient


def prediction_record(patient_id, predicted_cost):
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
        predicted_cost=predicted_cost,
    )


def test_overview_compares_prediction_share_to_historical_90th_percentile(db_session):
    patient = add_patient(db_session)
    for cost in range(1000, 11000, 1000):
        db_session.add(
            SyntheticCohort(
                annual_medical_cost=float(cost),
                smoker=cost % 2000 == 0,
                diabetes=False,
                hypertension=False,
                heart_disease=False,
                asthma=False,
                gender="Male",
            )
        )
    for cost in [8500.0, 9200.0, 11000.0, 12000.0]:
        db_session.add(prediction_record(patient.id, cost))
    db_session.add(RiskFactor(prediction_id=1, feature_name="bmi", feature_value="27", shap_value=1.0, rank=1))
    db_session.commit()

    response = stats.overview(db_session)

    assert response["synthetic"]["count"] == 10
    assert response["predictions"]["high_cost_prediction_share"] == 75.0
    assert response["predictions"]["top_factors"] == [{"feature_name": "bmi", "count": 1}]


def test_high_cost_prediction_share_uses_historical_90th_percentile_threshold():
    synthetic_values = [float(cost) for cost in range(1000, 11000, 1000)]
    pred_values = [8500.0, 9200.0, 11000.0, 12000.0]

    share = stats._compute_high_cost_prediction_share(pred_values, synthetic_values)

    assert share == 75.0


def test_high_cost_prediction_share_returns_zero_without_enough_data():
    assert stats._compute_high_cost_prediction_share([], [1000.0, 2000.0]) == 0.0
    assert stats._compute_high_cost_prediction_share([1200.0], []) == 0.0


def test_high_cost_prediction_share_uses_single_historical_value_as_threshold():
    share = stats._compute_high_cost_prediction_share([900.0, 1100.0, 1200.0], [1000.0])

    assert share == pytest.approx(100 * 2 / 3)


def test_high_cost_prediction_share_handles_negative_values_consistently():
    share = stats._compute_high_cost_prediction_share([-20.0, 90.0, 100.0], [-100.0, 0.0, 100.0])

    assert share == pytest.approx(100 * 2 / 3)


def test_compute_histogram_handles_empty_single_and_multiple_values():
    assert stats._compute_histogram([]) == {"bins": [], "counts": []}
    assert stats._compute_histogram([5.0]) == {"bins": [5.0, 5.0], "counts": [1]}
    result = stats._compute_histogram([0.0, 10.0], bins=2)
    assert result["bins"] == [0.0, 5.0, 10.0]
    assert result["counts"] == [1, 1]
