// "use client";

// import { usePathname } from "next/navigation";
// import Script from "next/script";
// import { useEffect, useState } from "react";
// import * as pixel from "../../lib/fpixel";

// const FacebookPixel = () => {
//   const [loaded, setLoaded] = useState(false);
//   const pathname = usePathname();
//   const pixelId = pixel.FB_PIXEL_ID?.trim() || "";
//   const canTrack = Boolean(pixelId);

//   useEffect(() => {
//     if (!canTrack || !loaded) return;

//     pixel.pageview();
//     console.log("Pixel ID:", pixelId);
//   }, [pathname, loaded, canTrack]);

//   if (!canTrack) {
//     return null;
//   }

//   return (
//     <div>
//       <Script
//         id="fb-pixel"
//         src="/scripts/pixel.js"
//         strategy="afterInteractive"
//         onLoad={() => setLoaded(true)}
//         data-pixel-id={pixelId}
//       />
//     </div>
//   );
// };

// export default FacebookPixel;




'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function FacebookPixelTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  return null
}