import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AdsGPT Command Center — a concept by Om Raje",
  description:
    "A portfolio command center for agency leads running 20+ ad accounts — an unofficial PM case study for Venxr AdsGPT.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-text font-sans">
        {children}
      </body>
    </html>
  );
}
