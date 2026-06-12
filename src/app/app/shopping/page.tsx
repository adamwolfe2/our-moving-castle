"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import type { ShoppingItem } from "@/lib/constants";
import { fmtMoney } from "@/lib/format";
import {
  Button,
  Card,
  Checkbox,
  EmptyState,
  Input,
  SectionTitle,
  cx,
} from "@/components/app/ui";

export default function ShoppingPage() {
  const { items, loading, create, update, remove } =
    useCollection<ShoppingItem>("/api/shopping");
  const [adding, setAdding] = useState(false);
  const [item, setItem] = useState("");
  const [area, setArea] = useState("");
  const [cost, setCost] = useState("");

  const groups = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>();
    for (const s of items) {
      const key = s.area || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return [...map.entries()].sort();
  }, [items]);

  const bought = items.filter((s) => s.bought).length;
  const estTotal = items.reduce((sum, s) => sum + (s.estCost ?? 0), 0);
  const estLeft = items
    .filter((s) => !s.bought)
    .reduce((sum, s) => sum + (s.estCost ?? 0), 0);

  async function add() {
    if (!item.trim()) return;
    await create({
      item: item.trim(),
      area: area.trim() || "Other",
      estCost: cost ? Number(cost) : null,
    });
    setItem("");
    setCost("");
  }

  return (
    <div>
      <SectionTitle
        kicker="New-home essentials"
        right={
          <Button variant="soft" onClick={() => setAdding((v) => !v)}>
            <Plus size={15} /> Add item
          </Button>
        }
      >
        Shopping
      </SectionTitle>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            Bought
          </div>
          <div className="mt-1 font-serif text-2xl text-moss">
            {bought}/{items.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            Est. total
          </div>
          <div className="mt-1 font-serif text-2xl text-walnut">
            {estTotal ? fmtMoney(estTotal) : "—"}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            Still to buy
          </div>
          <div className="mt-1 font-serif text-2xl text-terracotta">
            {estLeft ? fmtMoney(estLeft) : "—"}
          </div>
        </Card>
      </div>

      {adding && (
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              autoFocus
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Item"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Bucket / area"
              className="w-40"
            />
            <Input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="$"
              className="w-20"
            />
            <Button onClick={add} disabled={!item.trim()}>
              Add
            </Button>
            <button
              onClick={() => setAdding(false)}
              className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut"
            >
              <X size={16} />
            </button>
          </div>
        </Card>
      )}

      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>No items yet.</EmptyState>
      ) : (
        <div className="space-y-6">
          {groups.map(([area, list]) => (
            <div key={area}>
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-dust">
                {area}
              </h3>
              <Card className="divide-y divide-walnut/8">
                {list.map((s) => (
                  <div
                    key={s.id}
                    className="group flex items-center gap-3 px-3 py-2.5 hover:bg-walnut/[0.03]"
                  >
                    <Checkbox
                      checked={s.bought}
                      onChange={() => update(s.id, { bought: !s.bought })}
                    />
                    <span
                      className={cx(
                        "flex-1 text-sm",
                        s.bought ? "text-dust line-through" : "text-walnut",
                      )}
                    >
                      {s.item}
                    </span>
                    {s.estCost != null && (
                      <span className="font-mono text-xs text-dust">
                        {fmtMoney(s.estCost)}
                      </span>
                    )}
                    <button
                      onClick={() => remove(s.id)}
                      className="cursor-pointer p-1 text-walnut/30 opacity-0 transition hover:text-terracotta group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
