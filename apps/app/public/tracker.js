(function () {
  let z = document.currentScript,
    E = z?.dataset.siteId,
    F = z ? new URL("/api/track", z.src).toString() : "/api/track";
  if (!E) {
    console.warn("[Mehtrics] data-site-id is required.");
    return;
  }
  function A() {
    return window.location.href;
  }
  function K() {
    return window.innerWidth || screen.width || 0;
  }
  function L() {
    return window.innerHeight || screen.height || 0;
  }
  function M() {
    let b = document.referrer;
    if (!b) return null;
    try {
      let j = new URL(b).hostname,
        D = window.location.hostname;
      if (j === D) return null;
    } catch {
      return null;
    }
    return b;
  }
  function O() {
    try {
      let j = window.sessionStorage.getItem("mehtrics_sid");
      if (!j)
        (j =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15)),
          window.sessionStorage.setItem("mehtrics_sid", j);
      return j;
    } catch {
      return "anon";
    }
  }
  function q(b, j) {
    let D = {
        siteId: E,
        type: b,
        url: A(),
        referrer: M(),
        screenWidth: K(),
        screenHeight: L(),
        sessionId: O(),
        ...j,
      },
      J = JSON.stringify(D);
    if (
      !(navigator.sendBeacon
        ? navigator.sendBeacon(F, new Blob([J], { type: "application/json" }))
        : !1)
    )
      fetch(F, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: J,
        keepalive: !0,
      }).catch(() => {});
  }
  let G = A();
  function B() {
    let b = A();
    if (b !== G) (G = b), q("pageview");
  }
  let Q = history.pushState.bind(history),
    T = history.replaceState.bind(history);
  if (
    ((history.pushState = function (...b) {
      Q(...b), B();
    }),
    (history.replaceState = function (...b) {
      T(...b), B();
    }),
    window.addEventListener("popstate", B),
    (window.mehtrics = {
      track: (b, j) => q("custom", { eventName: b, ...j }),
    }),
    document.readyState === "loading")
  )
    document.addEventListener("DOMContentLoaded", () => q("pageview"));
  else q("pageview");
})();
