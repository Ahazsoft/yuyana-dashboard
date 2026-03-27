import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

/**
 * Role hierarchy: ADMIN > MARKETING > SALES > VIEWER
 * Returns null if check passes; returns a 403 NextResponse if denied.
 */
export function requireRole(
  req: NextRequest,
  ...allowedRoles: UserRole[]
): NextResponse | null {
  const userRole = req.headers.get("x-user-role") as UserRole | null;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }

  return null;
}

/** Get current authenticated user id from request headers (set by middleware) */
export function getAuthUser(req: NextRequest): {
  userId: string;
  role: UserRole;
  email: string;
} | null {
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role") as UserRole | null;
  const email = req.headers.get("x-user-email");

  if (!userId || !role || !email) return null;
  return { userId, role, email };
}
