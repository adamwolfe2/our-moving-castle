"use client";
import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Receipt, Wrench } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import {
  TASK_CATEGORIES,
  type HomeAccount,
  type HomeBill,
  type MaintenanceTask,
  type Payment,
  type Task,
} from "@/lib/constants";
import { CATEGORY_META } from "@/lib/move-data";
import { MOVE } from "@/lib/move-data";
import { fmtMoney, fmtDateShort, relativeDay, daysFromToday } from "@/lib/format";
import { freqLabel, maintStatus, OWNER_DISPLAY } from "@/lib/maintenance";
import {
  Badge,
  type BadgeTone,
  Card,
  Checkbox,
  EmptyState,
  ProgressBar,
  SectionTitle,
  Stat,
  cx,
} from "@/components/app/ui";

const MAINT_TONE: Record<string, BadgeTone> = {
  overdue: "red",
  "due-soon": "amber",
  ok: "green",
  unscheduled: "gray",
};

export default function Dashboard() {
  const tasksApi = useCollection<Task>("/api/tasks");
  const { items: payments } = useCollection<Payment>("/api/payments");
  const { items: maint } = useCollection<MaintenanceTask>("/api/maintenance");
  const { items: accounts } = useCollection<HomeAccount>("/api/home-accounts");
  const { items: bills } = useCollection<HomeBill>("/api/home-bills");
  const tasks = tasksApi.items;

  const home = useMemo(() => {
    const active = maint.filter((t) => t.active);
    const overdue = active.filter((t) => maintStatus(t.nextDue).key === "overdue");
    const due30 = active.filter((t) => {
      const d = daysFromToday(t.nextDue);
      return d != null && d >= 0 && d <= 30;
    });
    const next = [...active]
      .filter((t) => t.nextDue)
      .sort((a, b) => (a.nextDue ?? "").localeCompare(b.nextDue ?? ""))
      .slice(0, 7);
    const estMonthly = accounts.reduce((s, a) => s + (a.estMonthly ?? 0), 0);
    const autopayOn = accounts.filter((a) => a.autopay).length;
    const pendingBills = bills
      .filter((b) => b.status === "pending")
      .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
      .slice(0, 4);
    return { overdue, due30, next, estMonthly, autopayOn, pendingBills };
  }, [maint, accounts, bills]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const byCat = TASK_CATEGORIES.map((c) => {
      const list = tasks.filter((t) => t.category === c);
      return {
        cat: c,
        total: list.length,
        done: list.filter((t) => t.status === "done").length,
      };
    }).filter((g) => g.total > 0);
    return { total, done, byCat, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const thisWeek = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "done")
        .filter((t) => {
          const d = daysFromToday(t.dueDate);
          return t.priority === "critical" || (d != null && d <= 7);
        })
        .sort((a, b) => {
          const ap = a.priority === "critical" ? 0 : 1;
          const bp = b.priority === "critical" ? 0 : 1;
          if (ap !== bp) return ap - bp;
          return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
        })
        .slice(0, 8),
    [tasks],
  );

  const upcomingPayments = useMemo(
    () =>
      payments
        .filter((p) => p.kind !== "monthly" && p.kind !== "paid")
        .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
        .slice(0, 4),
    [payments],
  );

  const fullAutopay = accounts.length > 0 && home.autopayOn === accounts.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-[-0.01em] text-ink md:text-xl">
          {MOVE.address}
        </h1>
        <p className="mt-0.5 text-[13px] text-ink-3">{MOVE.city} · Home OS</p>
      </div>

      {/* Stat strip */}
      <Card>
        <div className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-4 md:divide-y-0">
          <Stat
            label="Overdue"
            value={home.overdue.length}
            sub={home.overdue.length ? "needs attention" : "all clear"}
            tone={home.overdue.length ? "bad" : "ok"}
          />
          <Stat
            label="Due in 30d"
            value={home.due30.length}
            sub="maintenance"
            tone={home.due30.length > 0 ? "warn" : "ok"}
          />
          <Stat
            label="Autopay coverage"
            value={`${home.autopayOn}/${accounts.length || 0}`}
            sub={fullAutopay ? "fully automated" : "manual gaps"}
            tone={fullAutopay ? "ok" : "warn"}
          />
          <Stat
            label="Est. monthly cost"
            value={fmtMoney(home.estMonthly)}
            sub={`${fmtMoney(MOVE.trueMonthlyCost)}/mo true cost`}
            tone="info"
          />
        </div>
      </Card>

      {/* Home OS: maintenance + bills */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <SectionTitle
            kicker="Synced from the maintenance sheet"
            right={
              <Link
                href="/app/maintenance"
                className="flex min-h-11 items-center gap-1 text-xs text-ink-2 hover:text-ink hover:underline"
              >
                Full sheet <ArrowRight size={13} />
              </Link>
            }
          >
            Up next · maintenance
          </SectionTitle>
          {home.next.length === 0 ? (
            <EmptyState>
              <Wrench size={15} className="mx-auto mb-1" />
              Nothing scheduled. Seed the sheet or add a task.
            </EmptyState>
          ) : (
            <div>
              {home.next.map((t) => {
                const st = maintStatus(t.nextDue);
                return (
                  <Link
                    key={t.id}
                    href="/app/maintenance"
                    className="flex min-h-11 items-center gap-3 border-t border-line px-2 py-2 transition-colors first:border-t-0 hover:bg-canvas"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] text-ink">{t.task}</div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-ink-3">
                        <span>{t.category}</span>
                        <span>·</span>
                        <span>{freqLabel(t.intervalMonths)}</span>
                        <span>·</span>
                        <span>{OWNER_DISPLAY[t.owner]}</span>
                      </div>
                    </div>
                    <Badge tone={MAINT_TONE[st.key]} className="shrink-0">
                      {t.nextDue ? relativeDay(t.nextDue) : "—"}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionTitle
            kicker="Utilities · insurance · tax"
            right={
              <Link
                href="/app/bills"
                className="flex min-h-11 items-center gap-1 text-xs text-ink-2 hover:text-ink hover:underline"
              >
                Bills <ArrowRight size={13} />
              </Link>
            }
          >
            Money out
          </SectionTitle>
          <div>
            {accounts.slice(0, 7).map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 border-t border-line py-2 first:border-t-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] text-ink">{a.provider}</div>
                  <div className="font-mono text-[10px] text-ink-3">
                    {a.billingCycle}
                    {a.dueDay ? ` · ${a.dueDay}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={a.autopay ? "green" : "amber"}>
                    {a.autopay ? "auto" : "manual"}
                  </Badge>
                  <span className="text-right font-mono text-[13px] tabular-nums text-ink">
                    {a.estMonthly != null ? fmtMoney(a.estMonthly) : "—"}
                  </span>
                </div>
              </div>
            ))}
            {home.pendingBills.length > 0 && (
              <div className="mt-3 border-t border-line pt-3">
                <div className="mb-1.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
                  <Receipt size={11} /> Pending bills
                </div>
                {home.pendingBills.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between py-1 text-[13px]"
                  >
                    <span className="text-ink-2">{b.period}</span>
                    <span className="text-right font-mono tabular-nums text-ink">
                      {fmtMoney(b.amount)}
                      {b.dueDate ? (
                        <span className="ml-1.5 text-[10px] text-ink-3">
                          {fmtDateShort(b.dueDate)}
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Progress */}
      <Card className="p-6">
        <SectionTitle
          kicker="Overall"
          right={
            <span className="text-xl font-semibold tabular-nums tracking-[-0.01em] text-ink">
              {stats.pct}%
            </span>
          }
        >
          Move progress
        </SectionTitle>
        <ProgressBar value={stats.pct} />
        <div className="mt-2 text-xs text-ink-3">
          {stats.done} of {stats.total} tasks complete
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {stats.byCat.map((g) => (
            <div key={g.cat}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_META[g.cat].swatch }}
                  />
                  {CATEGORY_META[g.cat].label}
                </span>
                <span className="font-mono text-ink-3">
                  {g.done}/{g.total}
                </span>
              </div>
              <ProgressBar value={g.total ? (g.done / g.total) * 100 : 0} />
            </div>
          ))}
        </div>
      </Card>

      {/* This week + payments */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <SectionTitle
            kicker="Has queues — don't wait"
            right={
              <Link
                href="/app/tasks"
                className="flex min-h-11 items-center gap-1 text-xs text-ink-2 hover:text-ink hover:underline"
              >
                All tasks <ArrowRight size={13} />
              </Link>
            }
          >
            This week · critical path
          </SectionTitle>
          {thisWeek.length === 0 ? (
            <EmptyState>Nothing critical outstanding. Breathe.</EmptyState>
          ) : (
            <div>
              {thisWeek.map((t) => {
                const overdue = (daysFromToday(t.dueDate) ?? 1) < 0;
                return (
                  <div
                    key={t.id}
                    className="flex min-h-11 items-start gap-3 border-t border-line px-2 py-2 transition-colors first:border-t-0 hover:bg-canvas"
                  >
                    <div className="pt-0.5">
                      <Checkbox
                        checked={false}
                        onChange={() => tasksApi.update(t.id, { status: "done" })}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-ink">{t.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge color={CATEGORY_META[t.category].swatch}>
                          {CATEGORY_META[t.category].label}
                        </Badge>
                        {t.priority === "critical" && (
                          <Badge tone="red">
                            <AlertTriangle size={11} /> Critical
                          </Badge>
                        )}
                        {t.dueDate && (
                          <span
                            className={cx(
                              "font-mono text-[10px]",
                              overdue ? "font-semibold text-bad" : "text-ink-3",
                            )}
                          >
                            {relativeDay(t.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionTitle
            kicker="Money ahead"
            right={
              <Link
                href="/app/money"
                className="flex min-h-11 items-center gap-1 text-xs text-ink-2 hover:text-ink hover:underline"
              >
                Money <ArrowRight size={13} />
              </Link>
            }
          >
            Next payments
          </SectionTitle>
          <div>
            {upcomingPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 border-t border-line py-2 first:border-t-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] text-ink">{p.label}</div>
                  {p.dueDate && (
                    <div className="font-mono text-[10px] text-ink-3">
                      {relativeDay(p.dueDate)}
                    </div>
                  )}
                </div>
                <div className="text-right font-mono text-[13px] tabular-nums text-ink">
                  {fmtMoney(p.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
