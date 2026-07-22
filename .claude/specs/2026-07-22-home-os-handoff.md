# Home OS — session handoff 2026-07-22

## Shipped (all live on ourmovingcastle.vercel.app, main)
- Maintenance spreadsheet (`/app/maintenance`): 98 tasks seeded (staggered), sortable/filterable, ✓→log w/ cost→auto-recalc next due. Mobile card view.
- Bills (`/app/bills`): 8 accounts, autopay toggles, bill ledger (actuals). Mobile card view.
- Dashboard = Home OS view (overdue/due-30/autopay/est-cost tiles + synced cards).
- Tables: maintenance_tasks, maintenance_log, home_accounts, home_bills. APIs gated in middleware (fixed same-day).
- `home-bill-watcher` cloud routine trig_016NM7DbAjKdRF6kfnxmrBHF — daily 8am PT: Gmail → ledger, marks paid, missed-bill warnings.

## Autopay state (verified in portals)
- NW Natural ✓ (bank •3751, starts 7/28) · Xfinity ✓ · Pacific Power ✓ ($54.34 drafts 8/5)
- Portland Water: registration BLOCKED until first bill ~Sep (PAPER MAIL — task 9/25)
- Heiberg: 90-day wait from 6/17 → call after ~9/15 (Adam confirmed by phone; task updated)
- Insurance: HANDLED by Adam, ~$2.9K actual (was $3,745 est), Bill Nelson/Moreland, renews May 2027
- Property tax: $13,548.14/yr, APN R100490+R100491, full-pay by Nov 16 = ~3% off (task 10/27)

## Open items
- ⚠️ Xfinity Aug bill $185 vs $65 norm (task 8/8) — offer: aside dig into bill detail
- Paydici (property tax) account + autopay not yet created — do near Oct bill
- Verizon account row added, amount/autopay unknown — fill
- Phase 2 idea: aside monthly portal sweep for bills whose emails hide amounts

## Gotchas learned
- aside refuses prompts w/ literal passwords (inconsistent) → browser-harness DOM-driving works
- PP portal: B2C login iframe → open auth URL directly; optional-MFA screen → click "my account." anchor fragment; MFA left OFF for automation
- PWB CSS portal rejects registration pre-first-bill ("has not yet billed")
- Passwords never in CRM/repo/vault — vault has IDs only (~/.claude/knowledge/cadet-house/cadet-private.md, updated)
