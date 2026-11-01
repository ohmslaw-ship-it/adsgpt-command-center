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

function userInitial(label: string) {
  const word = label.replace(/^Primary\s+—\s+/i, "").replace(/^Secondary\s+—\s+/i, "").trim();
  return word.charAt(0).toUpperCase() || "?";
}

function userRoleLabel(title: string) {
  return title.replace(/^Primary\s+—\s+/i, "").replace(/^Secondary\s+—\s+/i, "").trim();
}

function PrdUserRows({
  users,
}: {
  users: { title: string; persona: { role: string } }[];
}) {
  return (
    <ul className="list-none space-y-4">
      {users.map((user) => (
        <li key={user.title} className="flex gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF0FD] text-[15px] font-semibold text-lavender-dark"
            aria-hidden
          >
            {userInitial(user.title)}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-semibold text-navy">{userRoleLabel(user.title)}</p>
            <p className="mt-1 text-muted">{user.persona.role}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PrdDotList({
  items,
  dotClassName,
}: {
  items: string[];
  dotClassName: string;
}) {
  return (
    <ul className="list-none space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-muted">
          <span
            className={`mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full ${dotClassName}`}
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PrdMutedDashList({ items }: { items: string[] }) {
  return <PrdDotList items={items} dotClassName="bg-[#B8BAD6]" />;
}

function splitUserStory(story: string) {
  const match = story.match(/^(As an? [^,]+), (.*)$/);
  if (!match) {
    return { lead: story, rest: "" };
  }
  return { lead: `${match[1]},`, rest: match[2] };
}

function formatAcceptance(text: string) {
  const parts = text.split(/(Given|when|then)/);
  return parts.map((part, index) => {
    if (part === "Given" || part === "when" || part === "then") {
      return (
        <span
          key={index}
          className="text-[13px] font-semibold text-[#6B5BD6]"
        >
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
            <PrdUserRows users={[prdUsers.primary, prdUsers.secondary]} />
          </PrdCard>

          <PrdCard id="prd-goals" title="Goals">
            <div className="grid gap-4 sm:grid-cols-2 sm:items-stretch">
              <div className="flex h-full flex-col rounded-2xl bg-hero-wash p-5 sm:p-6">
                <p className="font-medium text-navy">Goals</p>
                <div className="mt-3">
                  <PrdDotList
                    items={prdGoals.goals}
                    dotClassName="bg-[#6B5BD6]"
                  />
                </div>
              </div>
              <div className="flex h-full flex-col rounded-2xl bg-[#F7F7FA] p-5 sm:p-6">
                <p className="font-medium text-navy">Non-goals</p>
                <div className="mt-3">
                  <PrdMutedDashList items={prdGoals.nonGoals} />
                </div>
              </div>
            </div>
          </PrdCard>

          <PrdCard id="prd-user-stories" title="User stories">
            <div className="space-y-4">
              {prdUserStories.map((item) => {
                const { lead, rest } = splitUserStory(item.story);
                return (
                  <article
                    key={item.story}
                    className="rounded-2xl bg-[#F7F7FE] p-4"
                  >
                    <p className="text-[17px] leading-snug text-body">
                      <span className="font-semibold text-navy">{lead}</span>
                      {rest ? ` ${rest}` : null}
                    </p>
                    <ul className="mt-4 list-none space-y-4 border-t border-line/80 pt-4">
                      {item.acceptance.map((criterion) => (
                        <li key={criterion} className="text-[15px] leading-snug text-muted">
                          {formatAcceptance(criterion)}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
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
            <PrdMutedDashList items={prdOutOfScope} />
          </PrdCard>
        </div>
      </div>
    </Container>
  );
}
