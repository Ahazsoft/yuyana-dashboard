import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  numberOfGuests: z.number().int().min(1).optional(),
  agreedPrice: z.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  travelDate: z.string().datetime().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      tourPackage: { select: { tourTitle: true, tourDuration: true, imageUrl: true } },
      payments: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" } },
      user: { select: { name: true } }, // Sales rep making the booking
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(booking);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // Recalculate total if guests or agreedPrice changed
  const guests = parsed.data.numberOfGuests ?? booking.numberOfGuests;
  const price = parsed.data.agreedPrice ?? booking.agreedPrice;
  const totalPrice = guests * price;

  const dataToUpdate = {
    ...parsed.data,
    ...(parsed.data.travelDate !== undefined && { travelDate: parsed.data.travelDate ? new Date(parsed.data.travelDate) : null }),
    totalPrice,
  };

  const updated = await prisma.booking.update({
    where: { id },
    data: dataToUpdate,
  });

  await logAudit({
    actorId: auth.userId,
    action: "booking.updated",
    entityType: "Booking",
    entityId: id,
    meta: { fieldsUpdated: Object.keys(parsed.data), newTotal: totalPrice },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN");
  if (forbidden) return forbidden;

  try {
    await prisma.booking.delete({ where: { id } });
    await logAudit({
      actorId: auth!.userId,
      action: "booking.deleted",
      entityType: "Booking",
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
