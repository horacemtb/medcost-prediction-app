from datetime import datetime
from typing import Optional, List

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class PredictionRecord(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), index=True)
    age: Mapped[int] = mapped_column(Integer)
    gender: Mapped[int] = mapped_column(Integer)
    bmi: Mapped[float] = mapped_column(Float)
    smoker: Mapped[bool] = mapped_column(Boolean)
    diabetes: Mapped[bool] = mapped_column(Boolean)
    hypertension: Mapped[bool] = mapped_column(Boolean)
    heart_disease: Mapped[bool] = mapped_column(Boolean)
    asthma: Mapped[bool] = mapped_column(Boolean)
    physical_activity_level: Mapped[str] = mapped_column(String(50))
    daily_steps: Mapped[int] = mapped_column(Integer)
    sleep_hours: Mapped[float] = mapped_column(Float)
    stress_level: Mapped[int] = mapped_column(Integer)
    doctor_visits_per_year: Mapped[int] = mapped_column(Integer)
    hospital_admissions: Mapped[int] = mapped_column(Integer)
    medication_count: Mapped[int] = mapped_column(Integer)
    city_type: Mapped[str] = mapped_column(String(50))
    previous_year_cost: Mapped[float] = mapped_column(Float)
    predicted_cost: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    
    patient_id: Mapped[Optional[int]] = mapped_column(ForeignKey("patients.id"), nullable=True, index=True)
    patient: Mapped[Optional["Patient"]] = relationship("Patient", back_populates="predictions")

    risk_factors: Mapped[List["RiskFactor"]] = relationship(
        back_populates="prediction",
        cascade="all, delete-orphan",
    )


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    prediction_id: Mapped[int] = mapped_column(ForeignKey("predictions.id", ondelete="CASCADE"), index=True)
    feature_name: Mapped[str] = mapped_column(String(100))
    feature_value: Mapped[str] = mapped_column(Text)
    shap_value: Mapped[float] = mapped_column(Float)
    rank: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    prediction: Mapped[PredictionRecord] = relationship(back_populates="risk_factors")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    snils: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    predictions: Mapped[List[PredictionRecord]] = relationship("PredictionRecord", back_populates="patient")


class SyntheticCohort(Base):
    __tablename__ = "synthetic_cohort"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    bmi: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    smoker: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    diabetes: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    hypertension: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    heart_disease: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    asthma: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    physical_activity_level: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    daily_steps: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sleep_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stress_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    doctor_visits_per_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    hospital_admissions: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    medication_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    city_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    previous_year_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    annual_medical_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
