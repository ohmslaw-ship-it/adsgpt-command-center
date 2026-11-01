"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AskAdsGptPanel,
  type AskAdsGptPanelHandle,
} from "@/components/ask-adsgpt-panel";
import { Container } from "@/components/container";
import type { ClientStatus, EnrichedClient } from "@/lib/types";
import {
  EMPTY_SESSION_OVERRIDES,
  getEnrichedClientsWithOverrides,
  getPortfolioSummary,
  type SessionOverrides,
} from "@/lib/clients";
import {
  formatCtr,
  formatFrequency,
  formatInrCompact,
  formatInrTable,
  formatPercent,
} from "@/lib/format";
import { isCreativeFatigued, isOverspend } from "@/lib/rules";

type StatusFilter = "All" | ClientStatus;

const STATUS_PILL_STYLES: Record<
  ClientStatus,
  { wrap: string; dot: string }
> = {
  Overspend: {
    wrap: "bg-[#FFF0F1] text-[#D9465A]",
    dot: "bg-[#D9465A]",
  },
  Watch: {
    wrap: "bg-[#FFF7E0] text-[#A26A00]",
    dot: "bg-[#A26A00]",
  },
  Healthy: {
    wrap: "bg-[#EAF6EA] text-[#2F6B2E]",
    dot: "bg-[#2F6B2E]",
  },
};

function StatusPill({ status }: { status: ClientStatus }) {
  const styles = STATUS_PILL_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${styles.wrap}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
        aria-hidden
      />
      {status}
    </span>
  );
}

function pacingBarColor(status: ClientStatus, overPacing: boolean): string {
  if (status === "Overspend") return "bg-coral";
  if (status === "Watch" || overPacing) return "bg-saffron";
  return "bg-success";
}

function clientInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function clientSubtitle(client: EnrichedClient): string {
  return client.platforms.join(" · ");
}

function getTodayAction(client: EnrichedClient): string {
  const overspend = isOverspend(
    client.todaySpendInr,
    client.maxDailySpend90dInr,
  );

  if (overspend) {
    return `Cap today’s spend at ${formatInrTable(client.overspendThresholdInr)} or pause high-burn campaigns until below the 4× daily max.`;
  }
  if (client.status === "Watch") {
    return `MTD pacing is ${formatPercent(client.pacingPercent, 0)} vs the linear curve — trim daily caps or reallocate before end of week.`;
  }
  if (client.fatiguedCreativeCount > 0) {
    return `Pause ${client.fatiguedCreativeCount} fatigued creative${client.fatiguedCreativeCount === 1 ? "" : "s"} and rotate fresh assets this week.`;
  }
  return "No urgent action — keep monitoring spend and creative performance.";
}

function SummaryCard({
  label,
  value,
  caption,
  delta,
  deltaClassName,
  icon,
  iconTint,
}: {
  label: string;
  value: string;
  caption: string;
  delta: string;
  deltaClassName: string;
  icon: React.ReactNode;
  iconTint: string;
}) {
  return (
    <div className="flex flex-col rounded-[20px] bg-[#F6F7FE] p-6">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[20px] ${iconTint}`}
        >
          {icon}
        </div>
        <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">
          {label}
        </p>
      </div>
      <p className="mt-5 text-[40px] font-bold leading-none tabular-nums text-navy">
        {value}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold tabular-nums ${deltaClassName}`}
        >
          {delta}
        </span>
        <span className="truncate text-[14px] text-muted">{caption}</span>
      </div>
    </div>
  );
}

const PLATFORM_BADGES: Record<
  string,
  { abbr: string; className: string }
> = {
  Google: { abbr: "G", className: "bg-[#E8F0FE] text-[#1A73E8]" },
  Meta: { abbr: "M", className: "bg-[#E7F0FF] text-[#1877F2]" },
  DV360: { abbr: "DV", className: "bg-[#E6F4EA] text-[#188038]" },
  Amazon: { abbr: "A", className: "bg-[#FFF3E0] text-[#E47911]" },
};

