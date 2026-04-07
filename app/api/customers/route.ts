import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const take = parseInt(url.searchParams.get("take") || "50");
  const search = url.searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({ data: customers, meta: { total, skip, take } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = await prisma.customer.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Customer with this email already exists" },
      { status: 409 }
    );
  }

  const customer = await prisma.customer.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}