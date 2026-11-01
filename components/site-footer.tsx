"use client";

import Link from "next/link";
import { Container } from "@/components/container";
import { FadeIn } from "@/components/fade-in";
import { SectionLink } from "@/components/section-link";

const sectionQuickLinks = [
  { sectionId: "problem", label: "Problem" },
  { sectionId: "prototype", label: "Prototype" },
  { sectionId: "prd", label: "PRD" },
  { sectionId: "metrics", label: "Metrics" },
] as const;

const rolePostingUrl =
  "https://jobs.pyjamahr.com/venanalytics-pvt-ltd/product-management-associate";

export function SiteFooter() {
  return (
    <footer className="section-full-bleed relative -mt-8 overflow-hidden rounded-t-[32px] bg-[#050545] pt-24 pb-10 text-white">
      <FadeIn>
        <Container>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="max-w-xl">
              <p className="text-[24px] font-bold leading-snug">
                AdsGPT Command Center
              </p>
              <p className="mt-3 text-[17px] leading-relaxed text-white/70">
                A concept by Om Raje for Venxr&apos;s Product Management
                Associate role.
              </p>
            </div>
            <div className="lg:text-right">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#B8A9FE]">
                GET IN TOUCH
              </p>
              <div className="mt-4 flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="mailto:notomraje@gmail.com"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[16px] font-semibold text-[#050545] transition-opacity hover:opacity-90"
                >
                  Email me
                </Link>
                <Link
                  href="https://www.linkedin.com/in/om-raje-a06103286"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-6 text-[16px] font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/5"
                >
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>

          <nav
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3"
            aria-label="Footer quick links"
          >
            {sectionQuickLinks.map((link) => (
              <SectionLink
                key={link.sectionId}
                sectionId={link.sectionId}
                className="text-[15px] text-white/60 transition-colors hover:text-white"
              >
                {link.label}
              </SectionLink>
            ))}
            <Link
              href={rolePostingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] text-white/60 transition-colors hover:text-white"
            >
              Role posting
            </Link>
          </nav>
        </Container>

        <div className="relative mt-6 overflow-hidden" aria-hidden>
          <Container className="pointer-events-none select-none">
            <p className="w-full translate-y-[6%] bg-gradient-to-b from-white/15 to-transparent bg-clip-text text-[clamp(120px,18vw,260px)] font-extrabold leading-[0.82] tracking-[-0.04em] text-transparent">
              AdsGPT
            </p>
          </Container>
        </div>

        <Container className="relative z-10 mt-8">
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col gap-3 text-[14px] text-white/50 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p>© 2026 Om Raje</p>
              <p className="max-w-xl sm:text-right">
                Unofficial concept. Not affiliated with Venxr. All figures are
                illustrative.
              </p>
            </div>
          </div>
        </Container>
      </FadeIn>
    </footer>
  );
}
