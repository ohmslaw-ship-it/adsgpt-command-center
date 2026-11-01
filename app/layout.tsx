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

export const metadata: Metadata = {
  title: "AdsGPT Command Center — a concept by Om Raje",
  description:
    "A portfolio command center for agency leads running 20+ ad accounts — an unofficial PM case study for Venxr AdsGPT.",
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
