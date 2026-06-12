# Spec — Our Moving Castle: Move-In CRM

**Date:** 2026-06-11 · **Owner:** Adam + Partner · **Tier:** internal tool (private, 2 users)

## /goal
A genuinely usable, password-protected move-in command center bolted onto the existing
`our-moving-castle` marketing site. Two people log in (shared password `calcifer`), see one
synced source of truth, and work the move to Cadet Ave smoothly. Full CRUD. Daily-updatable.
Exports a brief Adam can paste to Claude each day.

## Hard facts (seeded, real)
- Move-in: **Wed June 17, 2026**. Today baseline: June 11.
- Address: 3336 NE Cadet Ave, Portland OR. Close/possession June 17, 5 PM.
- Money: $15,900 paid (earnest + inspection) · ~$4,900 out-of-pocket ahead · $760,000 at closing.
- True cost of ownership ≈ $2,516/mo (no mortgage, all-cash). Tax ~$13K due Nov 16 (3% discount if paid full). Insurance $3,745/yr binds June 17.
- Key contact: Jenny McGuire (escrow) 503-654-7770 — verify wire by voice.

## Scope (this slice = the whole thing)
1. **Auth** — shared password → signed httpOnly cookie; middleware guards `/app/*` + mutating API. Marketing site stays public.
2. **DB** — Neon Postgres + Drizzle. Tables: `tasks`, `payments`, `contacts`, `shopping`, `daily_log`.
3. **App UI** (`/app`): Dashboard · Calendar · Tasks/Checklists · Cleaning · Shopping · Money · Contacts · Daily Brief.
4. **CRUD** — every entity add/edit/toggle/delete via API routes + optimistic UI.
5. **Seed** — all real Cadet data (critical path, payment checklist, calendar, contacts, cleaning, essentials).
6. **Export** — `/api/export` JSON + `/app/brief` human summary (due / overdue / done) for daily Claude updates.

## Non-goals
Per-user accounts, mobile app, notifications/email, multi-property. Keep it one household, one move.

## Data model
- `tasks`: id, title, category(closing|money|move|utilities|home|repairs|cleaning|admin), owner(you|partner|both|unassigned), status(todo|doing|done), priority(critical|high|normal), due_date, area, cost, link, notes, sort_order, timestamps
- `payments`: id, label, amount, kind(paid|due|upcoming|planned|monthly), due_date, notes
- `contacts`: id, name, role, phone, email, notes
- `shopping`: id, item, area, est_cost, bought, notes
- `daily_log`: id, log_date, mood, wins, blockers, entry

## Done = 
Login works, all 8 pages render real seeded data, every list supports add/edit/toggle/delete and
persists across refresh + devices, `pnpm build` green, deployed to Vercel with DATABASE_URL set.
