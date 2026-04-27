"use client";

import { useEffect, useState } from "react";
import { ApartmentCard } from "@/components/ApartmentCard";
import { BookingModal } from "@/components/BookingModal";
import { getApartments } from "@/lib/api";
import type { Apartment } from "@/lib/types";

const author = process.env.NEXT_PUBLIC_AUTHOR_FULL_NAME ?? "Dimitry Elizabarovich Krushinskiy";

export default function Home() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selected, setSelected] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApartments() {
    try {
      setError("");
      setApartments(await getApartments());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось загрузить квартиры");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadApartments(); }, []);

  const activeApartment = selected ? apartments.find((item) => item.id === selected.id) ?? selected : null;

  return (
    <main>
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Production-minded тестовое</p>
          <h1>Посуточная аренда без двойных броней</h1>
          <p>Квартиры приходят из БД, заявки сохраняются на сервере, а занятые даты моментально блокируются для следующих гостей.</p>
          <div className="heroPills" aria-label="Преимущества решения">
            <span>Fast booking UX</span>
            <span>Conflict-safe dates</span>
            <span>Clean architecture</span>
          </div>
        </div>
        <div className="heroCard">
          <b>Clean stack</b>
          <span>FastAPI · SQLAlchemy · SQLite · Next.js</span>
          <div className="heroStats">
            <div><strong>0</strong><small>double-bookings</small></div>
            <div><strong>24/7</strong><small>booking flow</small></div>
          </div>
          <small>Автор: {author}</small>
        </div>
      </section>

      {error && <div className="notice">{error}. Проверьте, что backend запущен на 8000 порту.</div>}
      {loading ? <div className="grid skeleton"><span /><span /><span /></div> : (
        <section className="grid" aria-label="Список квартир">
          {apartments.map((apartment) => <ApartmentCard key={apartment.id} apartment={apartment} onBook={setSelected} />)}
        </section>
      )}

      <footer>Built for demo by {author}. Код компактный, типизированный, с серверной валидацией бронирований.</footer>
      {activeApartment && <BookingModal apartment={activeApartment} onClose={() => setSelected(null)} onBooked={loadApartments} />}
    </main>
  );
}
