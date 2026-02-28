/**
 * Mehtrics Tracking Script
 * ========================
 * Minimal, privacy-first analytics tracker.
 * Target: < 3 KB gzipped.
 *
 * Usage:
 *   <script
 *     src="https://yourhost.com/tracker.js"
 *     data-site-id="YOUR_SITE_UUID"
 *     async
 *   ></script>
 */

(function () {
  "use strict";

  // --------------------------------------------------------
  // Config
  // --------------------------------------------------------
  const script = document.currentScript as HTMLScriptElement | null;
  const siteId = script?.dataset["siteId"];
  const endpoint = script?.dataset["endpoint"] ?? "/api/track";

  if (!siteId) {
    console.warn("[Mehtrics] data-site-id is required.");
    return;
  }

  // --------------------------------------------------------
  // Helpers
  // --------------------------------------------------------
  function getScreenWidth(): number {
    return window.innerWidth || screen.width || 0;
  }

  function getReferrer(): string | null {
    const ref = document.referrer;
    if (!ref) return null;
    try {
      // Only track external referrers
      const refHost = new URL(ref).hostname;
      const curHost = window.location.hostname;
      if (refHost === curHost) return null;
    } catch {
      return null;
    }
    return ref;
  }

  function getUrl(): string {
    return window.location.href;
  }

  // --------------------------------------------------------
  // Track function
  // --------------------------------------------------------
  function track(
    type: "pageview" | "custom",
    extra?: Record<string, unknown>,
  ): void {
    const payload: Record<string, unknown> = {
      siteId,
      type,
      url: getUrl(),
      referrer: getReferrer(),
      screenWidth: getScreenWidth(),
      ...extra,
    };

    // Use sendBeacon for non-blocking, reliable delivery
    const data = JSON.stringify(payload);
    const sent = navigator.sendBeacon
      ? navigator.sendBeacon(
          endpoint,
          new Blob([data], { type: "application/json" }),
        )
      : false;

    // Fallback to fetch for environments without sendBeacon
    if (!sent) {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true,
      }).catch(() => {}); // Silently fail
    }
  }

  // --------------------------------------------------------
  // SPA support — intercept history API
  // --------------------------------------------------------
  let lastUrl = getUrl();

  function onUrlChange(): void {
    const newUrl = getUrl();
    if (newUrl !== lastUrl) {
      lastUrl = newUrl;
      track("pageview");
    }
  }

  const origPushState = history.pushState.bind(history);
  const origReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    origPushState(...args);
    onUrlChange();
  };

  history.replaceState = function (...args) {
    origReplaceState(...args);
    onUrlChange();
  };

  window.addEventListener("popstate", onUrlChange);

  // --------------------------------------------------------
  // Expose mehtrics global for custom events
  // --------------------------------------------------------
  (window as unknown as Record<string, unknown>)["mehtrics"] = {
    track: (eventName: string, props?: Record<string, unknown>) =>
      track("custom", { eventName, ...props }),
  };

  // --------------------------------------------------------
  // Initial pageview
  // --------------------------------------------------------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => track("pageview"));
  } else {
    track("pageview");
  }
})();
