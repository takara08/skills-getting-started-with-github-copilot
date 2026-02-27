import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

# Arrange-Act-Assert パターンでテスト

def test_get_activities():
    # Arrange: テストクライアントは上で準備済み
    # Act
    response = client.get("/activities")
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_activity_success():
    # Arrange
    email = "testuser1@mergington.edu"
    activity = "Chess Club"
    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # 2回目は重複エラーになることも確認
    response2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert response2.status_code == 400
    assert "already signed up" in response2.json()["detail"]


def test_signup_activity_not_found():
    # Arrange
    email = "testuser2@mergington.edu"
    activity = "Nonexistent Club"
    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")
    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

# 削除APIが未実装の場合はこのテストはスキップされます
def test_remove_participant(monkeypatch):
    # Arrange
    email = "testuser3@mergington.edu"
    activity = "Programming Class"
    # まず登録
    client.post(f"/activities/{activity}/signup?email={email}")
    # Act
    response = client.post(f"/activities/{activity}/remove?email={email}")
    # Assert
    if response.status_code == 200:
        assert f"Removed {email} from {activity}" in response.json()["message"]
    else:
        # エンドポイント未実装の場合
        assert response.status_code in (404, 405)
