// Static facts about the move. Real numbers from the Cadet breakdown + Notion.
// Money math derives from payments table at runtime; these are the anchors.

export const MOVE = {
  address: "3336 NE Cadet Ave",
  city: "Portland, OR",
  moveInDate: "2026-06-17", // Wednesday — close + possession + keys, 5 PM
  closeTime: "5:00 PM",
  listPrice: 775000, // contract price before the inspection reduction
  addendumPrice: 748730, // $775,000 − $26,270 inspection credit (SkySlope addendum, Jun 11)
  inspectionCredit: 26270, // price reduction to offset inspection findings
  balanceAtClosing: 760000,
  paidToDate: 16375, // earnest $15,000 + APEX inspection $900 + siding $350 + oil-tank $125
  outOfPocketAhead: 4900,
  trueMonthlyCost: 2516,
  houseHoldingMonthly: 1400, // auto-transfer for tax + insurance accruals
  insuranceAnnual: 3745, // binds June 17 (Bill Nelson, Moreland)
  taxAnnualEst: 13000, // due Nov 16, 2026 — pay in full for ~3% discount
} as const;

export const CATEGORY_META: Record<
  string,
  { label: string; color: string; swatch: string }
> = {
  closing: { label: "Closing", color: "var(--color-terracotta)", swatch: "#C26B4A" },
  money: { label: "Payments", color: "var(--color-gold)", swatch: "#C8A96E" },
  move: { label: "Move", color: "var(--color-moss)", swatch: "#6B7A5A" },
  utilities: { label: "Utilities", color: "#5B8AA6", swatch: "#5B8AA6" },
  home: { label: "Home / Admin", color: "var(--color-dust)", swatch: "#A89685" },
  repairs: { label: "Repairs", color: "#9A6A4F", swatch: "#9A6A4F" },
  cleaning: { label: "Cleaning", color: "#7E9B8A", swatch: "#7E9B8A" },
  admin: { label: "Admin", color: "#8A8577", swatch: "#8A8577" },
};

export const OWNER_LABEL: Record<string, string> = {
  you: "Adam",
  partner: "Melodi",
  both: "Both",
  unassigned: "Unassigned",
};

export function daysUntilMoveIn(today = new Date()) {
  const target = new Date(MOVE.moveInDate + "T17:00:00");
  const ms = target.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
