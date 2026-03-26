import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { hash as bcryptHash } from "bcryptjs";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const userSchema = z.object({
  email: z.email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "SALES", "MARKETING", "VIEWER"]),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN");
  if (forbidden) return forbidden;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN");
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { email, name, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const hashedPassword = await bcryptHash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
      active: true,
    },
  });

  await logAudit({
    actorId: auth?.userId,
    action: "user.created",
    entityType: "User",
    entityId: user.id,
    meta: { email, role },
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 211 });
}
