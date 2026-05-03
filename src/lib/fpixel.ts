export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID?.trim() || "";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Browser PageView with ``event_id`` (pair with ``sendPageViewCapi`` for Meta deduplication). */
export const firePageViewPixel = (eventId: string) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function" && eventId) {
    window.fbq("track", "PageView", {}, { event_id: eventId });
  }
};

export function newPixelEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const pixelEvent = (name: string, options: Record<string, unknown> = {}, eventId: string) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", name, options, {event_id: eventId});
  }
};

/** Read Meta browser cookies for Conversions API matching. */
export function getFbpFbc(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};
  const read = (name: string): string | undefined => {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]!) : undefined;
  };
  return { fbp: read("_fbp"), fbc: read("_fbc") };
}