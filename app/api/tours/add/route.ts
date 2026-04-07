import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 } from "uuid";

async function uploadToSupabase(
  file: File,
  folder: string,
  bucket: string = "Images And Documents",
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "";
  const uniqueName = `${v4()}.${ext}`; // ✅ use v4()
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

// Helper: delete a file from Supabase (for rollback)
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

export async function POST(request: Request) {
  let uploadedImageUrl: string | null = null;
  let uploadedDocumentUrl: string | null = null;

  try {
    const formData = await request.formData();

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

    // --- Validate required fields ---
    if (!slugUrl || !tourTitle || !tourDestination) {
      return NextResponse.json(
        {
          error: "Missing required fields: slugUrl, tourTitle, tourDestination",
        },
        { status: 400 },
      );
    }

    // --- Handle file uploads to Supabase ---
    const imageFile = formData.get("image") as File | null;
    const documentFile = formData.get("document") as File | null;

    let imageUrl: string | null = null;
    let tourDocumentUrl: string | null = null;

    if (imageFile) {
      imageUrl = await uploadToSupabase(imageFile, "tours");
      uploadedImageUrl = imageUrl;
    }

    if (documentFile) {
      tourDocumentUrl = await uploadToSupabase(documentFile, "documents");
      uploadedDocumentUrl = tourDocumentUrl;
    }

    // --- Create tour in database ---
    const newTour = await prisma.tourPackage.create({
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

    return NextResponse.json(newTour, { status: 201 });
  } catch (error) {
    console.error("Error creating tour:", error);

    // Rollback: delete uploaded files if DB creation failed
    if (uploadedImageUrl) {
      await deleteFromSupabase(uploadedImageUrl);
    }
    if (uploadedDocumentUrl) {
      await deleteFromSupabase(uploadedDocumentUrl);
    }

    // Handle known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A tour with this slug already exists" },
          { status: 409 },
        );
      }
    }

    // Handle JSON parse errors
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
