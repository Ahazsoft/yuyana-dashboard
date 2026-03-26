import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.update({
      where: { unsubscribeToken: token },
      data: { subscriptionStatus: "UNSUBSCRIBED" },
    });

    return NextResponse.json({ 
        message: `Successfully unsubscribed ${customer.email}`,
        email: customer.email 
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token or customer not found" }, { status: 404 });
  }
}
