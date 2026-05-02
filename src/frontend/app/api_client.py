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

def get_dataset_percentile(predicted_cost: float) -> dict:
    response = requests.post(
        f"{API_BASE_URL}/api/percentile", json={"predicted_cost": predicted_cost}, timeout=30)
    response.raise_for_status()
    return response.json()

def get_last_prediction_by_name(full_name: str, current_id: int = None) -> dict:
    """Получить предыдущий прогноз пациента по ФИО (исключая текущий)"""
    try:
        history = get_history(search=full_name)
        items = history.get("items", [])
        
        if not items:
            return None
        
        # Сортируем по дате (новые сначала)
        items_sorted = sorted(items, key=lambda x: x.get('created_at', ''), reverse=True)
        # Ищем первую запись, которая не равна текущей
        for item in items_sorted:
            if item.get('id') != current_id:
                return item
        
        return None
            
    except Exception as e:
        print(f"Ошибка получения истории: {e}")
        return None