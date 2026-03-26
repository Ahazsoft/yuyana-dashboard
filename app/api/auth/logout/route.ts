import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashRefreshToken } from "@/lib/auth/jwt";
import {
  getRefreshTokenFromCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies";
import { logAudit, getIp } from "@/lib/audit";
import { getAuthUser } from "@/lib/auth/require-role";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const rawToken = await getRefreshTokenFromCookies();

  // Clean up refresh token from DB if present
  if (rawToken) {
    const tokenHash = await hashRefreshToken(rawToken);
    await prisma.refreshToken
      .delete({ where: { tokenHash } })
      .catch(() => {}); // ignore if already deleted
  }

  await clearAuthCookies();

  if (userId) {
    await logAudit({
      actorId: userId,
      action: "user.logout",
      entityType: "User",
      entityId: userId,
      ipAddress: getIp(req),
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
