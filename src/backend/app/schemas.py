from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class PredictionInput(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    age: int = Field(..., ge=18, le=100)
    gender: Literal[0, 1]
    bmi: float = Field(..., ge=10, le=60)
    smoker: bool
    diabetes: bool
    hypertension: bool
    heart_disease: bool
    asthma: bool
    physical_activity_level: Literal["Low", "Medium", "High"]
    daily_steps: int = Field(..., ge=0, le=50000)
    sleep_hours: float = Field(..., ge=0, le=24)
    stress_level: int = Field(..., ge=1, le=10)
    doctor_visits_per_year: int = Field(..., ge=0, le=100)
    hospital_admissions: int = Field(..., ge=0, le=50)
    medication_count: int = Field(..., ge=0, le=100)
    city_type: Literal["Urban", "Semi-Urban", "Rural"]
    previous_year_cost: float = Field(..., ge=0)


class PredictionResponse(BaseModel):
    prediction_id: int
    full_name: str
    predicted_cost: float
    created_at: datetime


class RecalculatePredictionResponse(BaseModel):
    prediction_id: int
    full_name: str
    old_predicted_cost: float
    predicted_cost: float
    created_at: datetime


class RiskFactorResponse(BaseModel):
    feature_name: str
    feature_value: str
    shap_value: float
    direction: str


class PredictionDetailsResponse(BaseModel):
    prediction_id: int
    full_name: str
    age: int
    gender: int
    bmi: float
    smoker: bool
    diabetes: bool
    hypertension: bool
    heart_disease: bool
    asthma: bool
    physical_activity_level: str
    daily_steps: int
    sleep_hours: float
    stress_level: int
    doctor_visits_per_year: int
    hospital_admissions: int
    medication_count: int
    city_type: str
    previous_year_cost: float
    predicted_cost: float
    created_at: datetime
    risk_factors: list[RiskFactorResponse]


class PredictionHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    age: int
    gender: int
    predicted_cost: float
    previous_year_cost: float
    created_at: datetime


class HistoryResponse(BaseModel):
    items: list[PredictionHistoryItem]
    total: int


class DeleteResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
