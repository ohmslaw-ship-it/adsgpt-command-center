import type { Client, ClientStatus, Creative } from "@/lib/types";
import { DAYS_IN_MONTH, PACING_DAY_OF_MONTH } from "@/lib/constants";

/** Peak single-day spend in the trailing 90 days — compare today against 4× this cap. */
export function overspendThresholdInr(maxDailySpend90dInr: number): number {
  return 4 * maxDailySpend90dInr;
}

/** Overspend when today’s spend is more than 4× the max daily spend over the last 90 days. */
export function isOverspend(
  todaySpendInr: number,
  maxDailySpend90dInr: number,
): boolean {
  return todaySpendInr > overspendThresholdInr(maxDailySpend90dInr);
}

/**
 * Month-to-date pacing vs linear budget curve.
 * 100% = on track; above 110% triggers Watch (unless already Overspend).
 */
export function monthToDatePacingPercent(
  spendToDateInr: number,
  monthlyBudgetInr: number,
  dayOfMonth: number = PACING_DAY_OF_MONTH,
  daysInMonth: number = DAYS_IN_MONTH,
): number {
  if (monthlyBudgetInr <= 0 || dayOfMonth <= 0) return 0;
  const expectedShare = dayOfMonth / daysInMonth;
  const actualShare = spendToDateInr / monthlyBudgetInr;
  return (actualShare / expectedShare) * 100;
}

/**
 * Creative fatigue proxy (demo data has no prior-period CTR):
 * frequency above 4 AND ctr30d at least 15% below the median CTR of the
 * client’s other creatives (stand-in for “CTR dropped vs recent baseline”).
 */
export function isCreativeFatigued(
  creative: Creative,
  siblingCreatives: Creative[],
): boolean {
  if (creative.frequency30d <= 4) return false;

  const others = siblingCreatives.filter((c) => c.id !== creative.id);
  if (others.length === 0) return false;

  const sorted = others.map((c) => c.ctr30d).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianCtr =
    sorted.length % 2 === 1
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

  const CTR_DROP_VS_SIBLING_MEDIAN = 0.85;
  return creative.ctr30d < medianCtr * CTR_DROP_VS_SIBLING_MEDIAN;
}

export function clientHasFatiguedCreative(client: Client): boolean {
  return client.creatives.some((c) =>
    isCreativeFatigued(c, client.creatives),
  );
}

export function countFatiguedCreatives(clients: Client[]): number {
  return clients.reduce(
    (sum, client) =>
      sum +
      client.creatives.filter((c) =>
        isCreativeFatigued(c, client.creatives),
      ).length,
    0,
  );
}

export function countClientsByStatus(
  enriched: { status: ClientStatus }[],
): Record<ClientStatus, number> {
  return enriched.reduce(
    (acc, client) => {
      acc[client.status] += 1;
      return acc;
    },
    { Overspend: 0, Watch: 0, Healthy: 0 } satisfies Record<
      ClientStatus,
      number
    >,
  );
}

/** Overspend first; else Watch on pacing > 110% or any fatigued creative; else Healthy. */
export function resolveClientStatus(client: Client): ClientStatus {
  if (isOverspend(client.todaySpendInr, client.maxDailySpend90dInr)) {
    return "Overspend";
  }

  const pacing = monthToDatePacingPercent(
    client.spendToDateInr,
    client.monthlyBudgetInr,
  );

  if (pacing > 110 || clientHasFatiguedCreative(client)) {
    return "Watch";
  }

  return "Healthy";
}

const STATUS_SORT: Record<ClientStatus, number> = {
  Overspend: 0,
  Watch: 1,
  Healthy: 2,
};

export function compareClientsByStatus(
  a: { status: ClientStatus; name: string },
  b: { status: ClientStatus; name: string },
): number {
  const byStatus = STATUS_SORT[a.status] - STATUS_SORT[b.status];
  if (byStatus !== 0) return byStatus;
  return a.name.localeCompare(b.name);
}
