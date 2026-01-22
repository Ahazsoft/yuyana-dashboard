import { Booking } from "./types";

export const bookings: Booking[] = [
  {
    id: "BK-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1 234 567 890",
    tourId: "eth-1",
    tourTitle: "Ethiopia Adventure",
    bookingDate: "2024-01-15",
    travelDate: "2024-03-10",
    guests: 2,
    totalPrice: 2400,
    status: "new",
    message: "Looking forward to this trip!"
  },
  {
    id: "BK-002",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@email.com",
    customerPhone: "+44 7700 900000",
    tourId: "afr-1",
    tourTitle: "Zanzibar Paradise",
    bookingDate: "2024-01-10",
    travelDate: "2024-02-20",
    guests: 3,
    totalPrice: 2250,
    status: "contacted",
  },
  {
    id: "BK-003",
    customerName: "Abebe Bekele",
    customerEmail: "abebe@travel.et",
    customerPhone: "+251 911 22 33 44",
    tourId: "eth-4",
    tourTitle: "Omo Valley Trip",
    bookingDate: "2024-01-05",
    travelDate: "2024-01-25",
    guests: 4,
    totalPrice: 3400,
    status: "confirmed",
  },
  {
    id: "BK-004",
    customerName: "Alice Wonderland",
    customerEmail: "alice@world.com",
    customerPhone: "+1 555 123 4567",
    tourId: "asi-2",
    tourTitle: "Japan Highlights",
    bookingDate: "2023-12-28",
    travelDate: "2024-04-12",
    guests: 1,
    totalPrice: 1800,
    status: "canceled",
    message: "Had to cancel due to work schedule."
  }
];
