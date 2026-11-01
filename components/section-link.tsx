"use client";

import type { MouseEvent, ReactNode } from "react";

function scrollToSection(sectionId: string) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  target.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
  });
}

export function SectionLink({
  sectionId,
  className,
  children,
  onNavigate,
}: {
  sectionId: string;
  className?: string;
  children: ReactNode;
  onNavigate?: (sectionId: string) => void;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onNavigate?.(sectionId);
    scrollToSection(sectionId);
  }

  return (
    <a href="/" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
