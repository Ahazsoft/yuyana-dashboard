import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  tourTitle: z.string().min(1).optional(),
  tourDestination: z.string().min(1).optional(),
  tourDuration: z.number().int().min(1).optional(),
  tourDescription: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  tourPrice: z.any().optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  // slugUrl and isPublished are handled separately (isPublished via /publish route)
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tour = await prisma.tourPackage.findUnique({
    where: { id },
    include: {
      tourPlanDays: { orderBy: { dayNumber: "asc" } },
      bookings: {
        select: { id: true, status: true, travelDate: true, customer: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 10, // Just show recent 10 bookings on the tour detail page
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tour);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN", "MARKETING");
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const updated = await prisma.tourPackage.update({
      where: { id },
      data: parsed.data,
    });

    await logAudit({
      actorId: auth!.userId,
      action: "tour.updated",
      entityType: "TourPackage",
      entityId: id,
      meta: { fieldsUpdated: Object.keys(parsed.data) },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN");
  if (forbidden) return forbidden; // Only ADMIN can delete tours

  try {
    // We should probably check if there are existing bookings before hard deleting,
    // or rely on Prisma relations (if onDelete is not Cascade, it will throw).
    const bookingsCount = await prisma.booking.count({ where: { tourPackageId: id } });
    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete a tour package that has existing bookings. Please unpublish it instead." },
        { status: 400 }
      );
    }

    await prisma.tourPackage.delete({ where: { id } });

    await logAudit({
      actorId: auth!.userId,
      action: "tour.deleted",
      entityType: "TourPackage",
      entityId: id,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
