import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { verifyChapaWebhook } from "@/lib/payments/chapa";
// import { triggerAutomation } from "@/lib/automation/engine";

export async function POST(req: NextRequest) {
  // const signature = req.headers.get("x-chapa-signature");
  // if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 401 });

  // const bodyText = await req.text();
  // const isValid = verifyChapaWebhook(bodyText, signature);
  // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  // const event = JSON.parse(bodyText);
  // const { tx_ref, status, amount, currency, email } = event;

  // // Extract bookingId from txRef (e.g. booking_id_timestamp)
  // const bookingId = tx_ref.split("_")[1];
  // if (!bookingId) return NextResponse.json({ error: "Invalid reference" }, { status: 400 });

  // // Idempotency check
  // const existing = await prisma.payment.findUnique({
  //   where: { webhookEventId: tx_ref }, // Using tx_ref as event ID if not provided separately
  // });
  // if (existing) return NextResponse.json({ received: true });

  // const paymentStatus = status === "success" ? "COMPLETED" : "FAILED";

  // try {
  //   await prisma.$transaction(async (tx: any) => {
  //     // 1. Create/Update Payment record
  //     await tx.payment.create({
  //       data: {
  //         bookingId,
  //         customerId: (await tx.booking.findUnique({ where: { id: bookingId } })).customerId,
  //         amount: parseFloat(amount),
  //         currency,
  //         status: paymentStatus,
  //         provider: "CHAPA",
  //         transactionId: event.reference || tx_ref,
  //         webhookEventId: tx_ref,
  //       },
  //     });

  //     // 2. Update Booking status if success
  //     if (status === "success") {
  //       await tx.booking.update({
  //         where: { id: bookingId },
  //         data: { status: "CONFIRMED" },
  //       });

  //       // Log activity
  //       await tx.bookingActivity.create({
  //         data: {
  //           bookingId,
  //           fromStatus: "INQUIRY", // Simplified
  //           toStatus: "CONFIRMED",
  //           note: `Payment successful via Chapa. Ref: ${tx_ref}`,
  //         },
  //       });
  //     }
  //   });

  //   // 3. Trigger automation
  //   if (status === "success") {
  //     const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  //     if (booking) {
  //       triggerAutomation("booking.confirmed", booking.customerId, { bookingId }).catch(console.error);
  //     }
  //   }

  return NextResponse.json({ received: true });
  // } catch (error) {
  //   console.error("Webhook processing error:", error);
  //   return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  // }
}
