/** Compact INR for summary tiles (lakhs / crores). */
export function formatInrCompact(amountInr: number): string {
  const abs = Math.abs(amountInr);
  const sign = amountInr < 0 ? "−" : "";

  if (abs >= 10_000_000) {
    const cr = abs / 10_000_000;
    const digits = cr >= 100 ? 0 : cr >= 10 ? 1 : 2;
    return `${sign}₹${cr.toFixed(digits)} Cr`;
  }

  if (abs >= 100_000) {
    const lakhs = abs / 100_000;
    const digits = lakhs >= 100 ? 0 : lakhs >= 10 ? 1 : 2;
    return `${sign}₹${lakhs.toFixed(digits)} L`;
  }

  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

/** Table figures — full rupees with Indian grouping. */
export function formatInrTable(amountInr: number): string {
  return `₹${Math.round(amountInr).toLocaleString("en-IN")}`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatCtr(ctr30d: number): string {
  return `${ctr30d.toFixed(2)}%`;
}

export function formatFrequency(frequency30d: number): string {
  return frequency30d.toFixed(1);
}
