"use client";

import { useMemo, useState } from "react";
import { AskAdsGptPanel } from "@/components/ask-adsgpt-panel";
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

function StatusPill({ status }: { status: ClientStatus }) {
  const styles: Record<ClientStatus, string> = {
    Overspend: "bg-coral/15 text-coral",
    Watch: "bg-saffron/20 text-[#8a6500]",
    Healthy: "bg-success/12 text-success",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[14px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function CreativeTag({ fatigued }: { fatigued: boolean }) {
  return (
    <span
      className={
        fatigued
          ? "rounded-full bg-coral/12 px-2 py-0.5 text-label font-medium text-coral"
          : "rounded-full bg-success/12 px-2 py-0.5 text-label font-medium text-success"
      }
    >
      {fatigued ? "Fatigued" : "Healthy"}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  icon,
  trend,
  iconTint = "bg-[#EEEAFE] text-lavender-dark",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  trend?: string;
  iconTint?: string;
}) {
  return (
    <div className="hover-card-primary flex min-h-[150px] flex-col rounded-card bg-white p-8 shadow-panel-depth">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTint}`}
      >
        {icon}
      </div>
      <p className="mt-4 text-label-muted">{label}</p>
      <p className="mt-2 text-stat">{value}</p>
      {trend ? (
        /* Illustrative trend — sample data, not live */
        <p className="mt-1 text-[13px] font-normal normal-case tracking-normal text-fg-muted">
          {trend}
        </p>
      ) : null}
      {hint ? (
        <p className="mt-1 text-label-muted normal-case tracking-normal">
          {hint}
        </p>
      ) : null}
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

function PlatformBadge({ platform }: { platform: string }) {
  const badge = PLATFORM_BADGES[platform] ?? {
    abbr: platform.slice(0, 1),
    className: "bg-bg-alt text-muted",
  };
  const isWide = badge.abbr.length > 1;

  return (
    <span
      title={platform}
      className={`inline-flex h-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none ${badge.className} ${
        isWide ? "min-w-[22px] px-1.5" : "w-[22px]"
      }`}
    >
      {badge.abbr}
    </span>
  );
}

function ClientDrawer({
  client,
  onClose,
}: {
  client: EnrichedClient;
  onClose: () => void;
}) {
  const overspend = isOverspend(
    client.todaySpendInr,
    client.maxDailySpend90dInr,
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close client details"
        className="fixed inset-0 z-40 bg-navy/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-white shadow-card"
        aria-labelledby="drawer-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="text-label">Client detail</p>
            <h3 id="drawer-title" className="mt-1 text-h3">
              {client.name}
            </h3>
            <div className="mt-2">
              <StatusPill status={client.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1.5 text-nav font-medium text-fg-muted transition-colors hover:text-navy"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-label-muted normal-case tracking-normal">Monthly budget</dt>
              <dd className="mt-1 font-semibold tabular-nums text-navy">
                {formatInrTable(client.monthlyBudgetInr)}
              </dd>
            </div>
            <div>
              <dt className="text-label-muted normal-case tracking-normal">Spend to date</dt>
              <dd className="mt-1 font-semibold tabular-nums text-navy">
                {formatInrTable(client.spendToDateInr)}
              </dd>
            </div>
            <div>
              <dt className="text-label-muted normal-case tracking-normal">MTD pacing</dt>
              <dd
                className={`mt-1 font-semibold tabular-nums ${
                  client.pacingPercent > 110 ? "text-coral" : "text-navy"
                }`}
              >
                {formatPercent(client.pacingPercent, 1)}
              </dd>
            </div>
            <div>
              <dt className="text-label-muted normal-case tracking-normal">Today&apos;s spend</dt>
              <dd className="mt-1 font-semibold tabular-nums text-navy">
                {formatInrTable(client.todaySpendInr)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-card border border-line bg-bg-alt p-4">
            <p className="text-label-muted normal-case tracking-normal">
              Today vs 4× max daily (90d)
            </p>
            <p className="mt-2 text-body">
              Threshold{" "}
              <span className="font-semibold tabular-nums text-navy">
                {formatInrTable(client.overspendThresholdInr)}
              </span>{" "}
              — today is{" "}
              <span
                className={`font-semibold tabular-nums ${
                  overspend ? "text-coral" : "text-navy"
                }`}
              >
                {formatPercent(
                  (client.todaySpendInr / client.overspendThresholdInr) * 100,
                  0,
                )}
              </span>{" "}
              of that cap
              {overspend ? " (overspend breach)" : ""}.
            </p>
          </div>

          <h4 className="mt-8 text-h3">Creatives</h4>
          <ul className="mt-3 space-y-3">
            {client.creatives.map((creative) => {
              const fatigued = isCreativeFatigued(
                creative,
                client.creatives,
              );
              return (
                <li
                  key={creative.id}
                  className="rounded-card border border-line bg-white p-4 shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-navy">
                        {creative.name}
                      </p>
                      <p className="mt-0.5 text-label text-muted">
                        {creative.platform}
                      </p>
                    </div>
                    <CreativeTag fatigued={fatigued} />
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-label">
                    <div>
                      <dt className="text-muted">CTR (30d)</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-navy">
                        {formatCtr(creative.ctr30d)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">CPA</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-navy">
                        {formatInrTable(creative.cpa30dInr)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Freq.</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-navy">
                        {formatFrequency(creative.frequency30d)}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}

export function PrototypeSection() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sessionOverrides, setSessionOverrides] = useState<SessionOverrides>(
    EMPTY_SESSION_OVERRIDES,
  );

  const displayClients = useMemo(
    () => getEnrichedClientsWithOverrides(sessionOverrides),
    [sessionOverrides],
  );

  const summary = useMemo(
    () => getPortfolioSummary(displayClients),
    [displayClients],
  );

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return displayClients.find((c) => c.id === selectedId) ?? null;
  }, [displayClients, selectedId]);

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

  const filters: StatusFilter[] = ["All", "Overspend", "Watch", "Healthy"];

  return (
    <Container>
      <header className="mb-14">
        <p className="text-label">Prototype</p>
        <h2 className="mt-3 text-h2">Monday morning brief</h2>
        <p className="mt-3 max-w-2xl text-subline">
          All 20 client accounts, ranked by what needs you first.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total spend this month"
          value={formatInrCompact(summary.totalSpendToDateInr)}
          hint="Month-to-date across portfolio"
          trend="+4 vs last week"
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
          hint="Healthy pacing & creatives"
          trend="+2 vs last week"
          iconTint="bg-success/12 text-success"
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
          hint="Today above 4× 90d daily max"
          trend="+1 vs last week"
          iconTint="bg-[#FFF4F5] text-coral"
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
          hint="High frequency + CTR drop"
          trend="+3 vs last week"
          iconTint="bg-[#FFF8E6] text-[#8a6500]"
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

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 rounded-panel bg-white p-8 shadow-panel-depth">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-sm">
            <span className="sr-only">Search clients</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="w-full rounded-full border border-line bg-bg-alt py-2.5 pl-4 pr-4 text-body text-navy outline-none transition-colors placeholder:text-fg-muted focus:border-lavender"
            />
          </label>
          <div
            className="flex flex-wrap gap-2"
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
                  className={`rounded-full px-3.5 py-1.5 transition-colors ${
                    active
                      ? "bg-navy text-label text-white"
                      : "border border-line bg-white text-label-muted normal-case tracking-normal hover:text-navy"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 max-lg:overflow-x-auto">
          <p className="mb-3 text-label-muted normal-case tracking-normal">
            Showing {filtered.length} client{filtered.length === 1 ? "" : "s"}
          </p>
          <table className="w-full min-w-[880px] border-collapse text-left text-table lg:min-w-0">
            <thead>
              <tr className="bg-[#F8F9FD] text-label-muted">
                <th className="py-5 pr-4 align-middle font-medium first:rounded-tl-xl">
                  Client
                </th>
                <th className="py-5 pr-4 align-middle font-medium">Platforms</th>
                <th className="py-5 pr-4 align-middle text-right font-medium tabular-nums">
                  Spend vs budget
                </th>
                <th className="py-5 pr-4 align-middle text-right font-medium tabular-nums">
                  Today&apos;s spend
                </th>
                <th className="py-5 pr-4 align-middle font-medium">Status</th>
                <th className="py-5 align-middle text-right font-medium tabular-nums last:rounded-tr-xl">
                  Fatigued ads
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const barOverPacing = client.pacingPercent > 100;
                const barWidth = Math.min(client.pacingPercent, 100);

                return (
                  <tr
                    key={client.id}
                    className="hover-table-row border-b border-line last:border-0"
                    onClick={() => setSelectedId(client.id)}
                  >
                    <td className="py-5 pr-4 align-middle font-medium text-navy">
                      {client.name}
                    </td>
                    <td className="py-5 pr-5 align-middle">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {client.platforms.map((platform) => (
                          <PlatformBadge key={platform} platform={platform} />
                        ))}
                      </div>
                    </td>
                    <td className="py-5 pr-4 align-middle text-right">
                      <p className="tabular-nums text-navy">
                        {formatInrTable(client.spendToDateInr)}
                        <span className="text-fg-muted">
                          {" "}
                          / {formatInrTable(client.monthlyBudgetInr)}
                        </span>
                      </p>
                      <div
                        className="mt-2 ml-auto h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-[#EDEDED]"
                        aria-hidden
                      >
                        <div
                          className={`h-full rounded-full ${
                            barOverPacing ? "bg-coral" : "bg-lavender"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <p className="mt-1 text-label-muted normal-case tracking-normal tabular-nums">
                        {formatPercent(client.pacingPercent, 0)} pacing
                      </p>
                    </td>
                    <td className="py-5 pr-4 align-middle text-right tabular-nums text-navy">
                      {formatInrTable(client.todaySpendInr)}
                    </td>
                    <td className="py-5 pr-4 align-middle">
                      <StatusPill status={client.status} />
                    </td>
                    <td className="py-5 align-middle text-right tabular-nums text-navy">
                      {client.fatiguedCreativeCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-muted">
              No clients match this search or filter.
            </p>
          ) : null}
        </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-[88px] lg:self-start">
          <AskAdsGptPanel
            clients={displayClients}
            overrides={sessionOverrides}
            onOverridesChange={setSessionOverrides}
          />
        </div>
      </div>

      {selected ? (
        <ClientDrawer client={selected} onClose={() => setSelectedId(null)} />
      ) : null}
    </Container>
  );
}
