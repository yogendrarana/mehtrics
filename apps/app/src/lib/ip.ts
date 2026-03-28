export function getClientIP(request: Request): string {
  // 1. Standard proxy header
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded
      .split(",")
      .map((ip) => ip.trim())
      .find(Boolean);
    if (first) return first;
  }

  // 2. Cloudflare specific header
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;

  // 3. Nginx / general reverse proxy standard
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();

  return "0.0.0.0";
}
