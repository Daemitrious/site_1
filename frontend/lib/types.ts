export type BookingRange = {
  startDate: string;
  endDate: string;
};

export type Apartment = {
  id: number;
  title: string;
  address: string;
  ownerPhone: string;
  pricePerNight: number;
  imageUrl: string;
  description: string;
  booked: BookingRange[];
};

export type BookingPayload = {
  apartmentId: number;
  startDate: string;
  endDate: string;
  guestName: string;
  guestPhone: string;
};

export type Booking = BookingPayload & {
  id: number;
  createdAt: string;
};
