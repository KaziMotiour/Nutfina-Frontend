import { apiCall } from "@/utils/api";
import { getFbpFbc } from "@/lib/fpixel";

export type PageViewCapiPayload = {
  event_id: string;
  fbp?: string;
  fbc?: string;
  event_source_url?: string;
};

/** POST PageView to backend CAPI; same ``event_id`` as ``fbq('track','PageView',{}, { event_id })``. Non-blocking. */
export function sendPageViewCapi(payload: PageViewCapiPayload): void {
  const { fbp: cookieFbp, fbc: cookieFbc } = getFbpFbc();
  const body = {
    ...payload,
    fbp: payload.fbp ?? cookieFbp,
    fbc: payload.fbc ?? cookieFbc,
    event_source_url:
      payload.event_source_url ??
      (typeof window !== "undefined" ? window.location.href : ""),
  };

  void apiCall("/shop/track/page-view/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}
