import "./globals.css";

import Providers from "@/store/Provider";
import { Loader } from "@/components/loader";
import FacebookPixel from "@/components/pixel-setup/facebook-pixel";

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
      <body style={{ background: "none" }}>
        <Loader>
          <Providers>
            <div>{children}</div>
          </Providers>
        </Loader>
        <FacebookPixel />
      </body>
    </html>
  );
}
