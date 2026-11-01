"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SectionLink } from "@/components/section-link";

const navLinks = [
  { sectionId: "problem", label: "Problem" },
  { sectionId: "prototype", label: "Prototype" },
  { sectionId: "prd", label: "PRD" },
  { sectionId: "metrics", label: "Metrics" },
] as const;

const NAV_SCROLL_OFFSET_PX = 140;

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
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const scrollLockUntilRef = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.sectionId);
    const lastSectionId = sectionIds[sectionIds.length - 1] ?? "";
    let rafId: number | null = null;

    const pageCannotScrollFurther = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      return scrollTop + clientHeight >= scrollHeight - 1;
    };

    const updateActiveFromScroll = () => {
      rafId = null;
      if (Date.now() < scrollLockUntilRef.current) return;

      const problemSection = document.getElementById("problem");
      if (
        problemSection &&
        problemSection.getBoundingClientRect().top > NAV_SCROLL_OFFSET_PX
      ) {
        setActiveSectionId(null);
        return;
      }

      const lastElement = document.getElementById(lastSectionId);
      if (pageCannotScrollFurther() && lastElement) {
        const lastTop = lastElement.getBoundingClientRect().top;
        if (lastTop >= 0 && lastTop <= window.innerHeight) {
          setActiveSectionId(lastSectionId);
          return;
        }
      }

      let nextActive = sectionIds[0] ?? null;
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= NAV_SCROLL_OFFSET_PX) {
          nextActive = id;
        }
      }
      setActiveSectionId(nextActive);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateActiveFromScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateActiveFromScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const handleNavClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    scrollLockUntilRef.current = Date.now() + 700;
  };

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
          {navLinks.map((link) => {
            const isActive = activeSectionId === link.sectionId;
            return (
              <SectionLink
                key={link.sectionId}
                sectionId={link.sectionId}
                onNavigate={() => handleNavClick(link.sectionId)}
                className={`border-b-2 pb-0.5 text-[16px] transition-colors ${
                  isActive
                    ? "border-lavender font-semibold text-navy"
                    : "border-transparent font-medium text-muted hover:text-navy"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                {link.label}
              </SectionLink>
            );
          })}
        </nav>
        <div className="ml-auto shrink-0">
          <NavPillButton sectionId="prototype">Open prototype</NavPillButton>
        </div>
      </div>
    </header>
  );
}
