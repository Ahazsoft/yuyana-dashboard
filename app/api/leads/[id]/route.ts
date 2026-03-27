import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  value: z.number().min(0).optional(),
  assignedTo: z.string().nullable().optional(),
  customersCount: z.number().int().min(1).optional(),
  source: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      customer: true,
      activities: { orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true } }, // creator
    },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Access check for SALES role
  if (auth.role === "SALES" && lead.assignedTo && lead.assignedTo !== auth.userId) {
     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(lead);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (auth.role === "SALES" && lead.assignedTo && lead.assignedTo !== auth.userId) {
     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: parsed.data,
  });

  await logAudit({
    actorId: auth.userId,
    action: "lead.updated",
    entityType: "Lead",
    entityId: id,
    meta: { fieldsUpdated: Object.keys(parsed.data) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN");
  if (forbidden) return forbidden;

  try {
    await prisma.lead.delete({ where: { id } });
    await logAudit({
      actorId: auth!.userId,
      action: "lead.deleted",
      entityType: "Lead",
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
