"use client";
import { useMemo, useState } from "react";
import { Link2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import type {
  BudgetLine,
  BudgetSource,
  MarketplaceItem,
  ShoppingItem,
} from "@/lib/constants";
import { fmtMoney } from "@/lib/format";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  ProgressBar,
  Select,
  SectionTitle,
  cx,
} from "@/components/app/ui";

export default function BudgetPage() {
  const budget = useCollection<BudgetLine>("/api/budget");
  const { items: shopping } = useCollection<ShoppingItem>("/api/shopping");
  const { items: market } = useCollection<MarketplaceItem>("/api/marketplace");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const shoppingTotal = useMemo(
    () => shopping.reduce((s, i) => s + (i.estCost ?? 0), 0),
    [shopping],
  );
  const marketTotal = useMemo(
    () => market.reduce((s, i) => s + (i.targetPrice ?? 0), 0),
    [market],
  );
  const actualOf = (l: BudgetLine) =>
    l.source === "shopping"
      ? shoppingTotal
      : l.source === "marketplace"
        ? marketTotal
        : l.actual;

  const totalPlanned = budget.items.reduce((s, l) => s + l.planned, 0);
  const totalActual = budget.items.reduce((s, l) => s + actualOf(l), 0);
  const remaining = totalPlanned - totalActual;
  const pct = totalPlanned ? Math.round((totalActual / totalPlanned) * 100) : 0;

  return (
    <div>
      <SectionTitle
        kicker="Realistic, flexible — adjust anytime"
        right={
          <Button variant="soft" onClick={() => setAdding((v) => !v)}>
            <Plus size={15} /> Add line
          </Button>
        }
      >
        Move-In Budget
      </SectionTitle>
      <p className="mb-6 max-w-xl text-sm text-dust">
        Set a target for each envelope and adjust as real bills land. Shopping and
        Marketplace totals flow in live. (Excludes the all-cash house price and annual
        property tax — those are tracked in Money.)
      </p>

      {/* Live summary */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
              Budget (planned)
            </div>
            <div className="mt-1 font-serif text-2xl text-walnut">
              {fmtMoney(totalPlanned)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
              Committed (live)
            </div>
            <div className="mt-1 font-serif text-2xl text-terracotta">
              {fmtMoney(totalActual)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
              {remaining >= 0 ? "Remaining" : "Over budget"}
            </div>
            <div
              className={cx(
                "mt-1 font-serif text-2xl",
                remaining >= 0 ? "text-moss" : "text-terracotta",
              )}
            >
              {fmtMoney(Math.abs(remaining))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={pct} />
          <div className="mt-1.5 text-xs text-dust">
            {pct}% of budget committed
          </div>
        </div>
      </Card>

      {adding && (
        <BudgetEditor
          onCancel={() => setAdding(false)}
          onSave={async (d) => {
            await budget.create(d);
            setAdding(false);
          }}
        />
      )}

      {budget.loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : (
        <Card className="divide-y divide-walnut/8">
          {/* header */}
          <div className="hidden grid-cols-[1fr_110px_110px_110px_70px] gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-dust sm:grid">
            <span>Envelope</span>
            <span className="text-right">Planned</span>
            <span className="text-right">Actual</span>
            <span className="text-right">Left</span>
            <span />
          </div>
          {budget.items.map((l) =>
            editingId === l.id ? (
              <BudgetEditor
                key={l.id}
                line={l}
                onCancel={() => setEditingId(null)}
                onSave={async (d) => {
                  await budget.update(l.id, d);
                  setEditingId(null);
                }}
              />
            ) : (
              <BudgetRow
                key={l.id}
                line={l}
                actual={actualOf(l)}
                onPlanned={(v) => budget.update(l.id, { planned: v })}
                onActual={
                  l.source === "manual"
                    ? (v) => budget.update(l.id, { actual: v })
                    : undefined
                }
                onEdit={() => setEditingId(l.id)}
                onDelete={() => budget.remove(l.id)}
              />
            ),
          )}
        </Card>
      )}
    </div>
  );
}

function BudgetRow({
  line,
  actual,
  onPlanned,
  onActual,
  onEdit,
  onDelete,
}: {
  line: BudgetLine;
  actual: number;
  onPlanned: (v: number) => void;
  onActual?: (v: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const left = line.planned - actual;
  return (
    <div className="group grid grid-cols-[1fr_auto] gap-2 px-4 py-3 hover:bg-walnut/[0.03] sm:grid-cols-[1fr_110px_110px_110px_70px] sm:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-sm text-walnut">
          {line.name}
          {line.source !== "manual" && (
            <Badge color="#5B8AA6">
              <Link2 size={9} /> live
            </Badge>
          )}
        </div>
        {line.notes && (
          <div className="text-[11px] text-dust">{line.notes}</div>
        )}
      </div>
      <NumberCell value={line.planned} onSave={onPlanned} />
      {onActual ? (
        <NumberCell value={actual} onSave={onActual} />
      ) : (
        <div className="text-right font-mono text-sm text-terracotta">
          {fmtMoney(actual)}
        </div>
      )}
      <div
        className={cx(
          "text-right font-mono text-sm",
          left < 0 ? "text-terracotta" : "text-moss",
        )}
      >
        {fmtMoney(left)}
      </div>
      <div className="flex justify-end opacity-0 transition group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="cursor-pointer p-1.5 text-walnut/40 hover:text-terracotta"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function NumberCell({
  value,
  onSave,
}: {
  value: number;
  onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value));
  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          setEditing(false);
          const n = Number(val);
          if (Number.isFinite(n) && n !== value) onSave(n);
        }}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="w-full rounded-lg border border-terracotta/40 bg-white px-2 py-1 text-right font-mono text-sm outline-none sm:w-[110px]"
      />
    );
  }
  return (
    <button
      onClick={() => {
        setVal(String(value));
        setEditing(true);
      }}
      className="cursor-pointer text-right font-mono text-sm text-walnut hover:text-terracotta"
    >
      {fmtMoney(value)}
    </button>
  );
}

function BudgetEditor({
  line,
  onSave,
  onCancel,
}: {
  line?: BudgetLine;
  onSave: (d: Partial<BudgetLine>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(line?.name ?? "");
  const [planned, setPlanned] = useState(line ? String(line.planned) : "");
  const [source, setSource] = useState<BudgetSource>(line?.source ?? "manual");
  const [notes, setNotes] = useState(line?.notes ?? "");

  async function save() {
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      planned: planned ? Number(planned) : 0,
      source,
      notes: notes.trim() || null,
    });
  }

  return (
    <div className="space-y-2.5 bg-linen/40 p-4">
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Envelope name"
        />
        <button
          onClick={onCancel}
          className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          type="number"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
          placeholder="Planned $"
          className="w-32"
        />
        <Select
          value={source}
          onChange={(e) => setSource(e.target.value as BudgetSource)}
        >
          <option value="manual">Manual actual</option>
          <option value="shopping">Auto: Shopping total</option>
          <option value="marketplace">Auto: Marketplace total</option>
        </Select>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="flex-1"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!name.trim()}>
          {line ? "Save" : "Add"}
        </Button>
      </div>
    </div>
  );
}
