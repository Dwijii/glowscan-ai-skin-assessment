// Fixed-window, in-memory rate limiter: N requests per IP per window.
// Good enough for a single serverless instance or a demo. Each Vercel instance
// keeps its own map, so for production use a shared store (e.g. Upstash Redis).

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit = Number(process.env.RATE_LIMIT_PER_HOUR ?? 5),
  windowMs = 60 * 60 * 1000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (bucket.count >= limit) return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
