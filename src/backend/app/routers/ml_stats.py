from fastapi import APIRouter
import pandas as pd
import numpy as np
from pathlib import Path

router = APIRouter(prefix="/api", tags=["ml"]) 

@router.post("/percentile")
async def percentile_from_dataset(prediction_data: dict):
    """Рассчитать перцентиль на основе тренировочного датасета"""
    CURRENT_DIR = Path(__file__).parent  # src/backend/app/routers/
    # Загружаем предсказания из датасета (кешируем)
    if not hasattr(percentile_from_dataset, "cached_predictions"):
        df = pd.read_csv("/app/app/routers/medical_cost_prediction_dataset.csv")
        
        percentile_from_dataset.cached_predictions = df['annual_medical_cost'].tolist()

    
    predicted_cost = prediction_data.get('predicted_cost', 0)
    predictions = percentile_from_dataset.cached_predictions
    
    percentile = (sum(1 for p in predictions if p < predicted_cost) / len(predictions)) * 100
    
    return {"percentile": percentile}