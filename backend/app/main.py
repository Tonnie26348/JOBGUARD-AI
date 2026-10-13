from __future__ import annotations

import html
import os
import re
from pathlib import Path
from typing import Any

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

APP_DIR = Path(__file__).resolve().parent
MODEL_PATH = Path(os.getenv("JOBGUARD_MODEL_PATH", APP_DIR.parent / "jobguard_model.pkl"))


def clean_text(value: str | None) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()


# Load once when the API starts; never retrain during a prediction request.
try:
    with MODEL_PATH.open("rb") as model_file:
        bundle: dict[str, Any] = joblib.load(model_file)
except Exception as exc:  # fail early with a useful startup error
    raise RuntimeError(f"Could not load JOBGUARD model at {MODEL_PATH}: {exc}") from exc

app = FastAPI(
    title="JOBGUARD AI API",
    description="ML-based recruitment-ad risk screening. Results are indicators, not proof of fraud.",
    version="1.0.0",
)

allowed_origins = [
    item.strip()
    for item in os.getenv(
        "JOBGUARD_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if item.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class JobAdInput(BaseModel):
    title: str = Field(default="", max_length=500)
    description: str = Field(default="", max_length=30000)
    requirements: str = Field(default="", max_length=15000)
    company_profile: str = Field(default="", max_length=10000)
    benefits: str = Field(default="", max_length=10000)

    @field_validator("title", "description", "requirements", "company_profile", "benefits")
    @classmethod
    def normalize_strings(cls, value: str) -> str:
        return value.strip()


class PredictionResponse(BaseModel):
    model_name: str
    risk_score: float
    threshold: float
    label: str
    level: str
    summary: str
    checked_fields: list[str]
    disclaimer: str


DISCLAIMER = (
    "This result is an automated screening aid, not proof that a job or employer is fraudulent "
    "or legitimate. The score is not a calibrated real-world probability. Independently verify "
    "the employer, official website and contact details, and never pay a recruitment fee based "
    "only on this result."
)


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "JOBGUARD AI API", "status": "ok", "docs": "/docs"}


@app.get("/api/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_name": str(bundle.get("model_name", "Unknown model")),
    }


@app.post("/api/predict", response_model=PredictionResponse)
def predict_job(payload: JobAdInput) -> PredictionResponse:
    fields = {
        "title": payload.title,
        "description": payload.description,
        "requirements": payload.requirements,
        "company_profile": payload.company_profile,
        "benefits": payload.benefits,
    }
    cleaned = {key: clean_text(value) for key, value in fields.items()}
    text = " ".join(cleaned[key] for key in fields if cleaned[key]).strip()
    if not text:
        raise HTTPException(
            status_code=422,
            detail="Enter at least a job title or job description before checking an advertisement.",
        )

    try:
        vector = bundle["vectorizer"].transform([text])
        score = float(bundle["model"].predict_proba(vector)[0, 1])
    except Exception as exc:
        raise HTTPException(status_code=500, detail="The model could not process this advertisement.") from exc

    threshold = float(bundle.get("threshold", 0.5))
    higher_risk = score >= threshold
    if higher_risk:
        label = "Higher risk — review carefully"
        level = "higher"
        summary = "The text resembles patterns the model learned from known fraudulent job advertisements. Verify the opportunity before sharing information or proceeding."
    else:
        label = "Lower risk — still verify"
        level = "lower"
        summary = "The model did not score this text above its selected screening threshold. This does not guarantee that the opportunity is safe."

    return PredictionResponse(
        model_name=str(bundle.get("model_name", "JOBGUARD AI text classifier")),
        risk_score=round(score, 4),
        threshold=round(threshold, 4),
        label=label,
        level=level,
        summary=summary,
        checked_fields=[key for key, value in cleaned.items() if value],
        disclaimer=DISCLAIMER,
    )
