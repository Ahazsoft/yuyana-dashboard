import { NextRequest, NextResponse } from "next/server";
import { TourJSONRepository } from "@/lib/tours-json";
import { z } from "zod";

const tourSchema = z.object({
  slugUrl: z.string().min(1),
  tourTitle: z.string().min(1),
  tourDestination: z.string().min(1),
  tourDuration: z.number().int().min(1).optional(),
  tourDescription: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  tourPrice: z.any().optional(),
  included: z.array(z.string()).optional().default([]),
  excluded: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  console.log(">> API: /api/tours hit");
  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const take = parseInt(url.searchParams.get("take") || "100");
  const search = url.searchParams.get("search") || "";
  const isPublishedStr = url.searchParams.get("isPublished");

  let tours = TourJSONRepository.getAll();

  // Apply filters
  if (isPublishedStr !== null) {
    const isPublished = isPublishedStr === "true";
    tours = tours.filter((t) => t.isPublished === isPublished);
  }

  if (search) {
    const s = search.toLowerCase();
    tours = tours.filter(
      (t) =>
        t.tourTitle.toLowerCase().includes(s) ||
        t.tourDestination.toLowerCase().includes(s)
    );
  }

  const total = tours.length;
  const paginatedTours = tours.slice(skip, skip + take);

  return NextResponse.json({
    data: paginatedTours,
    meta: { total, skip, take },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = tourSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = TourJSONRepository.getBySlug(parsed.data.slugUrl);
  if (existing) {
    return NextResponse.json(
      { error: "A tour with this slug already exists" },
      { status: 409 }
    );
  }

  const tour = TourJSONRepository.create(parsed.data);
  return NextResponse.json(tour, { status: 201 });
}