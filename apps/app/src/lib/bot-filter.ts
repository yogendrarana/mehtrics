const BOT_PATTERN =
  /bot|crawler|spider|scraper|curl|wget|python|java\/|go-http|libwww|axios|node-fetch|undici|headless|phantom|selenium|puppeteer|playwright|cypress|httpclient|okhttp|insomnia|postman/i;

const HEADLESS_SIGNALS = ["HeadlessChrome", "PhantomJS", "Electron"];

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;

  const ua = userAgent.toLowerCase().trim();
  if (!ua) return true;

  if (BOT_PATTERN.test(ua)) return true;

  if (HEADLESS_SIGNALS.some((sig) => ua.includes(sig.toLowerCase())))
    return true;

  return false;
}

export function shouldIgnoreRequest(
  userAgent: string | null | undefined,
): boolean {
  return isBot(userAgent);
}
