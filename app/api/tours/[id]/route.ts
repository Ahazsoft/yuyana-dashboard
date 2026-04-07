//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";


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

async function ensureDir(dir: string) {
  try { await mkdir(dir, { recursive: true }); } catch {}
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const id = params.id;

    const safeParse = (val: FormDataEntryValue | null, fallback = null) => {
      if (!val) return fallback;
      try { return JSON.parse(val as string); } catch { return fallback; }
    };

    const slugUrl = formData.get("slugUrl") as string;
    const tourTitle = formData.get("tourTitle") as string;
    const tourDestination = formData.get("tourDestination") as string;
    const tourDescription = formData.get("tourDescription") as string | null;
    const tourDurationStr = formData.get("tourDuration") as string;
    const tourDuration = tourDurationStr ? Number(tourDurationStr) : null;

    const included = safeParse(formData.get("included"), []);
    const excluded = safeParse(formData.get("excluded"), []);
    const tourPrice = safeParse(formData.get("tourPrice"), null);
    const tourPlanDays = safeParse(formData.get("tourPlanDays"), []);

    if (!slugUrl || !tourTitle || !tourDestination) 
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    if (!Array.isArray(tourPlanDays) || tourPlanDays.length === 0)
      return NextResponse.json({ error: "tourPlanDays must be a non-empty array" }, { status: 400 });

    // Files
    const imageFile = formData.get("image") as File | null;
    const documentFile = formData.get("document") as File | null;
    const existingImageUrl = formData.get("imageUrl") as string | null;
    const existingDocumentUrl = formData.get("documentUrl") as string | null;

    const imagesDir = path.join(process.cwd(), "public/images");
    const documentsDir = path.join(process.cwd(), "public/documents");
    await ensureDir(imagesDir);
    await ensureDir(documentsDir);

    let imageUrl: string | null = null;
    let tourDocumentUrl: string | null = null;

    if (imageFile && imageFile instanceof File) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${imageFile.name.replace(/\s/g, "_")}`;
      await writeFile(path.join(imagesDir, fileName), buffer);
      imageUrl = `/images/${fileName}`;
    } else imageUrl = existingImageUrl;

    if (documentFile && documentFile instanceof File) {
      const bytes = await documentFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${documentFile.name.replace(/\s/g, "_")}`;
      await writeFile(path.join(documentsDir, fileName), buffer);
      tourDocumentUrl = `/documents/${fileName}`;
    } else tourDocumentUrl = existingDocumentUrl;

    const updatedTour = await prisma.$transaction(async (tx) => {
      await tx.tourPlanDay.deleteMany({ where: { tourPackageId: id } });
      return tx.tourPackage.update({
        where: { id },
        data: {
          slugUrl, tourTitle, tourDestination, imageUrl, tourDescription,
          tourDuration, tourPrice: tourPrice ?? Prisma.DbNull,
          included, excluded, tourDocumentUrl,
          tourPlanDays: { create: tourPlanDays.map((d: any) => ({
            dayNumber: d.dayNumber, title: d.title, description: d.description,
            items: d.items, boldtext: d.boldtext,
          })) },
        },
        include: { tourPlanDays: { orderBy: { dayNumber: "asc" } } },
      });
    });

    return NextResponse.json(updatedTour);
  } catch (error) {
    console.error("PUT error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return NextResponse.json({ error: "Duplicate slug" }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
