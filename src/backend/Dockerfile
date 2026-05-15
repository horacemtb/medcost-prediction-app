FROM python:3.11-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-rus fonts-dejavu-core ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ARG RUS_TESSDATA_URL=https://raw.githubusercontent.com/tesseract-ocr/tessdata_best/main/rus.traineddata
RUN cp /usr/share/tesseract-ocr/5/tessdata/rus.traineddata /usr/share/tesseract-ocr/5/tessdata/rus_standard.traineddata \
    && python -c "from urllib.request import urlretrieve; urlretrieve('${RUS_TESSDATA_URL}', '/usr/share/tesseract-ocr/5/tessdata/rus.traineddata')"

COPY src/backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY src/backend/app /app/app
COPY src/backend/models /app/models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
