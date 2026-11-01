import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const siteTitle = "AdsGPT Command Center · Concept by Om Raje";
const siteDescription =
  "A portfolio command center concept for agency leads: prototype, PRD and success metrics. Unofficial concept, not affiliated with Venxr.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} h-full overflow-x-clip`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-[#EEF0FD] font-sans text-body antialiased">
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
