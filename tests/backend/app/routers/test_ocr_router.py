import asyncio
from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.routers.ocr import recognize_patient_form


class Upload:
    def __init__(self, body=b"image-bytes", content_type="image/png"):
        self.content_type = content_type
        self._body = body

    async def read(self):
        return self._body


def test_recognize_patient_form_returns_extracted_fields():
    expected = {"fields": {"age": 45}, "raw_text": "raw", "warnings": []}

    with patch("app.routers.ocr.extract_patient_form", return_value=expected):
        result = asyncio.run(recognize_patient_form(Upload()))

    assert result == expected


@pytest.mark.parametrize(
    ("upload", "status_code"),
    [
        (Upload(content_type="application/pdf"), 400),
        (Upload(body=b""), 400),
    ],
)
def test_recognize_patient_form_rejects_invalid_uploads(upload, status_code):
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(recognize_patient_form(upload))

    assert exc_info.value.status_code == status_code


@pytest.mark.parametrize(
    ("error", "status_code"),
    [
        (ValueError("bad image"), 400),
        (RuntimeError("ocr missing"), 500),
    ],
)
def test_recognize_patient_form_maps_service_errors(error, status_code):
    with patch("app.routers.ocr.extract_patient_form", side_effect=error):
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(recognize_patient_form(Upload()))

    assert exc_info.value.status_code == status_code
    assert exc_info.value.detail == str(error)
