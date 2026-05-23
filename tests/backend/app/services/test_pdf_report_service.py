from datetime import datetime

from app.services import pdf_report_service


def test_create_report_data_normalizes_risk_fields_and_previous_prediction():
    report = pdf_report_service.create_report_data(
        prediction={
            "prediction_id": 7,
            "full_name": "Test Patient",
            "predicted_cost": 15000.0,
            "created_at": datetime(2026, 1, 1, 10, 0),
        },
        patient_data={
            "snils": "123-456-789 01",
            "phone": None,
            "address": "test address",
            "age": 45,
            "gender_label": "Male",
            "bmi": 31.2,
            "daily_steps": 4000,
            "sleep_hours": 6.5,
            "stress_level": 8,
            "hospital_admissions": 1,
            "medication_count": 2,
            "smoker": True,
            "diabetes": False,
            "hypertension": True,
            "heart_disease": False,
            "asthma": False,
        },
        percentile=96.0,
        previous_prediction={"id": 4, "predicted_cost": 12000.0, "created_at": "2026-01-01T09:00:00"},
        top_factors=[{"feature_name": "bmi", "impact": 70, "direction": "increase", "shap_value": 2.5}],
        risk_score=0.96,
        final_recommendation="Manual recommendation",
    )

    assert report["report_id"] == 7
    assert report["risk_category"] == "Экстремальный риск (топ-5%)"
    assert report["patient_data"]["bmi_interpret"] == "Ожирение"
    assert report["patient_data"]["steps_status"] == "недостаточно"
    assert report["patient_data"]["sleep_interpret"] == "ниже нормы"
    assert report["patient_data"]["stress_interpret"] == "высокий"
    assert report["patient_data"]["active_risks"] == ["Курение", "Гипертония"]
    assert report["top_factors"][0]["name"] == "ИМТ"
    assert "рост" in report["trend_message"]


def test_format_helpers_are_tolerant_to_invalid_values():
    assert pdf_report_service.safe_float("bad", 2.5) == 2.5
    assert pdf_report_service.safe_int(None, 3) == 3
    assert pdf_report_service.format_money(1234.5) == "1 234.50"
    assert pdf_report_service.format_datetime("not-a-date") == "not-a-date"


def test_normalizers_handle_empty_and_non_dict_inputs():
    assert pdf_report_service.normalize_top_factors(None) == []
    assert pdf_report_service.normalize_top_factors({"feature": "sleep_hours"}) == [
        {"feature": "sleep_hours", "name": "Часы сна"}
    ]
    assert pdf_report_service.normalize_top_factors(["bad"]) == []
    assert pdf_report_service.normalize_previous_prediction("bad") is None


def test_export_report_to_pdf_bytes_returns_bytes():
    report = pdf_report_service.create_report_data(
        prediction={"prediction_id": 1, "full_name": "Test", "predicted_cost": 1000.0},
        patient_data={"age": 30, "bmi": 22, "daily_steps": 9000, "sleep_hours": 8, "stress_level": 3},
        percentile=40.0,
    )

    pdf_bytes = pdf_report_service.export_report_to_pdf_bytes(report)

    assert pdf_bytes.startswith(b"%PDF")
