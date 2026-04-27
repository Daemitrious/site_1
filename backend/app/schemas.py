from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


def to_camel(value: str) -> str:
    head, *tail = value.split("_")
    return head + "".join(word.capitalize() for word in tail)


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True, str_strip_whitespace=True)


class BookingRangeOut(CamelModel):
    start_date: date
    end_date: date


class ApartmentOut(CamelModel):
    id: int
    title: str
    address: str
    owner_phone: str
    price_per_night: int
    image_url: str
    description: str
    booked: list[BookingRangeOut] = Field(default_factory=list)


class BookingCreate(CamelModel):
    apartment_id: int = Field(gt=0)
    start_date: date
    end_date: date
    guest_name: str = Field(min_length=2, max_length=120)
    guest_phone: str = Field(min_length=5, max_length=40)

    @field_validator("guest_phone")
    @classmethod
    def normalize_phone(cls, value: str) -> str:
        cleaned = "".join(ch for ch in value if ch.isdigit() or ch in "+()- ")
        return cleaned or value

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, end_date: date, info: Any) -> date:
        start_date = info.data.get("start_date")
        if start_date and end_date <= start_date:
            raise ValueError("Дата выезда должна быть позже даты заезда")
        return end_date


class BookingOut(CamelModel):
    id: int
    apartment_id: int
    guest_name: str
    guest_phone: str
    start_date: date
    end_date: date
    created_at: datetime
