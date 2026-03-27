import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { getSegmentsByCriteria } from "@/lib/email/segmentation";
import { sendEmail } from "@/lib/email/resend";
import { logAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN", "MARKETING");
  if (forbidden) return forbidden;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { segment: true },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status === "RUNNING" || campaign.status === "COMPLETED") {
    return NextResponse.json({ error: "Campaign already executed" }, { status: 400 });
  }

  const criteria = campaign.segment?.criteria || campaign.targetSegment;
  if (!criteria) {
    return NextResponse.json({ error: "No segment or criteria defined" }, { status: 400 });
  }

  // Set status to RUNNING
  await prisma.campaign.update({
    where: { id },
    data: { status: "RUNNING" },
  });

  const recipients = await getSegmentsByCriteria(criteria as any);

  // Dispatch emails
  const results = [];
  for (const recipient of recipients) {
    const { success, data } = await sendEmail({
      to: recipient.email,
      subject: campaign.subject || "No Subject",
      html: campaign.content || "",
    });

    results.push({ email: recipient.email, success });

    // Log to EmailLog
    await prisma.emailLog.create({
      data: {
        campaignId: id,
        userId: auth!.userId,
        recipientEmail: recipient.email,
        status: success ? "SENT" : "FAILED",
        createdAt: new Date(),
      },
    });
  }

  // Finalize status
  await prisma.campaign.update({
    where: { id },
    data: { status: "COMPLETED", sentDate: new Date(), recipientCount: recipients.length },
  });

  await logAudit({
    actorId: auth!.userId,
    action: "campaign.executed",
    entityType: "Campaign",
    entityId: id,
    meta: { recipients: recipients.length },
  });

  return NextResponse.json({ success: true, count: recipients.length });
}
