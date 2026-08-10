// Rate-limit đơn giản theo IP, lưu trong bộ nhớ tiến trình (đủ dùng cho 1 server instance).
// Nếu chạy nhiều instance / cần chính xác tuyệt đối, nên thay bằng Redis (Upstash) sau này.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Dọn rác định kỳ để tránh Map phình to vô hạn
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Giới hạn số request trong 1 khoảng thời gian cho 1 IP + 1 "scope" (tên endpoint).
 * Trả về { ok: false } nếu vượt hạn mức.
 */
export function rateLimit(
  req: Request,
  scope: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { ok: true } | { ok: false; retryAfterSec: number } {
  const ip = getClientIp(req);
  const key = `${scope}:${ip}`;
  const now = Date.now();

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}
