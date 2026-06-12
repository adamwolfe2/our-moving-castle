"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import { TASK_CATEGORIES, type Task, type TaskCategory } from "@/lib/constants";
import { CATEGORY_META } from "@/lib/move-data";
import { fmtDate, todayISO } from "@/lib/format";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  SectionTitle,
  cx,
} from "@/components/app/ui";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const { items, update, create } = useCollection<Task>("/api/tasks");
  // Month is 0-indexed; default June 2026 (move month).
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selected, setSelected] = useState<string | null>(todayISO());
  const [activeCats, setActiveCats] = useState<Set<TaskCategory>>(new Set());
  const [quick, setQuick] = useState("");

  const filtered = useMemo(
    () =>
      activeCats.size
        ? items.filter((t) => activeCats.has(t.category))
        : items,
    [items, activeCats],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filtered) {
      if (!t.dueDate) continue;
      if (!map.has(t.dueDate)) map.set(t.dueDate, []);
      map.get(t.dueDate)!.push(t);
    }
    return map;
  }, [filtered]);

  const grid = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const today = todayISO();

  function shift(delta: number) {
    const m = month + delta;
    if (m < 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else if (m > 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth(m);
  }

  const selectedTasks = selected ? byDay.get(selected) ?? [] : [];

  async function quickAdd() {
    if (!quick.trim() || !selected) return;
    await create({ title: quick.trim(), dueDate: selected, category: "home" });
    setQuick("");
  }

  return (
    <div>
      <SectionTitle
        kicker="Live · driven by due dates"
        right={
          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={() => shift(-1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="min-w-32 text-center font-serif text-lg text-walnut">
              {monthLabel}
            </span>
            <Button variant="ghost" onClick={() => shift(1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      >
        Calendar
      </SectionTitle>

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
                "cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition",
                on ? "text-cream" : "bg-walnut/6 text-walnut/60 hover:bg-walnut/10",
              )}
              style={on ? { backgroundColor: CATEGORY_META[c].swatch } : undefined}
            >
              {CATEGORY_META[c].label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-3 md:p-4">
          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="px-1 py-1 text-center font-mono text-[10px] uppercase tracking-wider text-dust"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((d, i) => {
              if (d == null) return <div key={i} />;
              const cell = iso(year, month, d);
              const dayTasks = byDay.get(cell) ?? [];
              const isToday = cell === today;
              const isSel = cell === selected;
              const isMoveDay = cell === "2026-06-17";
              return (
                <button
                  key={i}
                  onClick={() => setSelected(cell)}
                  className={cx(
                    "flex min-h-16 cursor-pointer flex-col rounded-xl border p-1.5 text-left transition md:min-h-20",
                    isSel
                      ? "border-terracotta/50 bg-white"
                      : "border-walnut/8 bg-white/50 hover:bg-white/80",
                  )}
                >
                  <span
                    className={cx(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                      isMoveDay && "bg-terracotta font-semibold text-cream",
                      isToday && !isMoveDay && "bg-walnut font-semibold text-cream",
                      !isToday && !isMoveDay && "text-walnut/70",
                    )}
                  >
                    {d}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {dayTasks.slice(0, 5).map((t) => (
                      <span
                        key={t.id}
                        className={cx(
                          "h-1.5 w-1.5 rounded-full",
                          t.status === "done" && "opacity-30",
                        )}
                        style={{ backgroundColor: CATEGORY_META[t.category].swatch }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Day panel */}
        <Card className="h-fit p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-dust">
            {selected ? fmtDate(selected) : "Pick a day"}
          </div>
          {selected === "2026-06-17" && (
            <div className="mt-1 font-serif text-lg text-terracotta">
              Move-in day
            </div>
          )}
          <div className="mt-4 space-y-2">
            {selectedTasks.length === 0 && (
              <p className="text-sm text-dust">No tasks for this day.</p>
            )}
            {selectedTasks.map((t) => (
              <div key={t.id} className="flex items-start gap-2.5">
                <div className="pt-0.5">
                  <Checkbox
                    checked={t.status === "done"}
                    onChange={() =>
                      update(t.id, {
                        status: t.status === "done" ? "todo" : "done",
                      })
                    }
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={cx(
                      "text-sm leading-snug",
                      t.status === "done" ? "text-dust line-through" : "text-walnut",
                    )}
                  >
                    {t.title}
                  </div>
                  <Badge color={CATEGORY_META[t.category].swatch}>
                    {CATEGORY_META[t.category].label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="mt-4 flex gap-2">
              <Input
                value={quick}
                onChange={(e) => setQuick(e.target.value)}
                placeholder="Add to this day…"
                onKeyDown={(e) => e.key === "Enter" && quickAdd()}
              />
              <Button onClick={quickAdd} disabled={!quick.trim()}>
                <Plus size={15} />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
