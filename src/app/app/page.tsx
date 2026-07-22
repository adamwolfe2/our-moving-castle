"use client";
import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Flame, Receipt, Wrench } from "lucide-react";
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
import { Badge, Card, Checkbox, ProgressBar, SectionTitle, cx } from "@/components/app/ui";

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

  return (
    <div className="space-y-8">
      {/* Hero — Home OS */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-dust">
              {MOVE.city} · Home OS
            </div>
            <h1 className="mt-1 font-serif text-4xl text-walnut md:text-5xl">
              {MOVE.address}
            </h1>
            <p className="mt-2 text-sm text-walnut/60">
              The castle runs itself — you just check in.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-walnut px-6 py-4 text-cream">
            <Flame
              size={28}
              className={home.overdue.length ? "text-terracotta" : "text-gold"}
            />
            <div>
              <div className="font-serif text-5xl leading-none">
                {home.overdue.length}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-cream/60">
                {home.overdue.length === 1 ? "task overdue" : "tasks overdue"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Home OS strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Maintenance due · 30d"
          value={String(home.due30.length)}
          tone={home.due30.length > 10 ? "terracotta" : undefined}
        />
        <Stat
          label="Autopay coverage"
          value={`${home.autopayOn}/${accounts.length || "—"}`}
          tone={accounts.length > 0 && home.autopayOn === accounts.length ? "moss" : "terracotta"}
        />
        <Stat label="Est. home cost" value={`${fmtMoney(home.estMonthly)}/mo`} />
        <Stat label="True monthly cost" value={`${fmtMoney(MOVE.trueMonthlyCost)}/mo`} />
      </div>

      {/* Home OS: maintenance + bills */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <SectionTitle
            kicker="Synced from the maintenance sheet"
            right={
              <Link
                href="/app/maintenance"
                className="flex items-center gap-1 text-xs text-terracotta hover:underline"
              >
                Full sheet <ArrowRight size={13} />
              </Link>
            }
          >
            Up next · maintenance
          </SectionTitle>
          {home.next.length === 0 ? (
            <p className="py-6 text-center text-sm text-dust">
              <Wrench size={15} className="mx-auto mb-1" />
              Nothing scheduled. Seed the sheet or add a task.
            </p>
          ) : (
            <div className="-mx-2">
              {home.next.map((t) => {
                const st = maintStatus(t.nextDue);
                return (
                  <Link
                    key={t.id}
                    href="/app/maintenance"
                    className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-walnut/[0.03]"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: st.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-walnut">{t.task}</div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-dust">
                        <span>{t.category}</span>
                        <span>·</span>
                        <span>{freqLabel(t.intervalMonths)}</span>
                        <span>·</span>
                        <span>{OWNER_DISPLAY[t.owner]}</span>
                      </div>
                    </div>
                    <span
                      className={cx(
                        "shrink-0 font-mono text-[10px]",
                        st.key === "overdue" ? "font-semibold text-terracotta" : "text-dust",
                      )}
                    >
                      {t.nextDue ? relativeDay(t.nextDue) : ""}
                    </span>
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
                className="flex items-center gap-1 text-xs text-terracotta hover:underline"
              >
                Bills <ArrowRight size={13} />
              </Link>
            }
          >
            Money out
          </SectionTitle>
          <div className="space-y-2.5">
            {accounts.slice(0, 7).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm text-walnut">{a.provider}</div>
                  <div className="font-mono text-[10px] text-dust">
                    {a.billingCycle}
                    {a.dueDay ? ` · ${a.dueDay}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cx(
                      "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
                      a.autopay ? "bg-moss/15 text-moss" : "bg-terracotta/12 text-terracotta",
                    )}
                  >
                    {a.autopay ? "auto" : "manual"}
                  </span>
                  <span className="font-mono text-sm text-walnut">
                    {a.estMonthly != null ? fmtMoney(a.estMonthly) : "—"}
                  </span>
                </div>
              </div>
            ))}
            {home.pendingBills.length > 0 && (
              <div className="mt-3 border-t border-walnut/8 pt-3">
                <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-dust">
                  <Receipt size={11} className="mr-1 inline" /> Pending bills
                </div>
                {home.pendingBills.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-sm">
                    <span className="text-walnut/70">{b.period}</span>
                    <span className="font-mono text-walnut">
                      {fmtMoney(b.amount)}
                      {b.dueDate ? (
                        <span className="ml-1.5 text-[10px] text-dust">{fmtDateShort(b.dueDate)}</span>
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
            <span className="font-serif text-3xl text-walnut">{stats.pct}%</span>
          }
        >
          Move progress
        </SectionTitle>
        <ProgressBar value={stats.pct} />
        <div className="mt-2 text-xs text-dust">
          {stats.done} of {stats.total} tasks complete
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {stats.byCat.map((g) => (
            <div key={g.cat}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-walnut/70">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_META[g.cat].swatch }}
                  />
                  {CATEGORY_META[g.cat].label}
                </span>
                <span className="font-mono text-dust">
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
                className="flex items-center gap-1 text-xs text-terracotta hover:underline"
              >
                All tasks <ArrowRight size={13} />
              </Link>
            }
          >
            This week · critical path
          </SectionTitle>
          {thisWeek.length === 0 ? (
            <p className="py-6 text-center text-sm text-dust">
              Nothing critical outstanding. Breathe.
            </p>
          ) : (
            <div className="-mx-2">
              {thisWeek.map((t) => {
                const overdue = (daysFromToday(t.dueDate) ?? 1) < 0;
                return (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-walnut/[0.03]"
                  >
                    <div className="pt-0.5">
                      <Checkbox
                        checked={false}
                        onChange={() => tasksApi.update(t.id, { status: "done" })}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-walnut">{t.title}</div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge color={CATEGORY_META[t.category].swatch}>
                          {CATEGORY_META[t.category].label}
                        </Badge>
                        {t.priority === "critical" && (
                          <span className="flex items-center gap-0.5 font-mono text-[10px] uppercase text-terracotta">
                            <AlertTriangle size={11} /> critical
                          </span>
                        )}
                        {t.dueDate && (
                          <span
                            className={cx(
                              "font-mono text-[10px]",
                              overdue ? "font-semibold text-terracotta" : "text-dust",
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
                className="flex items-center gap-1 text-xs text-terracotta hover:underline"
              >
                Money <ArrowRight size={13} />
              </Link>
            }
          >
            Next payments
          </SectionTitle>
          <div className="space-y-3">
            {upcomingPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm text-walnut">{p.label}</div>
                  {p.dueDate && (
                    <div className="font-mono text-[10px] text-dust">
                      {relativeDay(p.dueDate)}
                    </div>
                  )}
                </div>
                <div className="font-mono text-sm text-walnut">
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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "moss" | "terracotta";
}) {
  return (
    <Card className="p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-dust">
        {label}
      </div>
      <div
        className={cx(
          "mt-1 font-serif text-xl md:text-2xl",
          tone === "moss" && "text-moss",
          tone === "terracotta" && "text-terracotta",
          !tone && "text-walnut",
        )}
      >
        {value}
      </div>
    </Card>
  );
}
