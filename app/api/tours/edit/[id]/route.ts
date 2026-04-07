import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
// import { Prisma } from "@prisma/client";

// async function ensureDir(dir: string) {
//   try { await mkdir(dir, { recursive: true }); } catch {}
// }

// export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   try {
//     const tour = await prisma.tourPackage.findUnique({
//       where: { id },
//       include: { tourPlanDays: { orderBy: { dayNumber: "asc" } } },
//     });
//     if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
//     return NextResponse.json(tour);
//   } catch (err) {
//     console.error(err); 
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

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
