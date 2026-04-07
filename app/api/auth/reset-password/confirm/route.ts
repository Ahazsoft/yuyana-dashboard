import { NextRequest, NextResponse } from "next/server";
import { hash as bcryptHash } from "bcryptjs";
import { z } from "zod";
import {prisma} from "@/lib/prisma";
import { hashRefreshToken } from "@/lib/auth/jwt";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(32),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, token, password } = parsed.data;

  const providedTokenHash = await hashRefreshToken(token);

  const user = await prisma.user.findFirst({
    where: {
      email,
      passwordResetToken: providedTokenHash,
      passwordResetExpires: { gte: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired reset token" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcryptHash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });

  return NextResponse.json({ ok: true });
}
