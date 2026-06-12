"use client";
import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Flame } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import {
  TASK_CATEGORIES,
  type Payment,
  type Task,
} from "@/lib/constants";
import { CATEGORY_META } from "@/lib/move-data";
import { MOVE, daysUntilMoveIn } from "@/lib/move-data";
import { fmtMoney, relativeDay, daysFromToday } from "@/lib/format";
import { Badge, Card, Checkbox, ProgressBar, SectionTitle, cx } from "@/components/app/ui";

export default function Dashboard() {
  const tasksApi = useCollection<Task>("/api/tasks");
  const { items: payments } = useCollection<Payment>("/api/payments");
  const tasks = tasksApi.items;
  const days = daysUntilMoveIn();

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
      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-dust">
              {MOVE.city} · Closing & Move
            </div>
            <h1 className="mt-1 font-serif text-4xl text-walnut md:text-5xl">
              {MOVE.address}
            </h1>
            <p className="mt-2 text-sm text-walnut/60">
              Keys & possession Wednesday, June 17 at {MOVE.closeTime}.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-walnut px-6 py-4 text-cream">
            <Flame size={28} className="text-terracotta" />
            <div>
              <div className="font-serif text-5xl leading-none">
                {days > 0 ? days : days === 0 ? "0" : "✓"}
              </div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-cream/60">
                {days > 0 ? "days to keys" : days === 0 ? "move day" : "moved in"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Money strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Paid to date" value={fmtMoney(MOVE.paidToDate)} tone="moss" />
        <Stat label="Out-of-pocket ahead" value={`~${fmtMoney(MOVE.outOfPocketAhead)}`} tone="terracotta" />
        <Stat label="Balance at closing" value={fmtMoney(MOVE.balanceAtClosing)} />
        <Stat label="True monthly cost" value={`${fmtMoney(MOVE.trueMonthlyCost)}/mo`} />
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
