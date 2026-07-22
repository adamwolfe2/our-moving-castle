# Handoff: CRM redesign → structured professional SaaS look

**For a fresh session. Read this + `2026-07-22-home-os-handoff.md` first. Do NOT re-derive state.**

## Ask (Adam, 2026-07-22)
The private CRM (`/app/*`) looks "too playful and childlike" (Howl's cream/serif/terracotta). Rebuild the visual system to match a structured CRM like Attio/Linear (reference: Meetalo screenshot — white surfaces, neutral grays, compact sans type, dense data tables, chip badges, stat strip, quiet sidebar). **Public marketing site (`/`) keeps the Howl's aesthetic — do not touch it.**

## Where the design lives (small blast radius by design)
- `src/app/globals.css` — Tailwind v4 `@theme` tokens: cream/linen/walnut/moss/terracotta/gold/dust palette + font vars. **Remap here first — 80% of the transformation.** CAUTION: the public site shares globals — scope new tokens or override at the `/app` layout level (`src/app/app/layout.tsx` wrapper class) so `/` is unaffected.
- `src/components/app/ui.tsx` — shared kit: Card, Badge, Button, Input, Select, Checkbox, SectionTitle, ProgressBar, EmptyState. All `/app` pages compose these.
- `src/components/app/Nav.tsx` — Sidebar + MobileTopBar (keep both; mobile top bar pattern was hard-won — see git log 2ac014f).
- Pages: `src/app/app/{page,maintenance,bills,money,tasks,calendar,cleaning,shopping,marketplace,budget,contacts,files,brief}/page.tsx`. Classes like `font-serif text-walnut bg-linen` are sprinkled through them — sweep after the kit is right.

## Direction (from the Meetalo reference)
- Surfaces: white cards on `#FAFAFA` canvas, 1px `#E5E5E3`-ish borders, shadow-sm max, radius 8–10px
- Type: single sans (Geist or Inter), headings = semibold sans (NO serif in /app), mono only for numbers/dates/micro-labels
- Color: gray-900 text, muted gray secondary; status only in chips — green=good/paid, amber=due-soon/pending, red=overdue/lost, blue=info. No terracotta/gold washes.
- Tables: dense rows (py-2), uppercase 10px tracking-wide gray column headers, hover row tint, right-aligned numerics (Maintenance/Bills tables already close — match others to them)
- Dashboard: stat strip like reference (label + big number + small delta), then table-first content. Kill the flame/countdown hero (moved in; it's stale).
- Sidebar: white, compact rows, muted lucide icons, active = gray-100 pill; keep Home OS nav order (Dashboard, Maintenance, Bills, Tasks…)

## Constraints
- Mobile card views on Maintenance/Bills MUST survive (Adam drives this from his phone; 44px targets, no hover-only actions)
- No new deps unless a font import; no schema/API changes — this is visual only
- `pnpm build` green + tsc clean before ship; `/cap`-style flow: commit → ff-merge `feat/move-in-crm`→`main` → push (prod deploys from main, author must be adamwolfe102@gmail.com)
- Gotcha: pnpm 11 needs approved builds (see repo memory); a hook re-appends junk to pnpm-workspace.yaml — don't commit that

## Definition of done
1. `/app` reads as a serious data tool at first glance (Adam's bar: "actual structured CRM")
2. `/` public site pixel-identical to before
3. Mobile pass on phone width verified (screenshot proof via `/qa` or browser-harness)
4. Ship + deploy Ready + update `moving-castle.md` memory
