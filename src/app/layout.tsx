import "./globals.css";

import Providers from "@/store/Provider";
import { Loader } from "@/components/loader";
import Script from "next/script";
import { Suspense } from "react";
import FacebookPixelTracker from "@/components/pixel-setup/facebook-pixel";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "Nutfina - A healthy lifestyle platform.",
  description: "A healthy lifestyle platform.",

  icons: {
    icon: "/header-logo.png",
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
      <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
        /></noscript>
      </head>
      <body style={{ background: "none" }}>
        <Loader>
          <Providers>
            <div>{children}</div>
          </Providers>
        </Loader> 
        <Suspense fallback={null}>
          <FacebookPixelTracker />
        </Suspense>
      </body>
    </html>
  );
}
