import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.email().optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().optional(),
  subscriptionStatus: z.enum(["SUBSCRIBED", "UNSUBSCRIBED", "BOUNCED", "COMPLAINED"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      _count: {
        select: { leads: true, bookings: true },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const updated = await prisma.customer.update({
      where: { id },
      data: parsed.data,
    });

    await logAudit({
      actorId: auth.userId,
      action: "customer.updated",
      entityType: "Customer",
      entityId: id,
      meta: { fieldsUpdated: Object.keys(parsed.data) },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN");
  if (forbidden) return forbidden; // Only ADMIN can delete customers

  try {
    await prisma.customer.update({
      where: { id },
      data: { /* status: "archived" */ },
    });

    await logAudit({
      actorId: auth!.userId,
      action: "customer.archived",
      entityType: "Customer",
      entityId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
