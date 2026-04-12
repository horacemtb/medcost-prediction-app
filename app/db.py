import os
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///medcost_local.db",
)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


class PatientRecord(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    age: Mapped[int] = mapped_column(Integer)
    gender: Mapped[str] = mapped_column(String(50))
    bmi: Mapped[float] = mapped_column(Float)
    smoker: Mapped[bool] = mapped_column(Boolean)
    diabetes: Mapped[bool] = mapped_column(Boolean)
    stress_level: Mapped[int] = mapped_column(Integer)
    previous_year_cost: Mapped[float] = mapped_column(Float)
    predicted_cost: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def save_patient_record(
    full_name: str,
    age: int,
    gender: str,
    bmi: float,
    smoker: bool,
    diabetes: bool,
    stress_level: int,
    previous_year_cost: float,
    predicted_cost: float,
) -> None:
    session = SessionLocal()
    try:
        record = PatientRecord(
            full_name=full_name,
            age=age,
            gender=gender,
            bmi=bmi,
            smoker=smoker,
            diabetes=diabetes,
            stress_level=stress_level,
            previous_year_cost=previous_year_cost,
            predicted_cost=predicted_cost,
        )
        session.add(record)
        session.commit()
    finally:
        session.close()


def get_all_records():
    session = SessionLocal()
    try:
        return session.query(PatientRecord).order_by(PatientRecord.created_at.desc()).all()
    finally:
        session.close()
