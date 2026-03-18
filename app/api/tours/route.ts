import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import { Prisma } from "@/lib/generated/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {


   // Optional: parse query parameters for pagination, filtering, etc.
    // const { searchParams } = new URL(request.url);
    // const page = parseInt(searchParams.get('page') || '1');
    // const limit = parseInt(searchParams.get('limit') || '10');
    // const skip = (page - 1) * limit;

  try {
    const tours = await prisma.tourPackage.findMany({
      include: { tourPlanDays: { orderBy: { dayNumber: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    if (!tours) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(tours);
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
