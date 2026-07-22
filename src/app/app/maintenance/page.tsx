"use client";
// Home OS — Maintenance spreadsheet. Dense sortable/filterable grid mirroring
// the Cadet House Maintenance Tracker workbook, backed by the DB.
import { Fragment, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import {
  MAINT_OWNERS,
  type MaintenanceTask,
  type MaintOwner,
} from "@/lib/constants";
import { fmtDateShort, todayISO } from "@/lib/format";
import { freqLabel, maintStatus, OWNER_DISPLAY } from "@/lib/maintenance";
import {
  Badge,
  type BadgeTone,
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  SectionTitle,
  Stat,
  TD,
  TH,
  TR,
  cx,
} from "@/components/app/ui";

type SortKey = "task" | "category" | "intervalMonths" | "nextDue" | "owner";

// Presentational mapping only — status logic still lives in maintStatus().
function statusTone(key: string): BadgeTone {
  if (key === "overdue") return "red";
  if (key === "due-soon") return "amber";
  if (key === "ok") return "green";
  return "gray";
}

export default function MaintenancePage() {
  const api = useCollection<MaintenanceTask>("/api/maintenance");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [owner, setOwner] = useState("all");
  const [band, setBand] = useState("all"); // all | overdue | due-soon | ok
  const [sort, setSort] = useState<SortKey>("nextDue");
  const [dir, setDir] = useState<1 | -1>(1);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loggingId, setLoggingId] = useState<number | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(api.items.map((t) => t.category))).sort(),
    [api.items],
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = api.items.filter((t) => {
      if (!t.active) return false;
      if (cat !== "all" && t.category !== cat) return false;
      if (owner !== "all" && t.owner !== owner) return false;
      if (band !== "all" && maintStatus(t.nextDue).key !== band) return false;
      if (
        needle &&
        !`${t.task} ${t.area ?? ""} ${t.notes ?? ""}`.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sort === "intervalMonths") cmp = a.intervalMonths - b.intervalMonths;
      else if (sort === "nextDue")
        cmp = (a.nextDue ?? "9999").localeCompare(b.nextDue ?? "9999");
      else cmp = String(a[sort]).localeCompare(String(b[sort]));
      return cmp * dir;
    });
    return sorted;
  }, [api.items, q, cat, owner, band, sort, dir]);

  const counts = useMemo(() => {
    const active = api.items.filter((t) => t.active);
    return {
      total: active.length,
      overdue: active.filter((t) => maintStatus(t.nextDue).key === "overdue").length,
      dueSoon: active.filter((t) => maintStatus(t.nextDue).key === "due-soon").length,
    };
  }, [api.items]);

  function toggleSort(key: SortKey) {
    if (sort === key) setDir((d) => (d === 1 ? -1 : 1));
    else {
      setSort(key);
      setDir(1);
    }
  }

  async function completeTask(
    id: number,
    data: { doneDate?: string; cost?: number | null; vendor?: string | null; notes?: string | null },
  ) {
    const res = await fetch(`/api/maintenance/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) await api.reload();
  }

  return (
    <div>
      <SectionTitle
        kicker="Home OS · recurring upkeep"
        right={
          <Button variant="soft" onClick={() => setAdding((v) => !v)}>
            <Plus size={15} /> Add task
          </Button>
        }
      >
        Maintenance
      </SectionTitle>

      {/* Stat strip */}
      <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:grid-cols-3">
        <Stat
          className="bg-surface"
          label="Overdue"
          value={counts.overdue}
          tone={counts.overdue ? "bad" : "ok"}
          sub={counts.overdue ? "needs attention" : "all clear"}
        />
        <Stat
          className="bg-surface"
          label="Due in 14 days"
          value={counts.dueSoon}
          tone={counts.dueSoon ? "warn" : undefined}
          sub={counts.dueSoon ? "coming up" : undefined}
        />
        <Stat
          className="col-span-2 bg-surface sm:col-span-1"
          label="Active tasks"
          value={counts.total}
        />
      </div>

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tasks…"
          className="w-full sm:w-52"
        />
        <Select value={band} onChange={(e) => setBand(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="overdue">Overdue</option>
          <option value="due-soon">Due soon</option>
          <option value="ok">Scheduled</option>
        </Select>
        <Select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="all">Anyone</option>
          {MAINT_OWNERS.map((o) => (
            <option key={o} value={o}>{OWNER_DISPLAY[o]}</option>
          ))}
        </Select>
        <span className="ml-auto font-mono text-[10px] text-ink-3">
          {rows.length} of {counts.total}
        </span>
      </div>

      {adding && (
        <TaskEditor
          onCancel={() => setAdding(false)}
          onSave={async (data) => {
            await api.create(data);
            setAdding(false);
          }}
        />
      )}

      {/* Spreadsheet */}
      {api.loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState>
          <Wrench size={16} className="mx-auto mb-1" /> No tasks match.
        </EmptyState>
      ) : (
        <>
        {/* Mobile: card list (tables don't work on phones) */}
        <div className="space-y-2 md:hidden">
          {rows.map((t) => {
            const st = maintStatus(t.nextDue);
            if (editingId === t.id) {
              return (
                <TaskEditor
                  key={t.id}
                  task={t}
                  onCancel={() => setEditingId(null)}
                  onSave={async (data) => {
                    await api.update(t.id, data);
                    setEditingId(null);
                  }}
                />
              );
            }
            return (
              <Card key={t.id} className="p-3">
                <div className="flex items-start gap-3">
                  <button
                    aria-label="Mark complete"
                    onClick={() => setLoggingId(loggingId === t.id ? null : t.id)}
                    className={cx(
                      "mt-0.5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition",
                      loggingId === t.id
                        ? "border-ok bg-ok text-white"
                        : "border-line-strong text-ink-3 active:border-ok",
                    )}
                  >
                    <Check size={18} strokeWidth={2.5} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-snug text-ink">{t.task}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] text-ink-3">
                      <span>{t.category}</span>
                      <span>·</span>
                      <span>{freqLabel(t.intervalMonths)}</span>
                      <span>·</span>
                      <span>{OWNER_DISPLAY[t.owner]}</span>
                      {t.nextDue && (
                        <>
                          <span>·</span>
                          <span className={st.key === "overdue" ? "font-semibold text-bad" : ""}>
                            due {fmtDateShort(t.nextDue)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge tone={statusTone(st.key)}>
                      {st.key === "overdue" && st.days != null
                        ? `${Math.abs(st.days)}d over`
                        : st.key === "due-soon" && st.days != null
                          ? st.days === 0 ? "today" : `${st.days}d`
                          : st.key === "ok" ? "ok" : "—"}
                    </Badge>
                    <div className="flex">
                      <button
                        onClick={() => setEditingId(t.id)}
                        className="cursor-pointer p-2 text-ink-3 active:text-ink"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => api.remove(t.id)}
                        className="cursor-pointer p-2 text-ink-3 active:text-bad"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                {loggingId === t.id && (
                  <div className="mt-2 rounded-xl bg-ok/5">
                    <CompleteRow
                      onCancel={() => setLoggingId(null)}
                      onSave={async (data) => {
                        await completeTask(t.id, data);
                        setLoggingId(null);
                      }}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-line bg-canvas">
                <Th className="w-8" />
                <Th onClick={() => toggleSort("task")} active={sort === "task"} dir={dir}>Task</Th>
                <Th onClick={() => toggleSort("category")} active={sort === "category"} dir={dir}>Category</Th>
                <Th>Area</Th>
                <Th onClick={() => toggleSort("intervalMonths")} active={sort === "intervalMonths"} dir={dir}>Freq</Th>
                <Th onClick={() => toggleSort("owner")} active={sort === "owner"} dir={dir}>Owner</Th>
                <Th className="text-right">Min</Th>
                <Th>Last done</Th>
                <Th onClick={() => toggleSort("nextDue")} active={sort === "nextDue"} dir={dir}>Next due</Th>
                <Th>Status</Th>
                <Th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const st = maintStatus(t.nextDue);
                if (editingId === t.id) {
                  return (
                    <tr key={t.id} className="border-t border-line">
                      <td colSpan={11} className="p-0">
                        <TaskEditor
                          task={t}
                          onCancel={() => setEditingId(null)}
                          onSave={async (data) => {
                            await api.update(t.id, data);
                            setEditingId(null);
                          }}
                        />
                      </td>
                    </tr>
                  );
                }
                return (
                  <Fragment key={t.id}>
                    <tr className={cx(TR, "group")}>
                      <td className="py-2 pl-3">
                        <button
                          title="Mark complete"
                          onClick={() => setLoggingId(loggingId === t.id ? null : t.id)}
                          className={cx(
                            "flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition",
                            loggingId === t.id
                              ? "border-ok bg-ok text-white"
                              : "border-line-strong text-transparent hover:border-ok/60 hover:text-ok/50",
                          )}
                        >
                          <Check size={13} strokeWidth={3} />
                        </button>
                      </td>
                      <td className={cx(TD, "max-w-[280px]")}>
                        <div className="truncate" title={t.notes ?? t.task}>{t.task}</div>
                        {t.notes && (
                          <div className="truncate text-[10px] text-ink-3" title={t.notes}>{t.notes}</div>
                        )}
                      </td>
                      <td className={cx(TD, "text-ink-2")}>{t.category}</td>
                      <td className={cx(TD, "max-w-[110px] truncate text-ink-3")}>{t.area}</td>
                      <td className={cx(TD, "font-mono text-[11px] text-ink-2")}>{freqLabel(t.intervalMonths)}</td>
                      <td className={cx(TD, "text-ink-2")}>{OWNER_DISPLAY[t.owner]}</td>
                      <td className={cx(TD, "text-right font-mono text-[11px] text-ink-3 tabular-nums")}>{t.estMinutes ?? "—"}</td>
                      <td className={cx(TD, "font-mono text-[11px] text-ink-3 tabular-nums")}>
                        {t.lastDone ? fmtDateShort(t.lastDone) : "—"}
                      </td>
                      <td className={cx(TD, "font-mono text-[11px] tabular-nums")}>
                        {t.nextDue ? fmtDateShort(t.nextDue) : "—"}
                      </td>
                      <td className={TD}>
                        <Badge tone={statusTone(st.key)}>
                          {st.key === "overdue" && st.days != null
                            ? `${Math.abs(st.days)}d over`
                            : st.key === "due-soon" && st.days != null
                              ? st.days === 0 ? "today" : `in ${st.days}d`
                              : st.label}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3">
                        <div className="flex justify-end opacity-0 transition group-hover:opacity-100">
                          <button
                            onClick={() => setEditingId(t.id)}
                            className="cursor-pointer p-1 text-ink-3 hover:text-ink"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => api.remove(t.id)}
                            className="cursor-pointer p-1 text-ink-3 hover:text-bad"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {loggingId === t.id && (
                      <tr className="border-t border-line">
                        <td colSpan={11} className="bg-ok/5 p-0">
                          <CompleteRow
                            onCancel={() => setLoggingId(null)}
                            onSave={async (data) => {
                              await completeTask(t.id, data);
                              setLoggingId(null);
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </Card>
        </>
      )}
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
  className,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  dir?: 1 | -1;
  className?: string;
}) {
  return (
    <th
      onClick={onClick}
      className={cx(
        TH,
        "first:pl-3",
        onClick && "cursor-pointer select-none hover:text-ink",
        className,
      )}
    >
      <span className="inline-flex items-center gap-0.5">
        {children}
        {active && (dir === 1 ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
      </span>
    </th>
  );
}

function CompleteRow({
  onSave,
  onCancel,
}: {
  onSave: (data: {
    doneDate: string;
    cost: number | null;
    vendor: string | null;
    notes: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [doneDate, setDoneDate] = useState(todayISO());
  const [cost, setCost] = useState("");
  const [vendor, setVendor] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-ok">Log completion</span>
      <Input type="date" value={doneDate} onChange={(e) => setDoneDate(e.target.value)} className="w-auto" />
      <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="$ cost" className="w-24" />
      <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor" className="w-36" />
      <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="min-w-40 flex-1" />
      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await onSave({
            doneDate,
            cost: cost ? Number(cost) : null,
            vendor: vendor.trim() || null,
            notes: notes.trim() || null,
          });
        }}
      >
        <Check size={14} /> Done
      </Button>
      <Button variant="ghost" onClick={onCancel}>
        <X size={14} />
      </Button>
    </div>
  );
}

function TaskEditor({
  task,
  onSave,
  onCancel,
}: {
  task?: MaintenanceTask;
  onSave: (data: Partial<MaintenanceTask>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(task?.task ?? "");
  const [category, setCategory] = useState(task?.category ?? "Interior");
  const [area, setArea] = useState(task?.area ?? "");
  const [interval, setInterval] = useState(String(task?.intervalMonths ?? 12));
  const [estMinutes, setEstMinutes] = useState(task?.estMinutes ? String(task.estMinutes) : "");
  const [owner, setOwner] = useState<MaintOwner>(task?.owner ?? "adam");
  const [nextDue, setNextDue] = useState(task?.nextDue ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");

  return (
    <div className="space-y-2.5 rounded-lg border border-line bg-canvas p-4">
      <div className="flex items-center gap-2">
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Task" />
        <button onClick={onCancel} className="cursor-pointer p-1.5 text-ink-3 hover:text-ink">
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="w-36" />
        <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area" className="w-36" />
        <Input type="number" value={interval} onChange={(e) => setInterval(e.target.value)} placeholder="Interval (months)" className="w-36" />
        <Input type="number" value={estMinutes} onChange={(e) => setEstMinutes(e.target.value)} placeholder="Est. min" className="w-24" />
        <Select value={owner} onChange={(e) => setOwner(e.target.value as MaintOwner)}>
          {MAINT_OWNERS.map((o) => (
            <option key={o} value={o}>{OWNER_DISPLAY[o]}</option>
          ))}
        </Select>
        <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} className="w-auto" />
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="min-w-48 flex-1" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!name.trim()}
          onClick={() =>
            onSave({
              task: name.trim(),
              category: category.trim() || "Interior",
              area: area.trim() || null,
              intervalMonths: interval ? Math.max(1, Number(interval)) : 12,
              estMinutes: estMinutes ? Number(estMinutes) : null,
              owner,
              nextDue: nextDue || null,
              notes: notes.trim() || null,
            })
          }
        >
          {task ? "Save" : "Add"}
        </Button>
      </div>
    </div>
  );
}
