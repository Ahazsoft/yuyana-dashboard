import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/require-role";
import { convertLeadToBooking } from "@/lib/crm/conversion";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await convertLeadToBooking(id, auth.userId);

    await logAudit({
      actorId: auth.userId,
      action: "lead.converted",
      entityType: "Lead",
      entityId: id,
      meta: { bookingId: result.booking.id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Lead successfully converted to booking",
      bookingId: result.booking.id 
    });
  } catch (err) {
    console.error("Conversion failed:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Conversion failed" 
    }, { status: 500 });
  }
}
