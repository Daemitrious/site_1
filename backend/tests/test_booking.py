import os
import tempfile
from datetime import date, timedelta

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


def test_booking_conflict_is_blocked() -> None:
    with TestClient(app) as client:
        apartments = client.get("/api/apartments").json()
        apartment_id = apartments[0]["id"]
        start = date.today() + timedelta(days=2)
        end = start + timedelta(days=3)
        payload = {
            "apartmentId": apartment_id,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
            "guestName": "Test Guest",
            "guestPhone": "+375 29 000-00-00",
        }

        first = client.post("/api/bookings", json=payload)
        conflict = client.post("/api/bookings", json=payload)

        assert first.status_code == 201
        assert conflict.status_code == 409
        assert conflict.json()["detail"]["code"] == "dates_already_booked"
