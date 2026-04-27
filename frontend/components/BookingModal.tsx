"use client";

import { FormEvent, useMemo, useState } from "react";
import { createBooking } from "@/lib/api";
import { formatDate, hasBookingOverlap, isRangeInvalid, todayISO } from "@/lib/date";
import type { Apartment } from "@/lib/types";

type Props = {
  apartment: Apartment;
  onClose: () => void;
  onBooked: () => Promise<void>;
};

const emptyForm = { guestName: "", guestPhone: "", startDate: "", endDate: "" };

export function BookingModal({ apartment, onClose, onBooked }: Props) {
  const minDate = useMemo(todayISO, []);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");
  const rangeInvalid = isRangeInvalid(form.startDate, form.endDate);
  const overlap = hasBookingOverlap(apartment.booked, form.startDate, form.endDate);
  const canSubmit = form.guestName.length > 1 && form.guestPhone.length > 4 && form.startDate && form.endDate && !rangeInvalid && !overlap;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus("saving");
    setError("");
    try {
      await createBooking({ apartmentId: apartment.id, ...form });
      setStatus("done");
      await onBooked();
      setTimeout(onClose, 450);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось отправить заявку");
      setStatus("idle");
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <form className="modal" onSubmit={submit}>
        <button type="button" className="close" onClick={onClose} aria-label="Закрыть">×</button>
        <p className="eyebrow">Новая бронь</p>
        <h2>{apartment.title}</h2>
        <p className="muted">{apartment.address}</p>

        <div className="busyBox">
          <span>Занятые даты</span>
          <div>
            {apartment.booked.length ? apartment.booked.map((range) => (
              <b key={`${range.startDate}-${range.endDate}`}>{formatDate(range.startDate)} — {formatDate(range.endDate)}</b>
            )) : <b>Пока свободно</b>}
          </div>
        </div>

        <label>Дата заезда<input required min={minDate} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
        <label>Дата выезда<input required min={form.startDate || minDate} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label>
        <label>Ваше имя<input required minLength={2} placeholder="Например, Дмитрий" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} /></label>
        <label>Телефон<input required minLength={5} placeholder="+375 29 000-00-00" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} /></label>

        {rangeInvalid && <p className="error">Дата выезда должна быть позже даты заезда.</p>}
        {overlap && <p className="error">Эта квартира уже занята на выбранные даты.</p>}
        {error && <p className="error">{error}</p>}
        {status === "done" && <p className="success">Заявка сохранена в БД.</p>}

        <button type="submit" disabled={!canSubmit || status === "saving"}>{status === "saving" ? "Сохраняю..." : "Отправить заявку"}</button>
      </form>
    </div>
  );
}
