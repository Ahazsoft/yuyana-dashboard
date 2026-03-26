
export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  image: string; // URL to image
  rating: number;
  reviewsCount: number;
  tags?: string[];
}

export type BookingStatus = 'new' | 'contacted' | 'confirmed' | 'canceled';

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tourId: string;
  tourTitle: string;
  bookingDate: string;
  travelDate: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  message?: string;
}
