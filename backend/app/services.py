from datetime import date

from sqlalchemy import Select, select, text
from sqlalchemy.orm import Session

from app.models import Apartment, Booking
from app.schemas import BookingCreate


class BookingError(Exception):
    code = "booking_error"
    message = "Не удалось создать бронирование"


class ApartmentNotFound(BookingError):
    code = "apartment_not_found"
    message = "Квартира не найдена"


class DatesAlreadyBooked(BookingError):
    code = "dates_already_booked"
    message = "Эти даты уже заняты"


class InvalidBookingDates(BookingError):
    code = "invalid_booking_dates"
    message = "Дата выезда должна быть позже даты заезда"


def _overlap_query(apartment_id: int, start_date: date, end_date: date) -> Select[tuple[Booking]]:
    return select(Booking).where(
        Booking.apartment_id == apartment_id,
        Booking.status == "reserved",
        Booking.start_date < end_date,
        Booking.end_date > start_date,
    )


def create_booking(session: Session, data: BookingCreate) -> Booking:
    if data.end_date <= data.start_date:
        raise InvalidBookingDates

    if session.bind and session.bind.dialect.name == "sqlite":
        session.execute(text("BEGIN IMMEDIATE"))

    apartment = session.get(Apartment, data.apartment_id)
    if not apartment or not apartment.is_active:
        raise ApartmentNotFound

    if session.scalar(_overlap_query(data.apartment_id, data.start_date, data.end_date)):
        raise DatesAlreadyBooked

    booking = Booking(**data.model_dump())
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking
