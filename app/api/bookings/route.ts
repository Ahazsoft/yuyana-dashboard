import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit, getIp } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

const bookingSchema = z.object({
  customerId: z.string(),
  tourPackageId: z.string().uuid(),
  numberOfGuests: z.number().int().min(1),
  notes: z.string().optional(),
  travelDate: z.string().datetime().optional(), // ISO 8601 string
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const take = parseInt(url.searchParams.get("take") || "50");
  const status = url.searchParams.get("status");
  const customerId = url.searchParams.get("customerId");

  const where: any = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;

  // Sales/Marketing roles can see all bookings but perhaps later restrict
  // For now, only VIEWER cannot see sensitive parts (handled in UI)

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        tourPackage: { select: { tourTitle: true, tourPrice: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({ data: bookings, meta: { total, skip, take } });
}

export async function POST(req: NextRequest) {
  const ip = getIp(req) ?? "unknown";
  const rl = rateLimit(`bookings-public:${ip}`, 5, 10 * 60 * 1000); // 5 per 10 mins
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { customerId, tourPackageId, numberOfGuests, notes, travelDate } = parsed.data;

  // HLD Requirement: Snapshot the price at booking creation time
  const tour = await prisma.tourPackage.findUnique({
    where: { id: tourPackageId },
  });

  if (!tour) {
    return NextResponse.json({ error: "Tour package not found" }, { status: 404 });
  }

  // Parse price (assuming JSON structure like { amount: 500 })
  let basePrice = 0;
  try {
    const priceObj = typeof tour.tourPrice === "string" ? JSON.parse(tour.tourPrice) : tour.tourPrice;
    basePrice = priceObj?.amount || 0;
  } catch {
    basePrice = 0;
  }

  const agreedPrice = basePrice;
  const totalPrice = agreedPrice * numberOfGuests;

  const booking = await prisma.booking.create({
    data: {
      customerId,
      tourPackageId,
      userId: auth.userId,
      numberOfGuests,
      agreedPrice,
      totalPrice,
      currency: "USD", // Defaulting from base or configure via HLD
      notes,
      travelDate: travelDate ? new Date(travelDate) : null,
    },
  });

  await logAudit({
    actorId: auth.userId,
    action: "booking.created",
    entityType: "Booking",
    entityId: booking.id,
    meta: { customerId, tourPackageId, agreedPrice, totalPrice },
  });

  return NextResponse.json(booking, { status: 211 });
}
