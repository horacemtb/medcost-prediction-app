import os

import requests

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")


def healthcheck() -> dict:
    response = requests.get(f"{API_BASE_URL}/api/health", timeout=10)
    response.raise_for_status()
    return response.json()


def create_prediction(payload: dict) -> dict:
    response = requests.post(f"{API_BASE_URL}/api/predict", json=payload, timeout=30)
    response.raise_for_status()
    return response.json()


def recognize_patient_form(file_name: str, file_bytes: bytes, content_type: str | None = None) -> dict:
    files = {
        "file": (
            file_name,
            file_bytes,
            content_type or "application/octet-stream",
        )
    }
    response = requests.post(f"{API_BASE_URL}/api/ocr/patient-form", files=files, timeout=60)
    response.raise_for_status()
    return response.json()


def get_factors(prediction_id: int) -> list[dict]:
    response = requests.get(f"{API_BASE_URL}/api/predictions/{prediction_id}/factors", timeout=60)
    response.raise_for_status()
    return response.json()


def get_history(search: str | None = None) -> dict:
    params = {}
    if search:
        params["search"] = search
    response = requests.get(f"{API_BASE_URL}/api/history", params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def delete_prediction(prediction_id: int) -> dict:
    response = requests.delete(f"{API_BASE_URL}/api/history/{prediction_id}", timeout=30)
    response.raise_for_status()
    return response.json()
