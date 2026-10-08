import "~/styles/globals.css";

import { type Metadata } from "next";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react"
import Footer from "~/components/Footer";

export const metadata: Metadata = {
  title: "Sui Community Passport",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={``}>
      <body>
        <div
          role="status"
          className="sticky top-0 z-50 w-full bg-amber-400 px-4 py-2.5 text-center font-inter text-sm font-medium leading-snug text-amber-950"
        >
          Thank you for participating. Minting and claims are closed. Remaining site functions turn off October 13, 2026, 12:00am PDT. The contract upgrade is October 16, 2026. Passports and stamps in your wallet stay yours.
        </div>
        <Providers>
          {children}
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
