"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/container";
import { FadeIn } from "@/components/fade-in";
import {
  prdEdgeCases,
  prdGoals,
  prdMeta,
  prdOutOfScope,
  prdProblem,
  prdRequirements,
  prdToc,
  prdUserStories,
  prdUsers,
} from "@/content/prd";

const prdPanelShadow =
  "shadow-[0_1px_2px_rgba(16,24,64,.04),0_8px_24px_rgba(16,24,64,.06)]";

const priorityStyles: Record<
  (typeof prdRequirements)[number]["priority"],
  string
> = {
  P0: "bg-[#FFF4F5] text-[#D64550]",
  P1: "bg-[#FFF8E6] text-[#B8860B]",
  P2: "bg-[#EEEAFE] text-lavender-dark",
};

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="text-lavender-dark"
    >
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PrdCheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-muted">
          <span className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEEAFE]">
            <CheckIcon />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function formatAcceptance(text: string) {
  const parts = text.split(/(Given|When|Then)/gi);
  return parts.map((part, index) => {
    if (/^(Given|When|Then)$/i.test(part)) {
      return (
        <span key={index} className="font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
}

function PrdCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FadeIn>
      <article
        id={id}
        className={`scroll-mt-28 rounded-3xl bg-white p-8 ${prdPanelShadow} lg:p-10`}
      >
        <h3 className="text-h3">{title}</h3>
        <div className="mt-4 space-y-4">{children}</div>
      </article>
    </FadeIn>
  );
}

function PersonaCard({
  title,
  persona,
}: {
  title: string;
  persona: {
    role: string;
    goal: string;
    pain: string;
    quote: string;
  };
}) {
  return (
    <div className="rounded-2xl bg-hero-wash p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-h3">{title}</p>
        <span className="rounded-full bg-[#EEEAFE] px-2.5 py-0.5 text-[12px] font-semibold text-lavender-dark normal-case tracking-normal">
          Illustrative
        </span>
      </div>
      <dl className="mt-3 space-y-2">
        <div>
          <dt className="text-fg-muted">Role</dt>
          <dd className="mt-0.5 text-body">{persona.role}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">Goal</dt>
          <dd className="mt-0.5 text-body">{persona.goal}</dd>
        </div>
        <div>
          <dt className="text-fg-muted">Pain</dt>
          <dd className="mt-0.5 text-body">{persona.pain}</dd>
        </div>
      </dl>
      <blockquote className="mt-3 border-l-2 border-lavender pl-3 text-muted italic">
        &ldquo;{persona.quote}&rdquo;
      </blockquote>
    </div>
  );
}

const TOC_SCROLL_OFFSET_PX = 140;
const TOC_CLICK_LOCK_MS = 700;

export function PrdSection() {
  const lastTocId = prdToc[prdToc.length - 1]?.id ?? "";
  const [activeId, setActiveId] = useState(prdToc[0]?.id ?? "");
  const scrollLockUntilRef = useRef(0);

  useEffect(() => {
    const sectionIds = prdToc.map((item) => item.id);
    let rafId: number | null = null;

    const pageCannotScrollFurther = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      return scrollTop + clientHeight >= scrollHeight - 1;
    };

    const updateActiveFromScroll = () => {
      rafId = null;
      if (Date.now() < scrollLockUntilRef.current) return;

      const lastElement = document.getElementById(lastTocId);
      if (pageCannotScrollFurther() && lastElement) {
        const lastTop = lastElement.getBoundingClientRect().top;
        if (lastTop >= 0 && lastTop <= window.innerHeight) {
          setActiveId(lastTocId);
          return;
        }
      }

      let nextActive = sectionIds[0] ?? "";
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= TOC_SCROLL_OFFSET_PX) {
          nextActive = id;
        }
      }
      setActiveId(nextActive);
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
  }, [lastTocId]);

  const handleTocClick = (id: string) => {
    setActiveId(id);
    scrollLockUntilRef.current = Date.now() + TOC_CLICK_LOCK_MS;
  };

  return (
    <Container>
      <FadeIn>
        <header className="mb-14 max-w-[820px]">
          <p className="text-label">{prdMeta.label}</p>
          <h2 className="mt-3 text-h2">{prdMeta.title}</h2>
          <p className="mt-3 text-subline">{prdMeta.subtitle}</p>
        </header>
      </FadeIn>

      <div className="mx-auto grid w-full max-w-[1108px] grid-cols-1 gap-12 lg:grid-cols-[260px_minmax(0,820px)] lg:gap-16">
        <nav
          className="hidden w-[260px] shrink-0 lg:block"
          aria-label="PRD table of contents"
        >
          <ul
            className={`sticky top-24 w-[260px] space-y-0.5 rounded-2xl bg-white p-2 ${prdPanelShadow}`}
          >
            {prdToc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => handleTocClick(item.id)}
                    className={`block rounded-xl px-3 py-2.5 text-[16px] font-medium leading-snug transition-colors ${
                      isActive
                        ? "bg-[#EEEAFE] text-navy"
                        : "text-fg-muted"
                    }`}
                    aria-current={isActive ? "location" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 max-w-[820px] space-y-6">
          <PrdCard id="prd-problem" title={prdProblem.title}>
            <p className="text-body">{prdProblem.body}</p>
          </PrdCard>

          <PrdCard id="prd-users" title="Users">
            <div className="space-y-4">
              <PersonaCard
                title={prdUsers.primary.title}
                persona={prdUsers.primary.persona}
              />
              <PersonaCard
                title={prdUsers.secondary.title}
                persona={prdUsers.secondary.persona}
              />
            </div>
          </PrdCard>

          <PrdCard id="prd-goals" title="Goals">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-hero-wash p-5 sm:p-6">
                <p className="font-medium text-navy">Goals</p>
                <div className="mt-3">
                  <PrdCheckList items={prdGoals.goals} />
                </div>
              </div>
              <div className="rounded-2xl bg-[#FFF4F5] p-5 sm:p-6">
                <p className="font-medium text-navy">Non-goals</p>
                <div className="mt-3">
                  <PrdCheckList items={prdGoals.nonGoals} />
                </div>
              </div>
            </div>
          </PrdCard>

          <PrdCard id="prd-user-stories" title="User stories">
            <ul className="space-y-4">
              {prdUserStories.map((item) => (
                <li
                  key={item.story}
                  className="rounded-2xl bg-[#F8F9FD] p-5 sm:p-6"
                >
                  <p className="text-[17px] font-medium leading-snug text-navy">
                    {item.story}
                  </p>
                  <hr className="my-4 border-0 border-t border-line/80" />
                  <ul className="space-y-3">
                    {item.acceptance.map((criterion) => (
                      <li
                        key={criterion}
                        className="flex items-start gap-3 text-muted"
                      >
                        <span className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEEAFE]">
                          <CheckIcon />
                        </span>
                        <span>{formatAcceptance(criterion)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </PrdCard>

          <PrdCard id="prd-requirements" title="Requirements">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-table">
                <thead>
                  <tr className="bg-bg-alt text-label-muted">
                    <th className="py-5 pr-4 font-semibold">Feature</th>
                    <th className="py-5 pr-4 font-semibold">Priority</th>
                    <th className="py-5 font-semibold">Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {prdRequirements.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-line/70 align-top last:border-0"
                    >
                      <td className="py-5 pr-4 font-medium text-navy">
                        {row.feature}
                      </td>
                      <td className="py-5 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${priorityStyles[row.priority]}`}
                        >
                          {row.priority}
                        </span>
                      </td>
                      <td className="py-5 text-body">{row.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PrdCard>

          <PrdCard id="prd-edge-cases" title="Edge cases">
            <ul className="space-y-3">
              {prdEdgeCases.map((item) => (
                <li
                  key={item.scenario}
                  className="rounded-2xl bg-bg-alt p-5"
                >
                  <p className="font-medium text-navy">{item.scenario}</p>
                  <p className="mt-1.5 text-muted">{item.behaviour}</p>
                </li>
              ))}
            </ul>
          </PrdCard>

          <PrdCard id="prd-out-of-scope" title="Out of scope">
            <PrdCheckList items={prdOutOfScope} />
          </PrdCard>
        </div>
      </div>
    </Container>
  );
}
