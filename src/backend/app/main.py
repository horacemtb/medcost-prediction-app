from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers.ocr import router as ocr_router
from .services.data_utils import load_synthetic_cohort
from .routers.predictions import router as predictions_router
from .routers.prediction_pdf_router import router as prediction_pdf_router
from .routers.ml_stats import router as ml_router
from .routers.stats import router as stats_router
from .routers.dadata_suggestions import router as dadata_suggestions_router
import os


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
app.include_router(dadata_suggestions_router)

@app.on_event("startup")
def startup_event():
    load_synthetic_cohort()
    
        


