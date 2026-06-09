FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    unzip \
    && rm -rf /var/lib/apt/lists/*

ENV DENO_INSTALL=/usr/local

RUN curl -fsSL https://deno.land/install.sh | sh -s -- -y \
    && /usr/local/bin/deno --version

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /output/narrations /output/transcriptions /temp && chmod -R 777 /output /temp

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8456"]
