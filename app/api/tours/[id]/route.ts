//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { TourJSONRepository } from "@/lib/tours-json";
import { z } from "zod";

const updateSchema = z.object({
  tourTitle: z.string().min(1).optional(),
  tourDestination: z.string().min(1).optional(),
  tourDuration: z.number().int().min(1).optional(),
  tourDescription: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  tourPrice: z.any().optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tour = TourJSONRepository.getById(id);

  if (!tour) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  // Add mock bookings count for consistency with previous API
  const tourWithAnalytics = {
    ...tour,
    _count: { bookings: 0 }, // For now, mock bookings as we moved away from Prisma for Tours
    bookings: [],
  };

  return NextResponse.json(tourWithAnalytics);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updated = TourJSONRepository.update(id, parsed.data);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deleted = TourJSONRepository.delete(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
