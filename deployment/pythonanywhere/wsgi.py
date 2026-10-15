"""
WSGI entry point for PythonAnywhere deployment.
PythonAnywhere uses WSGI; a2wsgi adapts the FastAPI ASGI app into a WSGI application callable.
"""
from a2wsgi import ASGIMiddleware
from app.main import app

application = ASGIMiddleware(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
