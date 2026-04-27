from collections.abc import Iterator

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.models import Apartment, Base

sqlite_args = {"check_same_thread": False, "timeout": 15} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=sqlite_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_session() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session


def init_db() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        if session.scalar(select(func.count(Apartment.id))):
            return
        session.add_all(
            [
                Apartment(
                    title="Nordic Light Studio",
                    address="Минск, ул. Немига, 12",
                    owner_phone="+375 29 111-22-33",
                    price_per_night=82,
                    image_url="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
                    description="Светлая студия в центре: рабочее место, быстрый Wi‑Fi, бесконтактное заселение.",
                ),
                Apartment(
                    title="Old Town Suite",
                    address="Минск, ул. Раковская, 18",
                    owner_phone="+375 33 222-44-55",
                    price_per_night=115,
                    image_url="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                    description="Уютная квартира рядом с кафе и набережной. Подходит для пары или командировки.",
                ),
                Apartment(
                    title="Skyline Family Flat",
                    address="Минск, пр-т Победителей, 45",
                    owner_phone="+375 44 333-66-77",
                    price_per_night=149,
                    image_url="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
                    description="Две спальни, панорамные окна, парковка и кухня для долгого проживания.",
                ),
                Apartment(
                    title="Quiet Green Loft",
                    address="Минск, ул. Киселёва, 7",
                    owner_phone="+375 25 444-88-99",
                    price_per_night=97,
                    image_url="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
                    description="Лофт в тихом районе у парка. Минимализм, тёплый свет и всё для отдыха.",
                ),
            ]
        )
        session.commit()
