import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { triggerAutomation } from "@/lib/automation/engine";

const statusSchema = z.object({
  status: z.enum([
    "INQUIRY",
    "TENTATIVE",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
  ]),
  note: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { status, note } = parsed.data;

  if (booking.status === status) {
    return NextResponse.json(booking);
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const b = await tx.booking.update({
      where: { id },
      data: { status },
    });

    await tx.bookingActivity.create({
      data: {
        bookingId: id,
        fromStatus: booking.status,
        toStatus: status,
        changedBy: auth.userId,
        note: note || `Status changed from ${booking.status} to ${status}`,
      },
    });

    return b;
  });

  await logAudit({
    actorId: auth.userId,
    action: "booking.status_changed",
    entityType: "Booking",
    entityId: id,
    meta: { from: booking.status, to: status },
  });

  // Trigger automation for confirmation
  if (status === "CONFIRMED") {
    triggerAutomation("booking.confirmed", updated.customerId, { bookingId: id }).catch(console.error);
  }

  return NextResponse.json(updated);
}