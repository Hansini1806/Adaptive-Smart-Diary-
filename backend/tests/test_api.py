from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.main import app, require_model
from app.model_service import EmotionModelService
from app.supabase_auth import require_supabase_user


class TestModelService:
    """A deterministic test double; production inference always uses trained weights."""

    def predict(self, text: str) -> dict[str, object]:
        assert text.strip()
        probabilities = {
            "sadness": 0.05,
            "joy": 0.75,
            "love": 0.05,
            "anger": 0.05,
            "fear": 0.05,
            "surprise": 0.05,
        }
        return {
            "emotion": "joy",
            "confidence": 0.75,
            "probabilities": probabilities,
            "model_version": "test-double",
        }


@pytest.fixture
def client() -> Iterator[TestClient]:
    app.dependency_overrides[require_supabase_user] = lambda: {
        "id": "00000000-0000-0000-0000-000000000001",
        "access_token": "test-token",
    }
    app.dependency_overrides[require_model] = lambda: TestModelService()
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health_endpoint() -> None:
    with TestClient(app) as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analysis_returns_prediction_and_class_probabilities(client: TestClient) -> None:
    response = client.post(
        "/api/emotions/analyze",
        json={"text": "I had a wonderful day with my friends."},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["emotion"] == "joy"
    assert body["confidence"] == pytest.approx(0.75)
    assert set(body["probabilities"]) == {
        "sadness", "joy", "love", "anger", "fear", "surprise",
    }
    assert sum(body["probabilities"].values()) == pytest.approx(1.0)
    assert body["model_version"] == "test-double"
    assert body["analysis_id"] is None


def test_analysis_persists_only_when_entry_id_is_provided(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    saved: dict[str, object] = {}

    async def save_analysis(**values: object) -> str:
        saved.update(values)
        return "00000000-0000-0000-0000-000000000099"

    monkeypatch.setattr("app.main.save_emotion_analysis", save_analysis)
    entry_id = "00000000-0000-0000-0000-000000000002"
    response = client.post(
        "/api/emotions/analyze",
        json={
            "text": "I had a wonderful day.",
            "diary_entry_id": entry_id,
        },
    )

    assert response.status_code == 200
    assert response.json()["analysis_id"] == "00000000-0000-0000-0000-000000000099"
    assert saved["user_id"] == "00000000-0000-0000-0000-000000000001"
    assert saved["access_token"] == "test-token"
    assert saved["diary_entry_id"] == entry_id
    assert "text" not in saved


@pytest.mark.parametrize("text", ["", "  \n"])
def test_analysis_rejects_empty_text(client: TestClient, text: str) -> None:
    response = client.post("/api/emotions/analyze", json={"text": text})

    assert response.status_code == 422


def test_analysis_requires_authentication() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/emotions/analyze",
            json={"text": "A test entry."},
        )

    assert response.status_code == 401
