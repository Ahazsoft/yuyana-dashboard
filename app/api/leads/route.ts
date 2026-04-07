import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const leadSchema = z.object({
  customerId: z.string(),
  source: z.string().optional(),
  description: z.string().optional(),
  estimatedValue: z.number().min(0).optional(),
  userId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const take = parseInt(url.searchParams.get("take") || "50");
  const status = url.searchParams.get("status");
  const userId = url.searchParams.get("userId");

  const where: any = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ data: leads, meta: { total, skip, take } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      customerId: parsed.data.customerId,
      source: parsed.data.source,
      description: parsed.data.description,
      estimatedValue: parsed.data.estimatedValue,
      userId: parsed.data.userId || null,
      priority: parsed.data.priority,
      status: (parsed.data.status as any) || "NEW",
    },
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      type: "CREATED",
      description: `Lead created from ${lead.source || "Unknown source"}`,
    },
  });

  return NextResponse.json(lead, { status: 201 });
}