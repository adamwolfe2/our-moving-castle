// Client-safe helpers for the Home OS maintenance system.
import { daysFromToday } from "@/lib/format";

export type MaintStatusKey = "overdue" | "due-soon" | "ok" | "unscheduled";

export interface MaintStatus {
  key: MaintStatusKey;
  label: string;
  days: number | null;
  color: string;
}

export function maintStatus(nextDue: string | null): MaintStatus {
  const days = daysFromToday(nextDue);
  if (days == null)
    return { key: "unscheduled", label: "Unscheduled", days: null, color: "#A89685" };
  if (days < 0)
    return { key: "overdue", label: "Overdue", days, color: "#C26B4A" };
  if (days <= 14)
    return { key: "due-soon", label: "Due soon", days, color: "#C8A96E" };
  return { key: "ok", label: "Scheduled", days, color: "#6B7A5A" };
}

export function freqLabel(months: number): string {
  if (months === 1) return "Monthly";
  if (months === 2) return "2 mo";
  if (months === 3) return "Quarterly";
  if (months === 4) return "4 mo";
  if (months === 6) return "6 mo";
  if (months === 12) return "Annual";
  if (months % 12 === 0) return `${months / 12} yr`;
  return `${months} mo`;
}

export const OWNER_DISPLAY: Record<string, string> = {
  adam: "Adam",
  mel: "Mel",
  professional: "Pro",
};
