import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {prisma} from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/auth/jwt";
import { getIp } from "@/lib/audit";

import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = getIp(req) ?? "unknown";
  const rl = rateLimit(`reset-password:${ip}`, 3, 60 * 60 * 1000); // 3 per hour
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const { hash, expires } = await generatePasswordResetToken();

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: hash, passwordResetExpires: expires },
  });

  // TODO: send email via Resend once email module is complete
  // For now, log the raw token URL to stdout in dev
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[DEV] Password reset link: ${appUrl}/admin/reset-password?token=${hash}&email=${email}`
    );
  }

  return NextResponse.json({ ok: true });
}
