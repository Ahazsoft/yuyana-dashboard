import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/require-role";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Parallel fetch of all related activities
  const [leads, bookings, emailLogs] = await Promise.all([
    prisma.lead.findMany({
      where: { customerId: id },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        activities: {
          select: { fromStatus: true, toStatus: true, note: true, createdAt: true },
        },
      },
    }),
    prisma.booking.findMany({
      where: { customerId: id },
      select: {
        id: true,
        status: true,
        totalPrice: true,
        currency: true,
        createdAt: true,
        activities: {
          select: { fromStatus: true, toStatus: true, note: true, createdAt: true },
        },
        tourPackage: { select: { tourTitle: true } },
      },
    }),
    prisma.emailLog.findMany({
      where: {
        // Technically we need to match by email but let's assume `user` relation is mapped or we query `recipientEmail`
      },
    }),
  ]);

  // To properly query EmailLogs, we need the customer's email
  const customer = await prisma.customer.findUnique({
    where: { id },
    select: { email: true },
  });

  const actualEmailLogs = customer
    ? await prisma.emailLog.findMany({
        where: { recipientEmail: customer.email },
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          openedAt: true,
          clickedAt: true,
        },
      })
    : [];

  // Transform and merge into a single timeline array
  const timeline: any[] = [];

  // Add Lead creation & activities
  for (const lead of leads) {
    timeline.push({
      type: "lead.created",
      date: lead.createdAt,
      data: { leadId: lead.id, title: lead.title, status: lead.status },
    });
    for (const act of lead.activities) {
      timeline.push({
        type: "lead.status_changed",
        date: act.createdAt,
        data: { leadId: lead.id, from: act.fromStatus, to: act.toStatus, note: act.note },
      });
    }
  }

  // Add Booking creation & activities
  for (const booking of bookings) {
    timeline.push({
      type: "booking.created",
      date: booking.createdAt,
      data: { bookingId: booking.id, tour: booking.tourPackage.tourTitle, amount: `${booking.currency} ${booking.totalPrice}` },
    });
    for (const act of booking.activities) {
      timeline.push({
        type: "booking.status_changed",
        date: act.createdAt,
        data: { bookingId: booking.id, from: act.fromStatus, to: act.toStatus, note: act.note },
      });
    }
  }

  // Add Email logs
  for (const email of actualEmailLogs) {
    timeline.push({
      type: "email.sent",
      date: email.createdAt,
      data: { emailId: email.id, subject: email.subject, status: email.status },
    });
    if (email.openedAt) {
      timeline.push({
        type: "email.opened",
        date: email.openedAt,
        data: { emailId: email.id, subject: email.subject },
      });
    }
  }

  // Sort by date descending
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json(timeline);
}
