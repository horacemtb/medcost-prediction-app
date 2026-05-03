from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers.ocr import router as ocr_router
from .routers.predictions import router as predictions_router
from .routers.ml_stats import router as ml_router

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
