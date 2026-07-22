"use client";
import { useMemo, useState } from "react";
import { Check, ClipboardCopy, Plus, Trash2 } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import type { DailyLogEntry, Payment, Task } from "@/lib/constants";
import { CATEGORY_META } from "@/lib/move-data";
import { MOVE, daysUntilMoveIn } from "@/lib/move-data";
import { fmtDate, fmtMoney, todayISO, daysFromToday } from "@/lib/format";
import {
  Button,
  Card,
  EmptyState,
  Input,
  SectionTitle,
  Textarea,
} from "@/components/app/ui";

export default function BriefPage() {
  const { items: tasks } = useCollection<Task>("/api/tasks");
  const { items: payments } = useCollection<Payment>("/api/payments");
  const log = useCollection<DailyLogEntry>("/api/daily-log");
  const [copied, setCopied] = useState(false);

  const open = tasks.filter((t) => t.status !== "done");
  const overdue = open
    .filter((t) => (daysFromToday(t.dueDate) ?? 1) < 0)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  const today = open.filter((t) => daysFromToday(t.dueDate) === 0);
  const week = open
    .filter((t) => {
      const d = daysFromToday(t.dueDate);
      return d != null && d > 0 && d <= 7;
    })
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  const owed = payments
    .filter((p) => p.kind === "due" || p.kind === "upcoming")
    .reduce((s, p) => s + p.amount, 0);
  const pct = tasks.length
    ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)
    : 0;

  const briefText = useMemo(() => {
    const line = (t: Task) =>
      `- ${t.title}${t.dueDate ? ` (${fmtDate(t.dueDate)})` : ""} [${CATEGORY_META[t.category].label}]`;
    const days = daysUntilMoveIn();
    return [
      `MOVING CASTLE — daily update (${fmtDate(todayISO())})`,
      `${MOVE.address} · ${days > 0 ? `${days} days to keys` : "moved in"} · ${pct}% of tasks done`,
      ``,
      `OVERDUE (${overdue.length}):`,
      ...(overdue.length ? overdue.map(line) : ["- none"]),
      ``,
      `DUE TODAY (${today.length}):`,
      ...(today.length ? today.map(line) : ["- none"]),
      ``,
      `NEXT 7 DAYS (${week.length}):`,
      ...(week.length ? week.map(line) : ["- none"]),
      ``,
      `MONEY: ${fmtMoney(owed)} still owed (one-time) · balance at closing ${fmtMoney(MOVE.balanceAtClosing)}`,
    ].join("\n");
  }, [overdue, today, week, owed, pct]);

  async function copy() {
    await navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle
          kicker="Where things stand, right now"
          right={
            <Button onClick={copy}>
              {copied ? <Check size={15} /> : <ClipboardCopy size={15} />}
              {copied ? "Copied" : "Copy for Claude"}
            </Button>
          }
        >
          Daily Brief
        </SectionTitle>
        <p className="mb-4 max-w-xl text-sm text-ink-3">
          A live snapshot. Hit “Copy for Claude” and paste it into a chat to get
          help re-planning the day around what’s actually left.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <BriefCol title="Overdue" tone="text-bad" tasks={overdue} empty="Nothing overdue." />
          <BriefCol title="Due today" tone="text-ink" tasks={today} empty="Nothing due today." />
          <BriefCol title="Next 7 days" tone="text-ok" tasks={week} empty="Clear week ahead." />
        </div>
      </div>

      {/* Daily log */}
      <div>
        <SectionTitle kicker="Your standup, logged">Progress log</SectionTitle>
        <LogEditor
          onSave={(data) => log.create(data)}
          existingToday={log.items.find((e) => e.logDate === todayISO())}
          onUpdate={(id, data) => log.update(id, data)}
        />
        <div className="mt-5 space-y-3">
          {log.items
            .filter((e) => e.logDate !== todayISO())
            .map((e) => (
              <Card key={e.id} className="group p-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
                    {fmtDate(e.logDate)}
                    {e.mood && <span className="ml-2 text-ink-2">{e.mood}</span>}
                  </div>
                  <button
                    onClick={() => log.remove(e.id)}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink-3 opacity-100 transition hover:text-bad md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {e.wins && (
                  <p className="mt-2 text-sm text-ink">
                    <span className="font-medium text-ok">Wins · </span>
                    {e.wins}
                  </p>
                )}
                {e.blockers && (
                  <p className="mt-1 text-sm text-ink">
                    <span className="font-medium text-bad">Blockers · </span>
                    {e.blockers}
                  </p>
                )}
                {e.entry && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-ink-2">
                    {e.entry}
                  </p>
                )}
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

function BriefCol({
  title,
  tone,
  tasks,
  empty,
}: {
  title: string;
  tone: string;
  tasks: Task[];
  empty: string;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className={`text-sm font-semibold tracking-[-0.01em] ${tone}`}>{title}</h3>
        <span className="font-mono text-sm tabular-nums text-ink-3">{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-ink-3">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-start gap-2 text-sm text-ink">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_META[t.category].swatch }}
              />
              <span>
                {t.title}
                {t.dueDate && (
                  <span className="ml-1 font-mono text-[10px] text-ink-3">
                    {fmtDate(t.dueDate)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function LogEditor({
  existingToday,
  onSave,
  onUpdate,
}: {
  existingToday?: DailyLogEntry;
  onSave: (data: Partial<DailyLogEntry>) => Promise<unknown>;
  onUpdate: (id: number, data: Partial<DailyLogEntry>) => Promise<unknown>;
}) {
  const [mood, setMood] = useState(existingToday?.mood ?? "");
  const [wins, setWins] = useState(existingToday?.wins ?? "");
  const [blockers, setBlockers] = useState(existingToday?.blockers ?? "");
  const [entry, setEntry] = useState(existingToday?.entry ?? "");
  const [saved, setSaved] = useState(false);

  async function save() {
    const data = {
      logDate: todayISO(),
      mood: mood.trim() || null,
      wins: wins.trim() || null,
      blockers: blockers.trim() || null,
      entry: entry.trim() || null,
    };
    if (existingToday) await onUpdate(existingToday.id, data);
    else await onSave(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Card className="space-y-2.5 p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-3">
          Today · {fmtDate(todayISO())}
        </div>
        <Input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Mood"
          className="w-32"
        />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <Input value={wins} onChange={(e) => setWins(e.target.value)} placeholder="Wins today" />
        <Input
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          placeholder="Blockers"
        />
      </div>
      <Textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Notes — anything you want to remember or tell Claude tomorrow"
        rows={2}
      />
      <div className="flex justify-end">
        <Button onClick={save}>
          {saved ? <Check size={15} /> : <Plus size={15} />}
          {existingToday ? "Update today" : "Log today"}
        </Button>
      </div>
    </Card>
  );
}
