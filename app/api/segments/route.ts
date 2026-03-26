import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { getSegmentRecipientCount } from "@/lib/email/segmentation";

const segmentSchema = z.object({
  name: z.string().min(1),
  criteria: z.record(z.string(), z.any()),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = await prisma.segment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { campaigns: true } },
    },
  });

  return NextResponse.json(segments);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN", "MARKETING");
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  const parsed = segmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const segment = await prisma.segment.create({
    data: {
      name: parsed.data.name,
      criteria: parsed.data.criteria,
      createdBy: auth!.userId,
    },
  });

  return NextResponse.json(segment);
}

// POST /api/segments/count — preview recipient count for criteria
export async function PATCH(req: NextRequest) {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body?.criteria) return NextResponse.json({ error: "Missing criteria" }, { status: 400 });

    const count = await getSegmentRecipientCount(body.criteria);
    return NextResponse.json({ count });
}
