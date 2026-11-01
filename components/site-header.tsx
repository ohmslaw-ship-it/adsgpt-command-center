"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionLink } from "@/components/section-link";

const navLinks = [
  { sectionId: "problem", label: "Problem" },
  { sectionId: "prototype", label: "Prototype" },
  { sectionId: "prd", label: "PRD" },
  { sectionId: "metrics", label: "Metrics" },
] as const;

function NavPillButton({
  sectionId,
  children,
}: {
  sectionId: string;
  children: React.ReactNode;
}) {
  return (
    <SectionLink
      sectionId={sectionId}
      className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-[16px] font-semibold text-white transition-colors hover:bg-navy"
    >
      {children}
    </SectionLink>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-[#EEF0F6] bg-white transition-[background-color,backdrop-filter] duration-200 ${
        scrolled ? "bg-white/90 backdrop-blur-md" : "bg-white"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center gap-6 px-10">
        <Link
          href="/"
          className="shrink-0 text-[20px] font-bold text-navy"
        >
          AdsGPT Command Center
        </Link>
        <nav
          className="hidden flex-1 justify-center gap-9 md:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <SectionLink
              key={link.sectionId}
              sectionId={link.sectionId}
              className="text-[16px] font-medium text-muted transition-colors hover:text-navy"
            >
              {link.label}
            </SectionLink>
          ))}
        </nav>
        <div className="ml-auto shrink-0">
          <NavPillButton sectionId="prototype">Open prototype</NavPillButton>
        </div>
      </div>
    </header>
  );
}
