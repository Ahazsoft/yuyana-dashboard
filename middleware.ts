import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/auth/cookies";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/reset-password",
  "/api/leads",        // public form submission
  "/api/bookings",     // public booking submission
  "/api/email/unsubscribe",
  "/api/health",
  "/admin/login",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes through
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Only protect /admin/* and /api/* routes
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(COOKIE_ACCESS)?.value;

  if (!accessToken) {
    // For API routes return 401 JSON; for page routes redirect to login
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    // Token invalid or expired — attempt refresh is handled client-side
    // For API: return 401 with hint to refresh
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Token expired", code: "TOKEN_EXPIRED" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Basic CSRF Protection for state-changing requests
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const referer = req.headers.get("referer");
    const origin = req.headers.get("origin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (appUrl) {
      const isAllowed = (referer && referer.startsWith(appUrl)) || (origin && origin === appUrl);
      if (!isAllowed) {
        return NextResponse.json({ error: "CSRF check failed" }, { status: 403 });
      }
    }
  }

  // Inject user context into request headers for downstream handlers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.sub!);
  requestHeaders.set("x-user-role", payload.role as string);
  requestHeaders.set("x-user-email", payload.email as string);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};
