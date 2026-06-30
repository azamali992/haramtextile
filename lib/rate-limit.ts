/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Limitation (acceptable for this single-instance deployment, but worth
 * flagging before scaling out): state lives in a process-local `Map`, so it
 * resets on every server restart/deploy and is NOT shared across multiple
 * instances or serverless cold starts. If this app is ever deployed behind
 * a load balancer with multiple Node processes, or onto a serverless
 * platform with concurrent isolated invocations, this needs to be swapped
 * for a shared store (e.g. Redis/Upstash) to actually enforce the limit
 * globally. No such infrastructure is configured in this project today, so
 * this is the right tradeoff for now.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Returns `true` if the action keyed by `key` is allowed under a `limit`
 * requests per `windowMs` fixed window, and records the attempt. Returns
 * `false` once the limit has been reached within the current window.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/**
 * Clears all rate-limit state. Exported solely for test isolation (so one
 * test's requests don't exhaust another test's quota when both share the
 * same key, e.g. requests with no `x-forwarded-for` header all falling back
 * to "unknown") — never call this from application code.
 */
export function _resetRateLimitsForTests(): void {
  buckets.clear();
}
