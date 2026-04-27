

bash:
docker compose up --build


После запуска:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/apartments
- Swagger/OpenAPI: http://localhost:8000/docs

## Локальный запуск без Docker

### 1. Backend

```bash
cd backend
cp .env.example .env
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e .
fastapi dev app/main.py --port 8000
```

При первом старте API сам создаст SQLite-файл `staynest.db` и наполнит таблицу квартир демо-данными.

### 2. Frontend

Во втором терминале:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Откройте http://localhost:3000.

## Проверка бизнес-правила

```bash
cd backend
source .venv/bin/activate
pip install -e '.[dev]'
pytest -q
```

Тест создаёт бронь и проверяет, что повторная заявка на те же даты получает `409 Conflict`.

## Основная модель данных

```text
apartments
  id, title, address, owner_phone, price_per_night, image_url, description, is_active

bookings
  id, apartment_id, guest_name, guest_phone, start_date, end_date, status, created_at
```

Диапазоны дат считаются как `[start_date, end_date)`: дата выезда не входит в проживание. Пересечение определяется правилом:

```text
existing.start_date < requested.end_date AND requested.start_date < existing.end_date
```

## Production notes

Для реального продакшана я бы заменил SQLite на PostgreSQL и добавил exclusion constraint по диапазону дат, миграции Alembic, rate limit и авторизацию админки. В рамках тестового сохранён компактный код без лишней инфраструктуры, но ключевая бизнес-защита от double booking уже находится на сервере.
