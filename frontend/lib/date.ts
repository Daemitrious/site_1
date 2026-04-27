import type { BookingRange } from "./types";

export const todayISO = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short" }).format(new Date(`${value}T00:00:00`));

export const isRangeInvalid = (startDate: string, endDate: string) => Boolean(startDate && endDate && endDate <= startDate);

export const hasBookingOverlap = (booked: BookingRange[], startDate: string, endDate: string) =>
  Boolean(startDate && endDate && booked.some((range) => startDate < range.endDate && range.startDate < endDate));
