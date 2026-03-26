import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const campaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  segmentId: z.string().optional(),
  scheduledDate: z.string().datetime().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      segment: { select: { name: true } },
      _count: { select: { emailLogs: true } },
    },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN", "MARKETING");
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      ...parsed.data,
      status: "DRAFT",
      createdBy: auth!.userId,
    },
  });

  await logAudit({
    actorId: auth!.userId,
    action: "campaign.created",
    entityType: "Campaign",
    entityId: campaign.id,
    meta: { name: campaign.name },
  });

  return NextResponse.json(campaign, { status: 201 });
}
