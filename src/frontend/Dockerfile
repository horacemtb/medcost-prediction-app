FROM python:3.11-slim

WORKDIR /app

COPY src/frontend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY src/frontend/app /app
COPY src/frontend/.streamlit /app/.streamlit

EXPOSE 8501

CMD ["streamlit", "run", "streamlit_app.py", "--server.address=0.0.0.0", "--server.port=8501"]