import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  hashRefreshToken,
  signAccessToken,
  generateRefreshToken,
  refreshTokenExpiresAt,
} from "@/lib/auth/jwt";
import {
  getRefreshTokenFromCookies,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies";

export async function POST(req: NextRequest) {
  const rawToken = await getRefreshTokenFromCookies();

  if (!rawToken) {
    return NextResponse.json(
      { error: "No refresh token" },
      { status: 401 }
    );
  }

  const tokenHash = await hashRefreshToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, email: true, role: true, active: true } } },
  });

  if (!stored || stored.expiresAt < new Date()) {
    await clearAuthCookies();
    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }

  if (!stored.user.active) {
    await clearAuthCookies();
    return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
  }

  // Rotate: delete old token, issue new pair
  await prisma.refreshToken.delete({ where: { tokenHash } });

  const accessToken = await signAccessToken(
    stored.user.id,
    stored.user.role,
    stored.user.email
  );
  const { raw: refreshRaw, hash: refreshHash } = await generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: stored.user.id,
      tokenHash: refreshHash,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  await setAuthCookies(accessToken, refreshRaw);

  return NextResponse.json({ ok: true });
}
