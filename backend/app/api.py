from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.config import settings
from app.db import get_session
from app.models import Apartment
from app.schemas import ApartmentOut, BookingCreate, BookingOut, BookingRangeOut
from app.services import ApartmentNotFound, BookingError, DatesAlreadyBooked, create_booking

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("/health")
def health() -> dict[str, str | bool]:
    return {"ok": True, "service": settings.app_name, "author": settings.author_full_name}


@router.get("/apartments", response_model=list[ApartmentOut])
def list_apartments(session: SessionDep) -> list[ApartmentOut]:
    apartments = session.scalars(
        select(Apartment)
        .options(selectinload(Apartment.bookings))
        .where(Apartment.is_active.is_(True))
        .order_by(Apartment.price_per_night, Apartment.id)
    ).all()
    today = date.today()
    return [
        ApartmentOut(
            id=item.id,
            title=item.title,
            address=item.address,
            owner_phone=item.owner_phone,
            price_per_night=item.price_per_night,
            image_url=item.image_url,
            description=item.description,
            booked=[
                BookingRangeOut(start_date=booking.start_date, end_date=booking.end_date)
                for booking in item.bookings
                if booking.status == "reserved" and booking.end_date >= today
            ],
        )
        for item in apartments
    ]


@router.post("/bookings", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def book_apartment(payload: BookingCreate, session: SessionDep) -> BookingOut:
    try:
        return create_booking(session, payload)
    except DatesAlreadyBooked as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail={"code": exc.code, "message": exc.message}) from exc
    except ApartmentNotFound as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"code": exc.code, "message": exc.message}) from exc
    except BookingError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"code": exc.code, "message": exc.message}) from exc
