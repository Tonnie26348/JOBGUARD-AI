# JOBGUARD AI — React + FastAPI (Local Restoration)

A responsive web application for screening job advertisements for potential recruitment fraud using a machine learning classifier.

## Core Architecture

- **Backend:** Python FastAPI (`backend/app/main.py`)
- **Frontend:** React, TypeScript, and Vite (`frontend/`)
- **Machine Learning:** 
  - Model: Logistic Regression (balanced)
  - Vectorizer: TF-IDF
  - Artifact: `backend/jobguard_model.pkl`

## Local Setup (Windows)

### 1. Backend Setup

Open a terminal (PowerShell recommended):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- **API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The application will be live at [http://localhost:5173](http://localhost:5173).

## Testing

### Automated Suite
Run from the `backend` directory:
```powershell
.\.venv\Scripts\pytest.exe .
```

### Manual Validation
You can test the screening tool using the built-in "Quick Test" buttons in the UI, which load representative legitimate and suspicious advertisements.

## Deployment Note
Deployment files for PythonAnywhere have been consolidated into the `deployment/pythonanywhere/` directory to keep the root environment clean for local development.

## Project Structure

```text
JOBGUARD_AI_App/
├── backend/
│   ├── app/main.py              # FastAPI implementation
│   ├── jobguard_model.pkl       # Trained ML artifact
│   ├── requirements.txt         # Local dependencies
│   └── test_api.py              # Backend tests
├── frontend/
│   ├── src/App.tsx              # React UI
│   ├── src/styles.css           # UI Styling
│   └── package.json
├── deployment/                  # Production configs (isolated)
└── README.md
```

## Ethical & Model Limitations
This system is an automated screening aid and provides risk indicators, not definitive proof of fraud. Users are encouraged to independently verify all employment opportunities.