function PlatformBadges({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex items-center pl-0.5">
      {platforms.map((platform, index) => {
        const badge = PLATFORM_BADGES[platform] ?? {
          abbr: platform.slice(0, 1),
          className: "bg-[#EEF0F8] text-muted",
        };
        const isWide = badge.abbr.length > 1;

        return (
          <span
            key={platform}
            title={platform}
            className={`relative inline-flex h-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none ring-2 ring-white ${badge.className} ${
              isWide ? "min-w-7 px-1.5" : "w-7"
            } ${index > 0 ? "-ml-2" : ""}`}
            style={{ zIndex: platforms.length - index }}
          >
            {badge.abbr}
          </span>
        );
      })}
    </div>
  );
}

function ClientAvatar({ name, status }: { name: string; status: ClientStatus }) {
  const tint =
    status === "Overspend"
      ? "bg-[#FFF0F1] text-[#D9465A]"
      : status === "Watch"
        ? "bg-[#FFF7E0] text-[#A26A00]"
        : "bg-[#EAF6EA] text-[#2F6B2E]";

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[20px] text-[15px] font-semibold ${tint}`}
      aria-hidden
    >
      {clientInitial(name)}
    </span>
  );
}

function SearchField({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Search clients</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
        aria-hidden
      >
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 16l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search clients…"
        className="h-11 w-full rounded-full border-0 bg-[#F6F7FE] py-0 pl-11 pr-4 text-[15px] text-navy outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-[#B8A9FE]/50"
      />
    </label>
  );
}

function clientAskPrompt(name: string): string {
  return `What should I do about ${name} today?`;
}

function ClientRowDetail({
  client,
  onAskAbout,
}: {
  client: EnrichedClient;
  onAskAbout: (client: EnrichedClient) => void;
}) {
  const overspend = isOverspend(
    client.todaySpendInr,
    client.maxDailySpend90dInr,
  );

  const todayVsCap = formatPercent(
    (client.todaySpendInr / client.overspendThresholdInr) * 100,
    0,
  );

  return (
    <div className="mx-2 mb-2 rounded-2xl bg-[#F8F9FD] p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] bg-[#F6F7FE] p-4">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
              Monthly budget
            </dt>
            <dd className="mt-1.5 text-[18px] font-semibold tabular-nums text-navy">
              {formatInrTable(client.monthlyBudgetInr)}
            </dd>
          </div>
          <div className="rounded-[20px] bg-[#F6F7FE] p-4">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
              Spend to date
            </dt>
            <dd className="mt-1.5 text-[18px] font-semibold tabular-nums text-navy">
              {formatInrTable(client.spendToDateInr)}
            </dd>
          </div>
          <div className="rounded-[20px] bg-[#F6F7FE] p-4">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
              MTD pacing
            </dt>
            <dd
              className={`mt-1.5 text-[18px] font-semibold tabular-nums ${
                client.pacingPercent > 110 ? "text-[#D9465A]" : "text-navy"
              }`}
            >
              {formatPercent(client.pacingPercent, 1)}
            </dd>
          </div>
          <div className="rounded-[20px] bg-[#F6F7FE] p-4">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
              Today&apos;s spend
            </dt>
            <dd className="mt-1.5 text-[18px] font-semibold tabular-nums text-navy">
              {formatInrTable(client.todaySpendInr)}
            </dd>
          </div>
          <div className="rounded-[20px] bg-[#F6F7FE] p-4">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
              Daily cap (4×)
            </dt>
            <dd className="mt-1.5 text-[18px] font-semibold tabular-nums text-navy">
              {formatInrTable(client.overspendThresholdInr)}
            </dd>
          </div>
          <div className="rounded-[20px] bg-[#F6F7FE] p-4">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
              Fatigued ads
            </dt>
            <dd className="mt-1.5 text-[18px] font-semibold tabular-nums text-navy">
              {client.fatiguedCreativeCount}
            </dd>
          </div>
        </dl>

        <div className="rounded-[20px] bg-gradient-to-br from-[#F1F3FF] via-[#F6F7FE] to-[#EEEAFE] p-5 lg:self-start">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-lavender-dark">
            Today&apos;s action
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-navy">
            {getTodayAction(client)}
          </p>
            <p className="mt-3 text-[13px] text-muted">
              Today is{" "}
              <span
                className={`font-semibold tabular-nums ${
                  overspend ? "text-[#D9465A]" : "text-navy"
                }`}
              >
                {todayVsCap}
              </span>{" "}
              of the daily cap
              {overspend ? " (overspend breach)." : "."}
            </p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAskAbout(client);
              }}
              className="hover-chip-border mt-4 rounded-full border border-[#E4E7FB] bg-white px-4 py-2 text-[13px] font-semibold text-navy"
            >
              Ask AdsGPT about {client.name}
            </button>
          </div>

        <div className="min-w-0 pr-2">
          <h4 className="text-[15px] font-semibold text-navy">Creatives</h4>
          <ul className="mt-3">
            {client.creatives.map((creative) => {
              const fatigued = isCreativeFatigued(
                creative,
                client.creatives,
              );

              return (
                <li
                  key={creative.id}
                  className="flex items-start justify-between gap-3 border-b border-[#F0F1F8] py-3.5 last:border-0"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        fatigued ? "bg-[#D9465A]" : "bg-[#2F6B2E]"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-navy">{creative.name}</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {creative.platform} · CTR {formatCtr(creative.ctr30d)} ·
                        CPA {formatInrTable(creative.cpa30dInr)} · Freq.{" "}
                        {formatFrequency(creative.frequency30d)}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold text-muted">
                    {fatigued ? "Fatigued" : "Healthy"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RowChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`ml-auto h-5 w-5 text-lavender-dark motion-safe:transition-all motion-safe:duration-[250ms] motion-safe:ease-out ${
        open
          ? "rotate-90 opacity-100"
          : "rotate-0 opacity-0 group-hover:opacity-100"
      }`}
      aria-hidden
    >
      <path
        d="M10 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PrototypeSection() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [prototypeInView, setPrototypeInView] = useState(false);
  const [sessionOverrides, setSessionOverrides] = useState<SessionOverrides>(
    EMPTY_SESSION_OVERRIDES,
  );
  const askPanelRef = useRef<AskAdsGptPanelHandle>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const displayClients = useMemo(
    () => getEnrichedClientsWithOverrides(sessionOverrides),
    [sessionOverrides],
  );

  const summary = useMemo(
    () => getPortfolioSummary(displayClients),
    [displayClients],
  );

  useEffect(() => {
    setExpandedId(null);
  }, [query, statusFilter]);

  useEffect(() => {
    const section = document.getElementById("prototype");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPrototypeInView(entry.isIntersecting);
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chatOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeChat();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chatOpen]);

  function closeChat() {
    setChatOpen(false);
  }

  function openChat() {
    setChatOpen(true);
  }

  function toggleChat() {
    setChatOpen((open) => !open);
  }

  function openChatWithMessage(text: string, client?: EnrichedClient) {
    openChat();
    window.setTimeout(() => {
      askPanelRef.current?.sendMessage(text, client);
    }, 0);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return displayClients.filter((client) => {
      if (statusFilter !== "All" && client.status !== statusFilter) {
        return false;
      }
      if (q && !client.name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [displayClients, query, statusFilter]);

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  const filters: StatusFilter[] = ["All", "Overspend", "Watch", "Healthy"];

  function handleAskAboutClient(client: EnrichedClient) {
    openChatWithMessage(clientAskPrompt(client.name), client);
  }

  const floatingUi =
    portalReady &&
    createPortal(
      <>
        <button
          type="button"
          onClick={toggleChat}
          aria-label={chatOpen ? "Close Ask AdsGPT" : "Ask AdsGPT"}
          aria-expanded={chatOpen}
          aria-hidden={!prototypeInView}
          className={`hover-btn-primary fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-[#050545] px-5 text-[15px] font-semibold text-white shadow-[0_8px_32px_rgba(184,169,254,0.45)] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            prototypeInView
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 shrink-0"
            aria-hidden
          >
            <path
              d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3zM5 14l.8 2.4L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.6L5 14zM19 14l.8 2.4L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.6L19 14z"
              fill="currentColor"
            />
          </svg>
          Ask AdsGPT
        </button>

        <div
          className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(5,5,69,0.25)] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none inset-0 rounded-none md:inset-auto md:top-4 md:right-4 md:bottom-4 md:w-[440px] md:max-w-[calc(100vw-2rem)] md:rounded-[28px] ${
            chatOpen
              ? "translate-x-0 opacity-100 pointer-events-auto"
              : "translate-x-[110%] opacity-0 pointer-events-none"
          }`}
          aria-hidden={!chatOpen}
          inert={!chatOpen}
        >
          <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full brand-gradient"
                aria-hidden
              />
              <h3 className="text-h3">Ask AdsGPT</h3>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeChat();
              }}
              aria-label="Close Ask AdsGPT"
              className="relative z-20 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F6F7FE] text-muted motion-safe:transition-colors motion-safe:duration-200 hover:text-navy"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden
              >
                <path
                  d="M7 7l10 10M17 7L7 17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <AskAdsGptPanel
            ref={askPanelRef}
            embedded
            clients={displayClients}
            overrides={sessionOverrides}
            onOverridesChange={setSessionOverrides}
          />
        </div>
      </>,
      document.body,
    );

  function filterLabel(filter: StatusFilter): string {
    if (filter === "All") {
      return `All ${displayClients.length}`;
    }
    return `${filter} ${summary.statusCounts[filter]}`;
  }

  return (
    <>
    <Container>
      <header className="mb-14">
        <p className="text-label">Prototype</p>
        <h2 className="mt-3 text-h2">Monday morning brief</h2>
        <p className="mt-3 max-w-2xl text-subline">
          All 20 client accounts, ranked by what needs you first.
        </p>
      </header>

      <div className="min-w-0 rounded-[32px] bg-white p-8 shadow-[0_30px_80px_-30px_rgba(5,5,69,0.18)]">
        <div className="flex items-center gap-2.5">
          <span
            className="live-dot-pulse h-2 w-2 shrink-0 rounded-full bg-[#2F6B2E]"
            aria-hidden
          />
          <p className="text-[14px] text-muted">Monday, 3 Nov</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total spend this month"
            value={formatInrCompact(summary.totalSpendToDateInr)}
            caption="MTD across portfolio"
            delta="+4 since yesterday"
            deltaClassName="bg-[#EEEAFE] text-lavender-dark"
            iconTint="bg-[#EEEAFE] text-navy"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M4 18h16M6 14l3-4 3 2 4-6 2 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <SummaryCard
            label="Accounts on track"
            value={String(summary.accountsOnTrack)}
            caption="Healthy & on pace"
            delta="+2 since yesterday"
            deltaClassName="bg-[#EAF6EA] text-[#2F6B2E]"
            iconTint="bg-[#EAF6EA] text-[#2F6B2E]"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M6 12l4 4 8-8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <SummaryCard
            label="Overspend alerts"
            value={String(summary.overspendAlerts)}
            caption="Above 4× daily max"
            delta="+1 since yesterday"
            deltaClassName="bg-[#FFF0F1] text-[#D9465A]"
            iconTint="bg-[#FFF0F1] text-[#D9465A]"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M12 8v5M12 16h.01"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M10.5 3.5h3L20 19H4L10.5 3.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <SummaryCard
            label="Fatigued creatives"
            value={String(summary.fatiguedCreatives)}
            caption="Freq. + CTR drop"
            delta="+3 since yesterday"
            deltaClassName="bg-[#FFF7E0] text-[#A26A00]"
            iconTint="bg-[#FFF7E0] text-[#A26A00]"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M4 16V8a2 2 0 012-2h12a2 2 0 012 2v8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 20h8M10 14h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="inline-flex max-w-full flex-wrap rounded-full bg-[#F1F3FF] p-1"
            role="group"
            aria-label="Filter by status"
          >
            {filters.map((filter) => {
              const active = statusFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out ${
                    active
                      ? "bg-white text-navy shadow-[0_4px_14px_-4px_rgba(5,5,69,0.18)]"
                      : "text-muted hover:text-navy"
                  }`}
                >
                  {filterLabel(filter)}
                </button>
              );
            })}
          </div>
          <SearchField
            value={query}
            onChange={setQuery}
            className="w-full lg:max-w-xs lg:shrink-0"
          />
        </div>
        <p className="mt-2 text-[14px] text-muted">
          Showing {filtered.length} client{filtered.length === 1 ? "" : "s"}
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1024px] border-collapse text-left text-[16px] lg:min-w-0">
            <thead>
              <tr className="border-b border-[#F0F1F8] text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">
                <th className="w-[min(28%,320px)] px-5 pb-4 align-bottom font-semibold">
                  Client
                </th>
                <th className="px-5 pb-4 align-bottom font-semibold">Platforms</th>
                <th className="px-5 pb-4 text-right align-bottom font-semibold">
                  Spend vs budget
                </th>
                <th className="px-5 pb-4 align-bottom font-semibold">Pacing</th>
                <th className="px-5 pb-4 text-right align-bottom font-semibold tabular-nums">
                  Today&apos;s spend
                </th>
                <th className="px-5 pb-4 align-bottom font-semibold">Status</th>
                <th className="px-5 pb-4 text-right align-bottom font-semibold tabular-nums">
                  Fatigued ads
                </th>
                <th className="w-10 px-5 pb-4 align-bottom" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const isOpen = expandedId === client.id;
                const barOverPacing = client.pacingPercent > 100;
                const barWidth = Math.min(client.pacingPercent, 100);
                const barColor = pacingBarColor(client.status, barOverPacing);

                return (
                  <Fragment key={client.id}>
                    <tr
                      className={`group hover-table-row border-b border-[#F0F1F8] ${
                        isOpen ? "border-[#F0F1F8]" : ""
                      }`}
                      onClick={() => toggleExpanded(client.id)}
                      aria-expanded={isOpen}
                    >
                      <td className="h-[72px] px-5 py-0 align-middle">
                        <div className="flex items-center gap-3">
                          <ClientAvatar
                            name={client.name}
                            status={client.status}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-navy">
                              {client.name}
                            </p>
                            <p className="truncate text-[13px] text-muted">
                              {clientSubtitle(client)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="h-[72px] px-5 py-0 align-middle">
                        <PlatformBadges platforms={client.platforms} />
                      </td>
                      <td className="h-[72px] px-5 py-0 text-right align-middle">
                        <p className="tabular-nums text-navy">
                          {formatInrTable(client.spendToDateInr)}
                          <span className="text-[14px] text-muted">
                            {" "}
                            of {formatInrTable(client.monthlyBudgetInr)}
                          </span>
                        </p>
                      </td>
                      <td className="h-[72px] px-5 py-0 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-1.5 w-[120px] shrink-0 overflow-hidden rounded-full bg-[#EEF0F8]"
                            aria-hidden
                          >
                            <div
                              className={`h-full rounded-full ${barColor}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="shrink-0 text-[13px] tabular-nums text-muted">
                            {formatPercent(client.pacingPercent, 0)}
                          </span>
                        </div>
                      </td>
                      <td className="h-[72px] px-5 py-0 text-right align-middle tabular-nums text-navy">
                        {formatInrTable(client.todaySpendInr)}
                      </td>
                      <td className="h-[72px] px-5 py-0 align-middle">
                        <StatusPill status={client.status} />
                      </td>
                      <td className="h-[72px] px-5 py-0 text-right align-middle tabular-nums text-navy">
                        {client.fatiguedCreativeCount}
                      </td>
                      <td className="h-[72px] px-5 py-0 align-middle">
                        <RowChevron open={isOpen} />
                      </td>
                    </tr>
                    <tr className="border-b border-[#F0F1F8]">
                      <td colSpan={8} className="p-0">
                        <div
                          className="client-row-detail-shell min-h-0"
                          data-state={isOpen ? "open" : "closed"}
                        >
                          <div className="min-h-0 overflow-hidden">
                            {isOpen ? (
                              <ClientRowDetail
                                client={client}
                                onAskAbout={handleAskAboutClient}
                              />
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-[15px] text-muted">
              No clients match this search or filter.
            </p>
          ) : null}
        </div>
      </div>
    </Container>
    {floatingUi}
    </>
  );
}
