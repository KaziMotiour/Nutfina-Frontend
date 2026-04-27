const currentScript = document.currentScript;
const PIXEL_ID =
  currentScript && typeof currentScript.getAttribute === "function"
    ? (currentScript.getAttribute("data-pixel-id") || "").trim()
    : "";

function initializeFacebookPixel(f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = "2.0";
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  if (s && s.parentNode) {
    s.parentNode.insertBefore(t, s);
  } else {
    b.head.appendChild(t);
  }
}

initializeFacebookPixel(
  window,
  document,
  "script",
  "https://connect.facebook.net/en_US/fbevents.js",
);

if (PIXEL_ID && typeof window.fbq === "function") {
  window.fbq("init", PIXEL_ID);
}