import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import {prisma} from "@/lib/prisma";
import {
  signAccessToken,
  generateRefreshToken,
  refreshTokenExpiresAt,
} from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { logAudit, getIp } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const ip = getIp(req) ?? "unknown";

  // Rate limit: 5 attempts per IP per 15 minutes
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many login attempts. Retry after ${rl.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        active: true,
        // failedLoginCount: true,
        // lockedUntil: true,
      },
    });
  } catch (err) {
    console.error("[Login] Database error:", err);
    return NextResponse.json(
      { error: "Internal server error (database)" },
      { status: 500 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Account locked?
  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const retryAfter = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 1000
    );
    return NextResponse.json(
      { error: `Account locked. Retry after ${retryAfter}s.` },
      { status: 423 }
    );
  }

  const passwordValid = user ? await compare(password, user.password) : false;

  if (!user || !passwordValid) {
    // Increment failed count and lock if >= 5
    if (user) {
      const newCount = (user.failedLoginCount ?? 0) + 1;
      const lockedUntil = newCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: newCount, lockedUntil },
        });
      } catch (err) {
        console.error("[Login] Failed to update failedLoginCount:", err);
      }
    }
    await logAudit({
      action: "user.login_failed",
      entityType: "User",
      ipAddress: ip,
      meta: { email },
    });
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  if (!user.active) {
    return NextResponse.json(
      { error: "Account is deactivated. Contact your administrator." },
      { status: 403 }
    );
  }

  // Reset failed count + update lastLoginAt
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
  } catch (err) {
    console.error("[Login] Failed to reset failedLoginCount:", err);
  }

  // Issue tokens
  const accessToken = await signAccessToken(user.id, user.role, user.email);
  const { raw: refreshRaw, hash: refreshHash } = await generateRefreshToken();

  try {
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt: refreshTokenExpiresAt(),
      },
    });
  } catch (err) {
    console.error("[Login] Failed to create refresh token:", err);
    return NextResponse.json({ error: "Internal server error (token)" }, { status: 500 });
  }

  await setAuthCookies(accessToken, refreshRaw);

  await logAudit({
    actorId: user.id,
    action: "user.login_success",
    entityType: "User",
    entityId: user.id,
    ipAddress: ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role },
  });
}
