# Deployment Guide: PythonAnywhere (Standard Virtualenv)

**Note:** PythonAnywhere supports Anaconda/Conda in consoles, but **not** directly for Web Apps. Use a standard `virtualenv` for the Web tab.

## 1. Prepare GitHub
Ensure you have pushed the latest code:
```powershell
git add .
git commit -m "chore: update deployment guide for direct WSGI wrapping"
git push
```

## 2. PythonAnywhere Setup (Bash Console)
Open a **Bash Console** on PythonAnywhere and run:

```bash
# Clone the repository (if not already done)
git clone https://github.com/Tonnie26348/JOBGUARD-AI.git
cd JOBGUARD-AI

# Create a standard virtualenv
mkvirtualenv --python=/usr/bin/python3.10 jobguard-venv

# Install dependencies inside the virtualenv
pip install -r backend/requirements.txt
```

## 3. Web App Configuration
Go to the **Web** tab on PythonAnywhere:
1.  **Source code:** `/home/Tonnie001/JOBGUARD-AI/backend`
2.  **Working directory:** `/home/Tonnie001/JOBGUARD-AI/backend`
3.  **Virtualenv Section:**
    *   Enter this path: `/home/Tonnie001/.virtualenvs/jobguard-venv`
    *   *(Make sure there is no red warning)*

## 4. WSGI File Configuration (Foolproof Method)
Click the link to **"WSGI configuration file"** in the Web tab. Replace its entire content with this direct snippet (which avoids any external module import issues):

```python
import sys
import os

# 1. Add your backend folder to Python sys.path
project_home = '/home/Tonnie001/JOBGUARD-AI/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# 2. Set the model path environment variable
os.environ['JOBGUARD_MODEL_PATH'] = os.path.join(project_home, 'jobguard_model.pkl')

# 3. Import FastAPI app directly and wrap with a2wsgi (No separate wsgi.py needed)
from app.main import app
from a2wsgi import ASGIMiddleware

application = ASGIMiddleware(app)
```

## 5. Reload & Launch
Click the green **Reload** button at the top of the Web tab. Your app will be live at `https://tonnie001.pythonanywhere.com`.
