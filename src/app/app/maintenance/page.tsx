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
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  SectionTitle,
  cx,
} from "@/components/app/ui";

type SortKey = "task" | "category" | "intervalMonths" | "nextDue" | "owner";

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
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">Overdue</div>
          <div className={cx("mt-0.5 font-serif text-2xl", counts.overdue ? "text-terracotta" : "text-moss")}>
            {counts.overdue}
          </div>
        </Card>
        <Card className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">Due in 14 days</div>
          <div className="mt-0.5 font-serif text-2xl text-gold">{counts.dueSoon}</div>
        </Card>
        <Card className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">Active tasks</div>
          <div className="mt-0.5 font-serif text-2xl text-walnut">{counts.total}</div>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tasks…"
          className="w-52"
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
        <span className="ml-auto font-mono text-[10px] text-dust">
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
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-walnut/10 bg-linen/80 backdrop-blur">
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
            <tbody className="divide-y divide-walnut/6">
              {rows.map((t) => {
                const st = maintStatus(t.nextDue);
                if (editingId === t.id) {
                  return (
                    <tr key={t.id}>
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
                    <tr className="group text-sm hover:bg-walnut/[0.03]">
                      <td className="py-2 pl-3">
                        <button
                          title="Mark complete"
                          onClick={() => setLoggingId(loggingId === t.id ? null : t.id)}
                          className={cx(
                            "flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition",
                            loggingId === t.id
                              ? "border-moss bg-moss text-cream"
                              : "border-walnut/25 text-transparent hover:border-moss/60 hover:text-moss/50",
                          )}
                        >
                          <Check size={13} strokeWidth={3} />
                        </button>
                      </td>
                      <td className="max-w-[280px] py-2 pr-2">
                        <div className="truncate text-walnut" title={t.notes ?? t.task}>{t.task}</div>
                        {t.notes && (
                          <div className="truncate text-[10px] text-dust" title={t.notes}>{t.notes}</div>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-xs text-walnut/70">{t.category}</td>
                      <td className="max-w-[110px] truncate py-2 pr-2 text-xs text-walnut/50">{t.area}</td>
                      <td className="py-2 pr-2 font-mono text-[11px] text-walnut/70">{freqLabel(t.intervalMonths)}</td>
                      <td className="py-2 pr-2 text-xs text-walnut/70">{OWNER_DISPLAY[t.owner]}</td>
                      <td className="py-2 pr-2 text-right font-mono text-[11px] text-walnut/50">{t.estMinutes ?? "—"}</td>
                      <td className="py-2 pr-2 font-mono text-[11px] text-walnut/50">
                        {t.lastDone ? fmtDateShort(t.lastDone) : "—"}
                      </td>
                      <td className="py-2 pr-2 font-mono text-[11px] text-walnut">
                        {t.nextDue ? fmtDateShort(t.nextDue) : "—"}
                      </td>
                      <td className="py-2 pr-2">
                        <Badge color={st.color}>
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
                            className="cursor-pointer p-1 text-walnut/40 hover:text-walnut"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => api.remove(t.id)}
                            className="cursor-pointer p-1 text-walnut/40 hover:text-terracotta"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {loggingId === t.id && (
                      <tr>
                        <td colSpan={11} className="bg-moss/5 p-0">
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
        "py-2 pl-3 pr-2 font-mono text-[10px] font-medium uppercase tracking-wider text-dust first:pl-3",
        onClick && "cursor-pointer select-none hover:text-walnut",
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
      <span className="font-mono text-[10px] uppercase tracking-wider text-moss">Log completion</span>
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
    <div className="space-y-2.5 rounded-2xl bg-linen/40 p-4">
      <div className="flex items-center gap-2">
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Task" />
        <button onClick={onCancel} className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut">
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
