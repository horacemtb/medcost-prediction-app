from fastapi import APIRouter, File, HTTPException, UploadFile

from ..schemas import OcrPatientFormResponse
from ..services.ocr_service import extract_patient_form

router = APIRouter(prefix="/api/ocr", tags=["ocr"])


@router.post("/patient-form", response_model=OcrPatientFormResponse)
async def recognize_patient_form(file: UploadFile = File(...)):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Загрузите изображение анкеты")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Файл анкеты пуст")

    try:
        return extract_patient_form(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
