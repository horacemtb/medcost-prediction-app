from pathlib import Path
import logging

import pandas as pd

from ..database import SessionLocal
from ..models import SyntheticCohort

logger = logging.getLogger(__name__)

DATASET_PATH = (
    Path(__file__).resolve().parents[1]
    / "routers"
    / "medical_cost_prediction_dataset.csv"
)


def load_synthetic_cohort() -> None:
    if not DATASET_PATH.exists():
        logger.warning(
            "medical_cost_prediction_dataset.csv not found. "
            "Synthetic cohort was not loaded."
        )
        return

    session = SessionLocal()

    try:
        exists = session.query(SyntheticCohort).first()

        if exists:
            logger.info("Synthetic cohort already exists in database")
            return

        df = pd.read_csv(DATASET_PATH)

        for _, row in df.iterrows():
            item = SyntheticCohort(
                age=int(row.get("age")) if not pd.isna(row.get("age")) else None,
                gender=str(row.get("gender")) if not pd.isna(row.get("gender")) else None,
                bmi=float(row.get("bmi")) if not pd.isna(row.get("bmi")) else None,
                smoker=(
                    str(row.get("smoker")).strip().lower() in ["yes", "true", "1", "y"]
                )
                if not pd.isna(row.get("smoker"))
                else None,
                diabetes=(int(row.get("diabetes")) == 1)
                if not pd.isna(row.get("diabetes"))
                else None,
                hypertension=(int(row.get("hypertension")) == 1)
                if not pd.isna(row.get("hypertension"))
                else None,
                heart_disease=(int(row.get("heart_disease")) == 1)
                if not pd.isna(row.get("heart_disease"))
                else None,
                asthma=(int(row.get("asthma")) == 1)
                if not pd.isna(row.get("asthma"))
                else None,
                physical_activity_level=row.get("physical_activity_level")
                if not pd.isna(row.get("physical_activity_level"))
                else None,
                daily_steps=int(row.get("daily_steps"))
                if not pd.isna(row.get("daily_steps"))
                else None,
                sleep_hours=float(row.get("sleep_hours"))
                if not pd.isna(row.get("sleep_hours"))
                else None,
                stress_level=int(row.get("stress_level"))
                if not pd.isna(row.get("stress_level"))
                else None,
                doctor_visits_per_year=int(row.get("doctor_visits_per_year"))
                if not pd.isna(row.get("doctor_visits_per_year"))
                else None,
                hospital_admissions=int(row.get("hospital_admissions"))
                if not pd.isna(row.get("hospital_admissions"))
                else None,
                medication_count=int(row.get("medication_count"))
                if not pd.isna(row.get("medication_count"))
                else None,
                city_type=row.get("city_type")
                if not pd.isna(row.get("city_type"))
                else None,
                previous_year_cost=float(row.get("previous_year_cost"))
                if not pd.isna(row.get("previous_year_cost"))
                else None,
                annual_medical_cost=float(row.get("annual_medical_cost"))
                if not pd.isna(row.get("annual_medical_cost"))
                else None,
            )

            session.add(item)

        session.commit()

        logger.info("Synthetic cohort successfully loaded")

    finally:
        session.close()