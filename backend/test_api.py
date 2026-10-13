from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_reports_loaded_model():
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['model_loaded'] is True


def test_prediction_requires_some_text():
    response = client.post('/api/predict', json={})
    assert response.status_code == 422


def test_prediction_returns_screening_fields():
    response = client.post('/api/predict', json={
        'title': 'Office Administrator',
        'description': 'Manage calendars, prepare reports, and coordinate office operations.',
        'requirements': 'Strong organization and communication skills.'
    })
    assert response.status_code == 200
    body = response.json()
    assert 0 <= body['risk_score'] <= 1
    assert 0 <= body['threshold'] <= 1
    assert body['level'] in {'higher', 'lower'}
    assert body['disclaimer']
