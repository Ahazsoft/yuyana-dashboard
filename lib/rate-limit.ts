/**
 * Simple in-memory sliding window rate limiter.
 * For production, replace with Upstash Redis or similar.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number };

/**
 * @param key Unique key per IP + endpoint e.g. "login:1.2.3.4"
 * @param maxRequests Maximum requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}

/** Clean up expired entries periodically (call in a background interval if needed) */
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}
