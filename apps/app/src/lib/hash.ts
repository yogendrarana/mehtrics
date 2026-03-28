export async function hashVisitor({
  ip,
  ua,
  siteId,
}: {
  ip: string;
  ua: string;
  siteId: string;
}): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const raw = `${ip}|${ua}|${siteId}|${today}`;

  const encoded = new TextEncoder().encode(raw);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}

export async function hashSession({
  ip,
  ua,
  siteId,
}: {
  ip: string;
  ua: string;
  siteId: string;
}): Promise<string> {
  const now = new Date();
  const hourStart = new Date(now);
  hourStart.setUTCMinutes(0, 0, 0);
  const sessionTS = hourStart.toISOString();

  const raw = `${ip}|${ua}|${siteId}|${sessionTS}`;

  const encoded = new TextEncoder().encode(raw);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}
