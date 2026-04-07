// app/api/tours/edit/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {  Prisma } from "@prisma/client";
import {prisma} from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 } from "uuid";


// Helper: upload a file to Supabase Storage
async function uploadToSupabase(
  file: File,
  folder: string,
  bucket: string = "Images And Documents",
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "";
  const uniqueName = `${v4()}.${ext}`;
  const filePath = `${folder}/${uniqueName}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Helper: delete a file from Supabase
async function deleteFromSupabase(
  fileUrl: string,
  bucket: string = "Images And Documents",
) {
  try {
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split("/");
    const bucketIndex = pathParts.findIndex((part) => part === bucket);
    if (bucketIndex !== -1) {
      const filePath = pathParts.slice(bucketIndex + 1).join("/");
      await supabaseAdmin.storage.from(bucket).remove([filePath]);
    }
  } catch (err) {
    console.error("Failed to delete file from Supabase:", err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let newlyUploadedImageUrl: string | null = null;
  let newlyUploadedDocumentUrl: string | null = null;
  let oldImageUrl: string | null = null;
  let oldDocumentUrl: string | null = null;

  try {
    const { id } = await params;

    // Find existing tour (by UUID or slugUrl)
    const existingTour = await prisma.tourPackage.findFirst({
      where: {
        OR: [{ id }, { slugUrl: id }],
      },
    });

    if (!existingTour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    const formData = await req.formData();

    // --- Extract text fields ---
    const slugUrl = formData.get("slugUrl") as string;
    const tourTitle = formData.get("tourTitle") as string;
    const tourDestination = formData.get("tourDestination") as string;
    const tourDescription = formData.get("tourDescription") as string | null;
    const tourDuration = formData.get("tourDuration")
      ? Number(formData.get("tourDuration"))
      : null;
    const included = formData.get("included")
      ? JSON.parse(formData.get("included") as string)
      : [];
    const excluded = formData.get("excluded")
      ? JSON.parse(formData.get("excluded") as string)
      : [];
    const tourPrice = formData.get("tourPrice")
      ? JSON.parse(formData.get("tourPrice") as string)
      : null;
    const tourPlanDays = formData.get("tourPlanDays")
      ? JSON.parse(formData.get("tourPlanDays") as string)
      : [];
    const isPublished = formData.get("isPublished") === "true";

    // --- Validate required fields ---
    if (!slugUrl || !tourTitle || !tourDestination) {
      return NextResponse.json(
        {
          error: "Missing required fields: slugUrl, tourTitle, tourDestination",
        },
        { status: 400 },
      );
    }

    // Check slug uniqueness (if changed)
    if (slugUrl !== existingTour.slugUrl) {
      const slugExists = await prisma.tourPackage.findUnique({
        where: { slugUrl },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug URL already exists" },
          { status: 409 },
        );
      }
    }

    // --- Handle file uploads (new files replace old ones) ---
    const imageFile = formData.get("image") as File | null;
    const documentFile = formData.get("document") as File | null;

    let imageUrl = existingTour.imageUrl;
    let tourDocumentUrl = existingTour.tourDocumentUrl;

    // Store old URLs for potential rollback deletion
    oldImageUrl = existingTour.imageUrl;
    oldDocumentUrl = existingTour.tourDocumentUrl;

    if (imageFile) {
      // Upload new image
      imageUrl = await uploadToSupabase(imageFile, "tours");
      newlyUploadedImageUrl = imageUrl;
      // Delete old image from Supabase (if exists)
      if (oldImageUrl) {
        await deleteFromSupabase(oldImageUrl);
        oldImageUrl = null; // prevent double deletion on rollback
      }
    }

    if (documentFile) {
      tourDocumentUrl = await uploadToSupabase(documentFile, "documents");
      newlyUploadedDocumentUrl = tourDocumentUrl;
      if (oldDocumentUrl) {
        await deleteFromSupabase(oldDocumentUrl);
        oldDocumentUrl = null;
      }
    }

    // --- Update tour in database (replace plan days) ---
    const updatedTour = await prisma.$transaction(async (tx) => {
      // Delete existing plan days
      await tx.tourPlanDay.deleteMany({
        where: { tourPackageId: existingTour.id },
      });

      // Update main tour
      const updated = await tx.tourPackage.update({
        where: { id: existingTour.id },
        data: {
          slugUrl,
          tourTitle,
          tourDestination,
          imageUrl,
          tourDescription,
          tourDuration,
          tourPrice: tourPrice ?? Prisma.DbNull,
          included,
          excluded,
          tourDocumentUrl,
          isPublished,
          tourPlanDays: {
            create: tourPlanDays.map((day: any) => ({
              dayNumber: day.dayNumber,
              title: day.title ?? null,
              description: day.description ?? null,
              items: day.items ?? [],
              boldtext: day.boldtext ?? null,
            })),
          },
        },
        include: {
          tourPlanDays: {
            orderBy: { dayNumber: "asc" },
          },
        },
      });

      return updated;
    });

    return NextResponse.json(
      { message: "Tour updated successfully", tour: updatedTour },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating tour:", error);

    // Rollback: delete newly uploaded files if something went wrong
    if (newlyUploadedImageUrl) {
      await deleteFromSupabase(newlyUploadedImageUrl);
    }
    if (newlyUploadedDocumentUrl) {
      await deleteFromSupabase(newlyUploadedDocumentUrl);
    }
    // If old files were deleted and DB update failed, there's no recovery – log it
    if (oldImageUrl) console.error("Old image not restored:", oldImageUrl);
    if (oldDocumentUrl)
      console.error("Old document not restored:", oldDocumentUrl);

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A tour with this slug already exists" },
          { status: 409 },
        );
      }
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON format in one of the fields" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// GET: Fetch a single tour by ID or slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tour = await prisma.tourPackage.findFirst({
      where: {
        OR: [{ id }, { slugUrl: id }],
      },
      include: {
        tourPlanDays: {
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    return NextResponse.json(tour);
  } catch (error) {
    console.error("Error fetching tour:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// DELETE: Remove a tour and its associated files
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Find the tour (by UUID or slug) to get file URLs
    const tour = await prisma.tourPackage.findFirst({
      where: {
        OR: [{ id }, { slugUrl: id }],
      },
    });

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    // Delete files from Supabase (if they exist)
    if (tour.imageUrl) {
      await deleteFromSupabase(tour.imageUrl);
    }
    if (tour.tourDocumentUrl) {
      await deleteFromSupabase(tour.tourDocumentUrl);
    }

    // Delete the tour from database (tourPlanDays will be cascaded if schema has onDelete: Cascade)
    await prisma.tourPackage.delete({
      where: { id: tour.id },
    });

    return NextResponse.json(
      { message: "Tour deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting tour:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
