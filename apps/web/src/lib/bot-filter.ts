// ============================================================
// Bot detection
// Filters bots before pushing to queue to avoid polluting data.
// ============================================================

// Compiled regex from common bot/crawler UA patterns
const BOT_PATTERN =
  /bot|crawler|spider|scraper|curl|wget|python|java\/|go-http|libwww|axios|node-fetch|undici|headless|phantom|selenium|puppeteer|playwright|cypress/i;

// Known headless browser signals
const HEADLESS_SIGNALS = ["HeadlessChrome", "PhantomJS", "Electron"];

/**
 * Returns true if the User-Agent string looks like a bot.
 */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length === 0) return true;

  // Check against known bot patterns
  if (BOT_PATTERN.test(userAgent)) return true;

  // Check for headless browser strings
  if (HEADLESS_SIGNALS.some((sig) => userAgent.includes(sig))) return true;

  return false;
}

/**
 * Returns true if the request should be ignored.
 * Combines bot check with other signals (e.g. DNT-only mode).
 */
export function shouldIgnoreRequest(
  userAgent: string | null | undefined,
): boolean {
  return isBot(userAgent);
}
