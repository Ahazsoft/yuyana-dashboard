import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const publishSchema = z.object({
  isPublished: z.boolean(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN", "MARKETING");
  if (forbidden) return forbidden;

  const tour = await prisma.tourPackage.findUnique({ where: { id } });
  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = publishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { isPublished } = parsed.data;

  if (tour.isPublished === isPublished) {
    return NextResponse.json(tour);
  }


  // tours/route.ts
  // tour/[id]/route.ts

  const updated = await prisma.tourPackage.update({
    where: { id },
    data: { isPublished },
  });

  await logAudit({
    actorId: auth!.userId,
    action: isPublished ? "tour.published" : "tour.unpublished",
    entityType: "TourPackage",
    entityId: id,
  });

  return NextResponse.json(updated);
}