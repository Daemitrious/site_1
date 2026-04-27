.PHONY: backend frontend test docker-up

backend:
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -e . && fastapi dev app/main.py --port 8000

frontend:
	cd frontend && npm install && npm run dev

test:
	cd backend && . .venv/bin/activate && pip install -e '.[dev]' && pytest -q

docker-up:
	docker compose up --build
