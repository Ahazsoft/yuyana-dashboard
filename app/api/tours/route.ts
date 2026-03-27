import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

// The HLD uses slugUrl, imageUrl, tourTitle, tourDescription, etc.
const tourSchema = z.object({
  slugUrl: z.string().min(1),
  tourTitle: z.string().min(1),
  tourDestination: z.string().min(1),
  tourDuration: z.number().int().min(1).optional(),
  tourDescription: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  tourPrice: z.any().optional(), // Expected { amount, currency } JSON object
  included: z.array(z.string()).optional().default([]),
  excluded: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const take = parseInt(url.searchParams.get("take") || "50");
  const search = url.searchParams.get("search") || "";
  const isPublishedStr = url.searchParams.get("isPublished");

  const where: any = {};
  if (isPublishedStr !== null) {
    where.isPublished = isPublishedStr === "true";
  }
  if (search) {
    where.OR = [
      { tourTitle: { contains: search, mode: "insensitive" } },
      { tourDestination: { contains: search, mode: "insensitive" } },
    ];
  }

  const [tours, total] = await Promise.all([
    prisma.tourPackage.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: true } },
      },
    }),
    prisma.tourPackage.count({ where }),
  ]);

  return NextResponse.json({ data: tours, meta: { total, skip, take } });
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN", "MARKETING"); // Only Admin and Marketing can create tours
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  const parsed = tourSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.tourPackage.findUnique({
    where: { slugUrl: parsed.data.slugUrl },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A tour with this slug already exists" },
      { status: 409 }
    );
  }

  const tour = await prisma.tourPackage.create({
    data: parsed.data,
  });

  await logAudit({
    actorId: auth!.userId,
    action: "tour.created",
    entityType: "TourPackage",
    entityId: tour.id,
    meta: { title: tour.tourTitle, published: tour.isPublished },
  });

  return NextResponse.json(tour, { status: 211 });
}
