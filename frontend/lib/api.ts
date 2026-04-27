import type { Apartment, Booking, BookingPayload } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type ApiError = { detail?: { message?: string } | string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    const message = typeof body.detail === "object" ? body.detail.message : body.detail;
    throw new Error(message || "Ошибка запроса к API");
  }

  return response.json() as Promise<T>;
}

export const getApartments = () => request<Apartment[]>("/api/apartments");

export const createBooking = (payload: BookingPayload) =>
  request<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(payload) });
