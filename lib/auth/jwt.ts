import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change-this-secret"
);

export interface AccessTokenPayload extends JWTPayload {
  sub: string; // userId
  role: string;
  email: string;
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string; // userId
  jti: string; // unique token id
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function toHex(buffer: ArrayBuffer): Promise<string> {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Access Token (15 min) ───────────────────────────────────────────────────

export async function signAccessToken(
  userId: string,
  role: string,
  email: string
): Promise<string> {
  return new SignJWT({ sub: userId, role, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

// ─── Refresh Token (7 days) ───────────────────────────────────────────────────

/** Returns the raw refresh token (store this in cookie) and hash (store in DB) */
export async function generateRefreshToken(): Promise<{ raw: string; hash: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(64));
  const raw = await toHex(bytes.buffer);
  const hash = await hashRefreshToken(raw);
  return { raw, hash };
}

export async function hashRefreshToken(raw: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  return toHex(hashBuffer);
}

export function refreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

// ─── Password Reset Token ────────────────────────────────────────────────────

export async function generatePasswordResetToken(): Promise<{
  raw: string;
  hash: string;
  expires: Date;
}> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = await toHex(bytes.buffer);
  const hash = await hashRefreshToken(raw);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { raw, hash, expires };
}
