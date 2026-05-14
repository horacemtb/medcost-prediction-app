from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers.ocr import router as ocr_router
from .routers.predictions import router as predictions_router
from .routers.prediction_pdf_router import router as prediction_pdf_router
from .routers.ml_stats import router as ml_router
from .routers.stats import router as stats_router
from .models import SyntheticCohort
from .database import SessionLocal
from pathlib import Path
import pandas as pd
import os
from .services.ml_service import get_ml_service

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedCost API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictions_router)
app.include_router(ml_router)
app.include_router(ocr_router)
app.include_router(prediction_pdf_router)
app.include_router(stats_router)



@app.on_event("startup")
def load_synthetic_cohort():
    
    dataset_path = Path(__file__).resolve().parents[0] / "routers" / "medical_cost_prediction_dataset.csv"
    if not dataset_path.exists():
        return

    session = SessionLocal()
    try:
        exists = session.query(SyntheticCohort).first()
        if exists:
            return

        df = pd.read_csv(dataset_path)
        for _, row in df.iterrows():
            item = SyntheticCohort(
                age=int(row.get("age")) if not pd.isna(row.get("age")) else None,
                gender=str(row.get("gender")) if not pd.isna(row.get("gender")) else None,
                bmi=float(row.get("bmi")) if not pd.isna(row.get("bmi")) else None,
                smoker=(str(row.get("smoker")).strip().lower() in ["yes", "true", "1", "y"]) if not pd.isna(row.get("smoker")) else None,
                diabetes=(int(row.get("diabetes")) == 1) if not pd.isna(row.get("diabetes")) else None,
                hypertension=(int(row.get("hypertension")) == 1) if not pd.isna(row.get("hypertension")) else None,
                heart_disease=(int(row.get("heart_disease")) == 1) if not pd.isna(row.get("heart_disease")) else None,
                asthma=(int(row.get("asthma")) == 1) if not pd.isna(row.get("asthma")) else None,
                physical_activity_level=row.get("physical_activity_level") if not pd.isna(row.get("physical_activity_level")) else None,
                daily_steps=int(row.get("daily_steps")) if not pd.isna(row.get("daily_steps")) else None,
                sleep_hours=float(row.get("sleep_hours")) if not pd.isna(row.get("sleep_hours")) else None,
                stress_level=int(row.get("stress_level")) if not pd.isna(row.get("stress_level")) else None,
                doctor_visits_per_year=int(row.get("doctor_visits_per_year")) if not pd.isna(row.get("doctor_visits_per_year")) else None,
                hospital_admissions=int(row.get("hospital_admissions")) if not pd.isna(row.get("hospital_admissions")) else None,
                medication_count=int(row.get("medication_count")) if not pd.isna(row.get("medication_count")) else None,
                city_type=row.get("city_type") if not pd.isna(row.get("city_type")) else None,
                previous_year_cost=float(row.get("previous_year_cost")) if not pd.isna(row.get("previous_year_cost")) else None,
                annual_medical_cost=float(row.get("annual_medical_cost")) if not pd.isna(row.get("annual_medical_cost")) else None,
            )
            session.add(item)
        session.commit()
    finally:
        session.close()


@app.on_event("startup")
def startup_checks():
    
    ml_fake = os.getenv("ML_FAKE", "0").lower() in ("1", "true", "yes")
    if not ml_fake:
        
        svc = get_ml_service()
        
