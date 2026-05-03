import { apiCall } from "@/utils/api";
import { getFbpFbc } from "@/lib/fpixel";

/**
 * Stable catalog-style id for ViewContent / AddToCart: `{productName}_{weight}gm`.
 * Aligns PDP pixel, Quick View, and backend GET product CAPI (`name_weightgm`).
 */
export function buildViewContentContentId(
  productName: string,
  weightGrams: string | number | null | undefined,
): string {
  const name = (productName ?? "").trim();
  let w =
    weightGrams === null || weightGrams === undefined || weightGrams === ""
      ? ""
      : String(weightGrams).trim();
  const lower = w.toLowerCase();
  if (lower.endsWith("gm")) {
    w = w.slice(0, -2).trim();
  }
  return `${name}_${w}gm`;
}

export type ViewContentCapiPayload = {
  event_id: string;
  content_name: string;
  content_category: string;
  content_ids: string[];
  content_type?: string;
  value: number;
  currency?: string;
  fbp?: string;
  fbc?: string;
  event_source_url?: string;
};

/** POST ViewContent to backend CAPI; same ``event_id`` as ``pixelEvent('ViewContent', …, event_id)``. Non-blocking. */
export function sendViewContentCapi(payload: ViewContentCapiPayload): void {
  const { fbp: cookieFbp, fbc: cookieFbc } = getFbpFbc();
  const value = Number.isFinite(payload.value) ? payload.value : 0;
  const body = {
    content_type: "product",
    currency: "BDT",
    ...payload,
    value,
    fbp: payload.fbp ?? cookieFbp,
    fbc: payload.fbc ?? cookieFbc,
    event_source_url:
      payload.event_source_url ??
      (typeof window !== "undefined" ? window.location.href : ""),
  };

  void apiCall("/shop/track/view-content/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}
