"use client";

import { useMemo, useState } from "react";
import type { ClientStatus, EnrichedClient } from "@/lib/types";
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
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
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
          ? "rounded-full bg-coral/12 px-2 py-0.5 text-xs font-medium text-coral"
          : "rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success"
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
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-navy">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
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
            <p className="text-xs font-medium uppercase tracking-wide text-lavender">
              Client detail
            </p>
            <h3
              id="drawer-title"
              className="mt-1 text-xl font-semibold text-navy"
            >
              {client.name}
            </h3>
            <div className="mt-2">
              <StatusPill status={client.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1 text-sm font-medium text-muted transition-colors hover:text-navy"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Monthly budget</dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-navy">
                {formatInrTable(client.monthlyBudgetInr)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Spend to date</dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-navy">
                {formatInrTable(client.spendToDateInr)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">MTD pacing</dt>
              <dd
                className={`mt-1 text-sm font-semibold tabular-nums ${
                  client.pacingPercent > 110 ? "text-coral" : "text-navy"
                }`}
              >
                {formatPercent(client.pacingPercent, 1)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Today&apos;s spend</dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-navy">
                {formatInrTable(client.todaySpendInr)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-card border border-line bg-bg-alt p-4">
            <p className="text-xs font-medium text-muted">
              Today vs 4× max daily (90d)
            </p>
            <p className="mt-2 text-sm text-text">
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

          <h4 className="mt-8 text-sm font-semibold text-navy">Creatives</h4>
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
                      <p className="text-sm font-medium text-navy">
                        {creative.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {creative.platform}
                      </p>
                    </div>
                    <CreativeTag fatigued={fatigued} />
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
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

export function PrototypeSection({
  clients,
  summary,
}: {
  clients: EnrichedClient[];
  summary: {
    totalSpendToDateInr: number;
    accountsOnTrack: number;
    overspendAlerts: number;
    fatiguedCreatives: number;
  };
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [selected, setSelected] = useState<EnrichedClient | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((client) => {
      if (statusFilter !== "All" && client.status !== statusFilter) {
        return false;
      }
      if (q && !client.name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [clients, query, statusFilter]);

  const filters: StatusFilter[] = ["All", "Overspend", "Watch", "Healthy"];

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lavender">
        Prototype
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy">
        Monday morning brief
      </h2>
      <p className="mt-3 max-w-2xl text-muted">
        All 20 client accounts, ranked by what needs you first.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total spend this month"
          value={formatInrCompact(summary.totalSpendToDateInr)}
          hint="Month-to-date across portfolio"
        />
        <SummaryCard
          label="Accounts on track"
          value={String(summary.accountsOnTrack)}
          hint="Healthy pacing & creatives"
        />
        <SummaryCard
          label="Overspend alerts"
          value={String(summary.overspendAlerts)}
          hint="Today above 4× 90d daily max"
        />
        <SummaryCard
          label="Fatigued creatives"
          value={String(summary.fatiguedCreatives)}
          hint="High frequency + CTR drop"
        />
      </div>

      <div className="mt-10 rounded-panel border border-line bg-white p-6 shadow-card lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-sm">
            <span className="sr-only">Search clients</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="w-full rounded-full border border-line bg-bg-alt py-2.5 pl-4 pr-4 text-sm text-navy outline-none transition-colors placeholder:text-muted focus:border-lavender"
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
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-navy text-white"
                      : "border border-line bg-white text-muted hover:text-navy"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <p className="mb-3 text-xs text-muted">
            Showing {filtered.length} client{filtered.length === 1 ? "" : "s"}
          </p>
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium uppercase tracking-wide text-muted">
                <th className="pb-3 pr-4 align-middle font-medium">Client</th>
                <th className="pb-3 pr-4 align-middle font-medium">Platforms</th>
                <th className="pb-3 pr-4 align-middle font-medium">
                  Spend vs budget
                </th>
                <th className="pb-3 pr-4 align-middle font-medium">
                  Today&apos;s spend
                </th>
                <th className="pb-3 pr-4 align-middle font-medium">Status</th>
                <th className="pb-3 align-middle font-medium">Fatigued ads</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const barOverPacing = client.pacingPercent > 100;
                const barWidth = Math.min(client.pacingPercent, 100);

                return (
                  <tr
                    key={client.id}
                    className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-bg-alt/80"
                    onClick={() => setSelected(client)}
                  >
                    <td className="py-4 pr-4 align-middle font-medium text-navy">
                      {client.name}
                    </td>
                    <td className="py-4 pr-5 align-middle">
                      <div className="flex flex-wrap gap-2">
                        {client.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="rounded-full bg-bg-alt px-2.5 py-1 text-[11px] font-medium text-muted"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <p className="tabular-nums text-navy">
                        {formatInrTable(client.spendToDateInr)}
                        <span className="text-muted">
                          {" "}
                          / {formatInrTable(client.monthlyBudgetInr)}
                        </span>
                      </p>
                      <div
                        className="mt-2 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-[#EDEDED]"
                        aria-hidden
                      >
                        <div
                          className={`h-full rounded-full ${
                            barOverPacing ? "bg-coral" : "bg-lavender"
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs tabular-nums text-muted">
                        {formatPercent(client.pacingPercent, 0)} pacing
                      </p>
                    </td>
                    <td className="py-4 pr-4 align-middle tabular-nums text-navy">
                      {formatInrTable(client.todaySpendInr)}
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <StatusPill status={client.status} />
                    </td>
                    <td className="py-4 align-middle tabular-nums text-navy">
                      {client.fatiguedCreativeCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No clients match this search or filter.
            </p>
          ) : null}
        </div>
      </div>

      {selected ? (
        <ClientDrawer client={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}
