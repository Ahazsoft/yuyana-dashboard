import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyStripeWebhook } from "@/lib/payments/stripe";
import { triggerAutomation } from "@/lib/automation/engine";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 401 });

  const bodyText = await req.text();
  // In a real app, use verifyStripeWebhook(bodyText, signature, process.env.STRIPE_WEBHOOK_SECRET)
  const event = JSON.parse(bodyText);

  // Stripe events usually: checkout.session.completed, payment_intent.succeeded
  const { type, data } = event;

  if (type === "checkout.session.completed") {
    const session = data.object;
    const txRef = session.client_reference_id || session.id;
    const bookingId = txRef.replace("booking_", "").split("_")[0]; // Example parsing

    // Idempotency
    const existing = await prisma.payment.findUnique({
      where: { webhookEventId: session.id },
    });
    if (existing) return NextResponse.json({ received: true });

    try {
      await prisma.$transaction(async (tx: any) => {
        const b = await tx.booking.findUnique({ where: { id: bookingId } });
        if (!b) throw new Error("Booking not found");

        await tx.payment.create({
          data: {
            bookingId,
            customerId: b.customerId,
            amount: session.amount_total / 100,
            currency: session.currency.toUpperCase(),
            status: "COMPLETED",
            provider: "STRIPE",
            transactionId: session.payment_intent,
            webhookEventId: session.id,
          },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        });

        await tx.bookingActivity.create({
          data: {
            bookingId,
            fromStatus: b.status,
            toStatus: "CONFIRMED",
            note: `Payment successful via Stripe. Session: ${session.id}`,
          },
        });
      });

      triggerAutomation("booking.confirmed", (await prisma.booking.findUnique({ where: { id: bookingId } }))!.customerId, { bookingId }).catch(console.error);
    } catch (error) {
       console.error("Stripe webhook processing error:", error);
       return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
