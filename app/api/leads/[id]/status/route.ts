import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/require-role";
import { z } from "zod";
import type { LeadStatus } from "@prisma/client";
import { logAudit } from "@/lib/audit";

const statusSchema = z.object({
  status: z.enum([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL_SENT",
    "NEGOTIATING",
    "WON",
    "LOST",
    "ARCHIVED",
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

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (auth.role === "SALES" && lead.assignedTo && lead.assignedTo !== auth.userId) {
     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { status, note } = parsed.data;

  // Prevent redundant status updates
  if (lead.status === status) {
    return NextResponse.json(lead);
  }

  const conversionDate = status === "WON" ? new Date() : lead.conversionDate;

  // Transaction: Update lead state and log activity sequentially
  const updated = await prisma.$transaction(async (tx: any) => {
    const l = await tx.lead.update({
      where: { id },
      data: { status, conversionDate },
    });

    await tx.leadActivity.create({
      data: {
        leadId: id,
        fromStatus: lead.status,
        toStatus: status,
        changedBy: auth.userId,
        note: note || `Status changed from ${lead.status} to ${status}`,
      },
    });

    return l;
  });

  await logAudit({
    actorId: auth.userId,
    action: "lead.status_changed",
    entityType: "Lead",
    entityId: id,
    meta: { from: lead.status, to: status },
  });

  return NextResponse.json(updated);
}
