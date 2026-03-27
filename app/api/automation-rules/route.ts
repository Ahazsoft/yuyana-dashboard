import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireRole } from "@/lib/auth/require-role";
import { z } from "zod";

const ruleSchema = z.object({
  name: z.string().min(1),
  trigger: z.string().min(1),
  emailSubject: z.string().min(1),
  emailTemplateId: z.string().min(1),
  active: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.automationRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req);
  const forbidden = requireRole(req, "ADMIN");
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  const parsed = ruleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const rule = await prisma.automationRule.create({
    data: {
      ...parsed.data,
      createdBy: auth!.userId,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}
