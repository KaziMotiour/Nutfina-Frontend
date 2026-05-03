/**
 * Detect “real” home load/reload vs SPA navigation to `/home`.
 * Uses PerformanceNavigationTiming so it stays correct when route chunks load late.
 */

function normalizePathname(pathname: string): string {
  const x = (pathname || "").replace(/\/+$/, "");
  return x === "" ? "/" : x;
}

export function isHomePath(pathname: string): boolean {
  const n = normalizePathname(pathname);
  return n === "/" || n === "/home";
}

/** Pathname from the document load URL (stable across client-side route changes). */
export function getDocumentLoadPathname(): string {
  if (typeof window === "undefined") return "";
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav?.name) {
    try {
      return new URL(nav.name).pathname;
    } catch {
      /* ignore */
    }
  }
  return window.location.pathname;
}

/**
 * True when this browser document was opened or reloaded on home (`/` or `/home`).
 * Use with `{ force: true }` on home-only fetches; SPA from other routes → false (cache).
 */
export function shouldForceRefreshOnHomeDocumentLoad(): boolean {
  if (typeof window === "undefined") return false;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const type = nav?.type;
  const initialPath = getDocumentLoadPathname();

  if (type === "reload") {
    return isHomePath(initialPath);
  }
  if (type === "navigate" || type === "prerender") {
    return isHomePath(initialPath);
  }
  return false;
}
