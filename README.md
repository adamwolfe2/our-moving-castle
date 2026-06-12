# Our Moving Castle

Two things in one Next.js app:

1. **Public site** (`/`) — the scroll-driven home mood board (existing).
2. **Move-In CRM** (`/app`) — a private, password-protected command center for the
   move to 3336 NE Cadet Ave. Live calendar, task/checklist system, cleaning lists,
   shopping, money tracker, contacts, and a daily brief. Full CRUD, real data.

## Stack

Next.js 16 · React 19 · Tailwind v4 · Drizzle ORM · Neon Postgres · jose (auth) · lucide-react.

## The CRM (`/app`)

- **Auth** — one shared password (`calcifer`). Signed httpOnly cookie, 30 days.
  Middleware guards `/app/*` and the data APIs. The marketing site stays public.
- **Pages** — Dashboard (countdown + money + progress + critical path), Calendar
  (live, by due date), Tasks (all categories, filterable), Cleaning (old + new place),
  Shopping (essentials), Money (payments + monthly budget + House Holding), Contacts,
  Daily Brief (live snapshot + "Copy for Claude" + progress log).
- **Data** — 5 tables: `tasks`, `payments`, `contacts`, `shopping`, `daily_log`.

## First-time setup (one-time, ~2 min)

1. **Create the database.** Vercel → `ourmovingcastle` → Storage → Create Database →
   **Neon (Postgres)**. This auto-adds `DATABASE_URL` to the project.
   _(Or make a free DB at neon.tech and copy its connection string.)_

2. **Pull env + set the password locally.**
   ```bash
   vercel env pull .env.local
   # add to .env.local:
   #   APP_PASSWORD=calcifer
   #   SESSION_SECRET=<long random string>
   ```
   Also add `APP_PASSWORD` and `SESSION_SECRET` in Vercel → Settings → Environment Variables.

3. **Create tables + load the real Cadet data.**
   ```bash
   pnpm db:push     # create the schema in Neon
   pnpm db:seed     # load tasks, payments, contacts, shopping, etc.
   ```

4. **Run it.**
   ```bash
   pnpm dev         # http://localhost:3000/app  (password: calcifer)
   ```

## Daily use

- Work the **Dashboard** and **Calendar**; check things off — they sync across both phones.
- Each morning, open **Daily Brief**, hit **Copy for Claude**, paste into a chat to
  re-plan the day. Log the day's wins/blockers at the bottom.
- `GET /api/export` returns the full JSON snapshot (auth required).

## Scripts

| Command | What |
|---|---|
| `pnpm dev` | Local dev |
| `pnpm build` | Production build |
| `pnpm db:push` | Push Drizzle schema to Neon |
| `pnpm db:seed` | Seed/reseed real Cadet data (wipes + reloads the 5 tables) |
| `pnpm db:studio` | Drizzle Studio (browse data) |
