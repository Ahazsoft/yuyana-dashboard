import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const tours = await prisma.tourPackage.findMany({
      include: {
        tourPlanDays: {
          orderBy: { dayNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tours, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("Error fetching tours:", error);

    return NextResponse.json(
      { error: "Failed to fetch tours" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// // app/api/tours/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET() {
//   try {
//     const tours = await prisma.tourPackage.findMany({
//       include: {
//         tourPlanDays: {
//           orderBy: { dayNumber: "asc" },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json(tours, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching tours:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch tours" },
//       { status: 500 }
//     );
//   }
// }