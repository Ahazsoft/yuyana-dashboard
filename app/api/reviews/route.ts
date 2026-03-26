import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        customer: { select: { firstName: true, lastName: true } },
        tourPackage: { select: { tourTitle: true } },
      },
    }),
    prisma.review.count(),
  ]);

  return NextResponse.json({ data: reviews, meta: { total } });
}

export async function PUT(req: NextRequest) {
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN", "MARKETING");
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  if (!body?.id || typeof body?.approved !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.review.update({
    where: { id: body.id },
    data: { approved: body.approved },
  });

  return NextResponse.json(updated);
}
