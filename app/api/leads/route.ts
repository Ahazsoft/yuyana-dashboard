import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { triggerAutomation } from "@/lib/automation/engine";
import { rateLimit } from "@/lib/rate-limit";
import { getIp } from "@/lib/audit";

const leadSchema = z.object({
  customerId: z.string(),
  customersCount: z.number().int().min(1).default(1),
  source: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  value: z.number().min(0).default(0),
  assignedTo: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const take = parseInt(url.searchParams.get("take") || "50");
  const status = url.searchParams.get("status"); // optional filter
  const assignedTo = url.searchParams.get("assignedTo"); // optional filter

  const where: any = {};
  if (status) where.status = status;
  if (assignedTo) where.assignedTo = assignedTo;
  
  // Sales agents can only see leads assigned to them or unassigned
  if (auth.role === "SALES") {
    where.OR = [
      { assignedTo: auth.userId },
      { assignedTo: null }
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ data: leads, meta: { total, skip, take } });
}

export async function POST(req: NextRequest) {
  const ip = getIp(req) ?? "unknown";
  const rl = rateLimit(`leads-public:${ip}`, 10, 60 * 60 * 1000); // 10 per hour
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      ...parsed.data,
      createdBy: auth.userId,
    },
  });

  await logAudit({
    actorId: auth.userId,
    action: "lead.created",
    entityType: "Lead",
    entityId: lead.id,
    meta: { customerId: lead.customerId, assigned: lead.assignedTo },
  });

  // Trigger automation asynchronously
  triggerAutomation("lead.created", lead.customerId, { leadId: lead.id }).catch(console.error);

  return NextResponse.json(lead, { status: 211 });
}
