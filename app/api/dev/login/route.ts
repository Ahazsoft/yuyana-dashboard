import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signAccessToken, generateRefreshToken, refreshTokenExpiresAt } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Method not allowed in production" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "ADMIN";
  const email = searchParams.get("email") || `dev-${role.toLowerCase()}@yuyana.com`;

  // Find or create dev user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: `Dev ${role}`,
        password: "DEV_PASSWORD_BYPASS",
        role: role as any,
        active: true,
      },
    });
  }

  // Issue tokens
  const accessToken = await signAccessToken(user.id, user.role, user.email);
  const { raw: refreshRaw, hash: refreshHash } = await generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshHash,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  await setAuthCookies(accessToken, refreshRaw);

  const redirectUrl = new URL("/admin/leads", req.url);
  return NextResponse.redirect(redirectUrl);
}
