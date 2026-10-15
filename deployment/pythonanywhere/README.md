# Deployment Guide: PythonAnywhere (Standard Virtualenv)

**Note:** PythonAnywhere supports Anaconda/Conda in consoles, but **not** directly for Web Apps. Use a standard `virtualenv` for the Web tab.

## 1. Prepare GitHub
Ensure you have pushed the latest code:
```powershell
git add .
git commit -m "chore: update deployment guide to use standard virtualenv"
git push
```

## 2. PythonAnywhere Setup (Bash Console)
Open a **Bash Console** on PythonAnywhere and run:

```bash
# Clone the repository (if not already done)
git clone https://github.com/Tonnie26348/JOBGUARD-AI.git
cd JOBGUARD-AI

# Create a standard virtualenv (This is the supported way for Web Apps)
# This will create the env in /home/tonnie001/.virtualenvs/jobguard-venv
mkvirtualenv --python=/usr/bin/python3.10 jobguard-venv

# Install dependencies inside the virtualenv
pip install -r backend/requirements.txt
```

## 3. Web App Configuration
Go to the **Web** tab on PythonAnywhere:
1.  **Source code:** `/home/tonnie001/JOBGUARD-AI/backend`
2.  **Working directory:** `/home/tonnie001/JOBGUARD-AI/backend`
3.  **Virtualenv Section:**
    *   Enter this path: `/home/tonnie001/.virtualenvs/jobguard-venv`
    *   *(PythonAnywhere should now recognize it without errors)*

## 4. WSGI File Configuration
Click the link to **"WSGI configuration file"** in the Web tab. Ensure it looks like this:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/tonnie001/JOBGUARD-AI/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variable for the model
os.environ['JOBGUARD_MODEL_PATH'] = os.path.join(project_home, 'jobguard_model.pkl')

# Import the WSGI app (from wsgi.py)
from wsgi import application
```

## 5. Reload & Launch
Click the **Reload** button on the Web tab. Your app will be live at `https://tonnie001.pythonanywhere.com`.
