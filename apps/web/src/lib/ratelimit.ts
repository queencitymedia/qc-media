/** Block 28 — very naive in-memory rate limiter (dev only) */
type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();
const CAPACITY = 15;
const REFILL_MS = 10_000;
function refill(b: Bucket) {
  const now = Date.now();
  const elapsed = now - b.updatedAt;
  const refill = (CAPACITY * elapsed) / REFILL_MS;
  b.tokens = Math.min(CAPACITY, b.tokens + refill);
  b.updatedAt = now;
}
export const limit = {
  headers: { "x-rate-capacity": String(CAPACITY), "x-rate-refill-ms": String(REFILL_MS) },
  check(key: string): boolean {
    let b = buckets.get(key);
    if (!b) { b = { tokens: CAPACITY, updatedAt: Date.now() }; buckets.set(key, b); }
    refill(b);
    if (b.tokens >= 1) { b.tokens -= 1; return true; }
    return false;
  }
};