# Deployment Guide: PythonAnywhere (Anaconda)

This project is configured to run as a single Web App on PythonAnywhere. The FastAPI backend serves the React frontend static files from the `frontend/dist` folder.

## 1. Prepare GitHub
Ensure you have pushed the latest code:
```powershell
git add .
git commit -m "chore: prepare for PythonAnywhere deployment"
git push
```

## 2. PythonAnywhere Setup (Console)
Open a **Bash Console** on PythonAnywhere and run:

```bash
# Clone the repository
git clone https://github.com/Tonnie26348/JOBGUARD-AI.git
cd JOBGUARD-AI

# Create and activate a Conda environment
# Note: PythonAnywhere provides 'conda' pre-installed
conda create --name jobguard python=3.10 -y
conda activate jobguard

# Install dependencies
pip install -r backend/requirements.txt
```

## 3. Web App Configuration
Go to the **Web** tab on PythonAnywhere:
1.  **Add a new web app**: Select "Manual Configuration" and "Python 3.10".
2.  **Code Section**:
    *   Source code: `/home/YOUR_USERNAME/JOBGUARD-AI/backend`
    *   Working directory: `/home/YOUR_USERNAME/JOBGUARD-AI/backend`
3.  **Virtualenv Section**:
    *   Enter the path to your conda env (usually `/home/YOUR_USERNAME/.conda/envs/jobguard`)
4.  **Static Files Section** (Optional but recommended for performance):
    *   URL: `/assets`
    *   Directory: `/home/YOUR_USERNAME/JOBGUARD-AI/frontend/dist/assets`

## 4. WSGI File Configuration
Click the link to **"WSGI configuration file"** in the Web tab. Replace its entire content with:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/YOUR_USERNAME/JOBGUARD-AI/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variable for the model if needed
os.environ['JOBGUARD_MODEL_PATH'] = os.path.join(project_home, 'jobguard_model.pkl')

# Import the WSGI app
from wsgi import application
```

## 5. Reload & Launch
Click the **Reload** button on the Web tab. Your app will be live at `https://YOUR_USERNAME.pythonanywhere.com`.
