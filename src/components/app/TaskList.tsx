"use client";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import {
  TASK_CATEGORIES,
  OWNERS,
  PRIORITIES,
  type Owner,
  type Priority,
  type Task,
  type TaskCategory,
} from "@/lib/constants";
import { CATEGORY_META, OWNER_LABEL } from "@/lib/move-data";
import { relativeDay, daysFromToday } from "@/lib/format";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Input,
  Select,
  Textarea,
  cx,
} from "./ui";

const PRIORITY_RANK: Record<Priority, number> = { critical: 0, high: 1, normal: 2 };

function sortTasks(a: Task, b: Task) {
  const ad = a.status === "done" ? 1 : 0;
  const bd = b.status === "done" ? 1 : 0;
  if (ad !== bd) return ad - bd;
  const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (pr !== 0) return pr;
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return a.sortOrder - b.sortOrder;
}

export function TaskList({
  fixedCategory,
  filter,
  groupBy = "category",
  showCategoryFilter = false,
  emptyText = "Nothing here yet. Add the first item.",
}: {
  fixedCategory?: TaskCategory;
  filter?: (t: Task) => boolean;
  groupBy?: "category" | "area" | "none";
  showCategoryFilter?: boolean;
  emptyText?: string;
}) {
  const { items, loading, error, create, update, remove } =
    useCollection<Task>("/api/tasks");
  const [activeCats, setActiveCats] = useState<Set<TaskCategory>>(new Set());
  const [adding, setAdding] = useState(false);

  const visible = useMemo(() => {
    let list = items;
    if (fixedCategory) list = list.filter((t) => t.category === fixedCategory);
    if (filter) list = list.filter(filter);
    if (activeCats.size) list = list.filter((t) => activeCats.has(t.category));
    return [...list].sort(sortTasks);
  }, [items, fixedCategory, filter, activeCats]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ key: "", items: visible }];
    const map = new Map<string, Task[]>();
    for (const t of visible) {
      const key = groupBy === "area" ? t.area || "Unsorted" : t.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    const keys =
      groupBy === "category"
        ? TASK_CATEGORIES.filter((c) => map.has(c))
        : [...map.keys()].sort();
    return keys.map((key) => ({ key, items: map.get(key)! }));
  }, [visible, groupBy]);

  const doneCount = visible.filter((t) => t.status === "done").length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px] text-ink-3">
          <span className="font-mono font-semibold text-ink">{doneCount}</span> /{" "}
          {visible.length} done
        </div>
        <Button variant="soft" onClick={() => setAdding((v) => !v)}>
          <Plus size={15} /> Add task
        </Button>
      </div>

      {showCategoryFilter && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {TASK_CATEGORIES.map((c) => {
            const on = activeCats.has(c);
            return (
              <button
                key={c}
                onClick={() =>
                  setActiveCats((prev) => {
                    const n = new Set(prev);
                    n.has(c) ? n.delete(c) : n.add(c);
                    return n;
                  })
                }
                className={cx(
                  "min-h-9 cursor-pointer rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition",
                  on
                    ? "border-transparent text-white"
                    : "border-line bg-surface text-ink-3 hover:bg-canvas",
                )}
                style={on ? { backgroundColor: CATEGORY_META[c].swatch } : undefined}
              >
                {CATEGORY_META[c].label}
              </button>
            );
          })}
        </div>
      )}

      {adding && (
        <TaskEditor
          fixedCategory={fixedCategory}
          onCancel={() => setAdding(false)}
          onSave={async (data) => {
            await create(data);
            setAdding(false);
          }}
        />
      )}

      {error && <p className="mb-3 text-sm text-bad">{error}</p>}
      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState>{emptyText}</EmptyState>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.key}>
              {groupBy !== "none" && (
                <div className="mb-2 flex items-center gap-2">
                  {groupBy === "category" && CATEGORY_META[g.key] && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_META[g.key].swatch }}
                    />
                  )}
                  <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3">
                    {groupBy === "category" && CATEGORY_META[g.key]
                      ? CATEGORY_META[g.key].label
                      : g.key}
                  </h3>
                </div>
              )}
              <Card className="overflow-hidden">
                {g.items.map((task, i) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    last={i === g.items.length - 1}
                    onToggle={() =>
                      update(task.id, {
                        status: task.status === "done" ? "todo" : "done",
                      })
                    }
                    onSave={(patch) => update(task.id, patch)}
                    onDelete={() => remove(task.id)}
                  />
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  last,
  onToggle,
  onSave,
  onDelete,
}: {
  task: Task;
  last: boolean;
  onToggle: () => void;
  onSave: (patch: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const done = task.status === "done";
  const overdue = !done && (daysFromToday(task.dueDate) ?? 1) < 0;

  if (editing) {
    return (
      <div className={cx(!last && "border-b border-line")}>
        <TaskEditor
          task={task}
          onCancel={() => setEditing(false)}
          onSave={async (data) => {
            onSave(data);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cx(
        "group flex items-start gap-3 px-3 py-2.5 transition hover:bg-canvas",
        !last && "border-b border-line",
      )}
    >
      <div className="pt-0.5">
        <Checkbox checked={done} onChange={onToggle} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <button
            onClick={() => task.notes && setOpen((v) => !v)}
            className={cx(
              "text-left text-[13px] leading-snug",
              done ? "text-ink-3 line-through" : "text-ink",
              task.notes && "cursor-pointer",
            )}
          >
            {task.title}
          </button>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {task.priority !== "normal" && !done && (
            <Badge tone={task.priority === "critical" ? "red" : "amber"}>
              {task.priority}
            </Badge>
          )}
          {task.dueDate && (
            <span
              className={cx(
                "font-mono text-[10px]",
                overdue ? "font-semibold text-bad" : "text-ink-3",
              )}
            >
              {relativeDay(task.dueDate)}
            </span>
          )}
          {task.owner !== "both" && task.owner !== "unassigned" && (
            <span className="font-mono text-[10px] text-ink-3">
              {OWNER_LABEL[task.owner]}
            </span>
          )}
          {task.cost != null && (
            <span className="font-mono text-[10px] text-ink-3">${task.cost}</span>
          )}
          {task.notes && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex cursor-pointer items-center text-ink-3"
            >
              {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>
          )}
        </div>

        {open && task.notes && (
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-ink-2">
            {task.notes}
            {task.link && (
              <>
                {" "}
                <a
                  href={task.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-info underline"
                >
                  link
                </a>
              </>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <button
          onClick={() => setEditing(true)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink-3 hover:bg-canvas hover:text-ink md:h-8 md:w-8"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink-3 hover:bg-bad/8 hover:text-bad md:h-8 md:w-8"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function TaskEditor({
  task,
  fixedCategory,
  onSave,
  onCancel,
}: {
  task?: Task;
  fixedCategory?: TaskCategory;
  onSave: (data: Partial<Task>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [category, setCategory] = useState<TaskCategory>(
    task?.category ?? fixedCategory ?? "home",
  );
  const [owner, setOwner] = useState<Owner>(task?.owner ?? "both");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "normal");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [area, setArea] = useState(task?.area ?? "");
  const [cost, setCost] = useState(task?.cost != null ? String(task.cost) : "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setBusy(true);
    await onSave({
      title: title.trim(),
      category,
      owner,
      priority,
      dueDate: dueDate || null,
      area: area.trim() || null,
      cost: cost ? Number(cost) : null,
      notes: notes.trim() || null,
    });
    setBusy(false);
  }

  return (
    <div className="space-y-2.5 bg-canvas p-3">
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          onKeyDown={(e) => e.key === "Enter" && save()}
        />
        <button
          onClick={onCancel}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink-3 hover:text-ink md:h-8 md:w-8"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {!fixedCategory && (
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
          >
            {TASK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </Select>
        )}
        <Select value={owner} onChange={(e) => setOwner(e.target.value as Owner)}>
          {OWNERS.map((o) => (
            <option key={o} value={o}>
              {OWNER_LABEL[o]}
            </option>
          ))}
        </Select>
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-auto"
        />
        <Input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Area / room"
          className="w-32"
        />
        <Input
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="$"
          className="w-20"
        />
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={save} disabled={busy || !title.trim()}>
          {task ? "Save" : "Add"}
        </Button>
      </div>
    </div>
  );
}
