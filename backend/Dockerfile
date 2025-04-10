FROM python:3.10-slim

RUN pip install openai flask

COPY . /app

WORKDIR /app

CMD ["python", "app.py"]
