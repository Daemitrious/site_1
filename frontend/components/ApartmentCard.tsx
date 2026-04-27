import Image from "next/image";
import type { Apartment } from "@/lib/types";

const rub = new Intl.NumberFormat("ru-RU");

type Props = {
  apartment: Apartment;
  onBook: (apartment: Apartment) => void;
};

export function ApartmentCard({ apartment, onBook }: Props) {
  return (
    <article className="card">
      <div className="photoWrap">
        <Image src={apartment.imageUrl} alt={apartment.title} fill sizes="(max-width: 900px) 100vw, 33vw" className="photo" />
        <span className="badge">{rub.format(apartment.pricePerNight)} BYN / ночь</span>
      </div>
      <div className="cardBody">
        <div>
          <h3>{apartment.title}</h3>
          <p className="muted">{apartment.address}</p>
        </div>
        <p>{apartment.description}</p>
        <div className="cardBottom">
          <a href={`tel:${apartment.ownerPhone}`} className="phone">{apartment.ownerPhone}</a>
          <button type="button" onClick={() => onBook(apartment)}>Забронировать</button>
        </div>
      </div>
    </article>
  );
}
