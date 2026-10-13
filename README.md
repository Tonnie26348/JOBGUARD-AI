# JOBGUARD AI — React + FastAPI

A responsive web prototype for screening job advertisements with the saved JOBGUARD AI TF-IDF + Logistic Regression model. The model is loaded once when FastAPI starts; prediction requests do not retrain it.

## Project structure

```text
JOBGUARD_AI_App/
├── backend/
│   ├── app/main.py              # FastAPI API and model inference
│   ├── jobguard_model.pkl       # Saved trained model bundle
│   ├── evaluation_results.json  # Held-out test metrics
│   └── requirements.txt
├── frontend/
│   ├── src/App.tsx              # React interface
│   ├── src/styles.css           # Responsive styling
│   └── package.json
└── PROJECT_REPORT.md
```

## Prerequisites

- Python 3.10 or newer (Python 3.11 recommended)
- Node.js 20 or newer and npm
- Internet access on first setup to install dependencies and load Google Fonts (the app still works with fallback fonts if fonts cannot load)

## Run on Windows

### 1. Start the backend

Open Command Prompt or PowerShell:

```powershell
cd JOBGUARD_AI_App\backend
py -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

You can also run `run_api.bat` from the `backend` folder.

Verify the API in your browser:
- Health check: http://127.0.0.1:8000/api/health
- Interactive API documentation: http://127.0.0.1:8000/docs

### 2. Start the React frontend in a second terminal

```powershell
cd JOBGUARD_AI_App\frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://127.0.0.1:5173.

## Run on macOS/Linux

Backend:

```bash
cd JOBGUARD_AI_App/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend in a second terminal:

```bash
cd JOBGUARD_AI_App/frontend
npm install
npm run dev
```

## Configuration

The frontend defaults to `http://127.0.0.1:8000`. To use another API URL, create `frontend/.env` with:

```text
VITE_API_URL=http://127.0.0.1:8000
```

Restart Vite after changing environment variables. For deployed environments, set `JOBGUARD_ALLOWED_ORIGINS` on the API to a comma-separated list of trusted frontend origins. Do not use wildcard CORS origins for a production deployment.

## API

- `GET /` — API identity/status
- `GET /api/health` — checks API/model startup
- `POST /api/predict` — scores submitted text

Example request:

```json
{
  "title": "Customer Support Representative",
  "description": "Paste the full job description here",
  "requirements": "Communication skills",
  "company_profile": "Company information, if available",
  "benefits": "Benefits, if stated"
}
```

The response contains a model risk score, selected threshold, screening label, submitted fields that contained text, and a safety disclaimer. The score is not a calibrated real-world probability. The model has not been validated as representative of current Kenyan job scams.

## Model and ethical limitations

- This is a text classifier trained on historical international job-advertisement data.
- It may miss new scam tactics or incorrectly flag legitimate opportunities.
- Do not treat an output as proof, legal advice, or a definitive judgment about an employer.
- Do not submit sensitive personal information. This prototype has no database and does not intentionally persist requests; avoid deploying it publicly without reviewing logging, privacy, abuse prevention, security, and model limitations.
- Reproducibility note: scikit-learn versions can affect pickle compatibility. If model loading fails, install a compatible scikit-learn version or retrain and export the model in the same environment as the API.

## Model evaluation snapshot

Held-out test set metrics from the model experiment are in `backend/evaluation_results.json`. Fraud-class precision: 86.14%; recall: 71.90%; F1: 78.38%; average precision: 87.27%. Test set size: 2,585 ads, including 121 labeled fraudulent. Results describe this historical test split and are not a guarantee of live performance.
