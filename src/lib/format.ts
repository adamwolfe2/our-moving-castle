// Small client-safe formatters. No deps beyond the platform Intl + native Date.

export function fmtMoney(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function todayISO(d = new Date()): string {
  // Local YYYY-MM-DD (avoid UTC off-by-one)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return parseISO(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  return parseISO(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Days from today to an ISO date (negative = overdue). */
export function daysFromToday(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const today = parseISO(todayISO());
  const target = parseISO(iso);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function relativeDay(iso: string | null | undefined): string {
  const d = daysFromToday(iso);
  if (d == null) return "";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  if (d < 0) return `${Math.abs(d)}d overdue`;
  return `in ${d}d`;
}
