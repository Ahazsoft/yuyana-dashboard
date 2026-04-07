// @ts-nocheck
import {prisma} from "@/lib/prisma";

export async function convertLeadToBooking(leadId: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Lead data
    const lead = await tx.lead.findUnique({
      where: { id: leadId },
      include: { customer: true }
    });

    if (!lead) throw new Error("Lead not found");
    if (lead.status === "WON") throw new Error("Lead already converted");

    // 2. Find a default tour package if none specified
    const defaultPackage = await tx.tourPackage.findFirst();
    if (!defaultPackage) throw new Error("No tour packages available for conversion template.");

    // 3. Create a tentative Booking linked to the Customer
    const booking = await tx.booking.create({
      data: {
        customerId: lead.customerId,
        userId: userId,
        tourPackageId: defaultPackage.id,
        numberOfGuests: 1,
        agreedPrice: lead.estimatedValue || 0,
        totalPrice: lead.estimatedValue || 0,
        status: "TENTATIVE",
        notes: `Converted from Lead ID: ${lead.id}. Original description: ${lead.description || "No description provided."}`,
      }
    });

    // 4. Update Lead status to WON
    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: "WON",
      }
    });

    // 5. Log Activity for the Lead
    await tx.leadActivity.create({
      data: {
        leadId: leadId,
        type: "CONVERSION",
        description: `Lead successfully converted to Booking ID: ${booking.id}`,
      }
    });

    // 6. Log Activity for the new Booking
    await tx.bookingActivity.create({
      data: {
        bookingId: booking.id,
        type: "CREATED",
        description: `Booking generated from Lead conversion.`,
      }
    });

    return { lead, booking };
  });
}
