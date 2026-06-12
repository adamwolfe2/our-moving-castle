"use client";
import { useMemo, useState } from "react";
import { Check, Landmark, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import { PAYMENT_KINDS, type Payment, type PaymentKind } from "@/lib/constants";
import { MOVE } from "@/lib/move-data";
import { fmtMoney, relativeDay } from "@/lib/format";
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

const KIND_COLOR: Record<PaymentKind, string> = {
  paid: "#6B7A5A",
  due: "#C26B4A",
  upcoming: "#C8A96E",
  planned: "#A89685",
  monthly: "#5B8AA6",
};

export default function MoneyPage() {
  const { items, loading, create, update, remove } =
    useCollection<Payment>("/api/payments");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const oneTime = useMemo(
    () =>
      items
        .filter((p) => p.kind !== "monthly")
        .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999")),
    [items],
  );
  const monthly = useMemo(
    () => items.filter((p) => p.kind === "monthly"),
    [items],
  );

  const paid = oneTime
    .filter((p) => p.kind === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const remaining = oneTime
    .filter((p) => p.kind !== "paid")
    .reduce((s, p) => s + p.amount, 0);
  const monthlyTotal = monthly.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <SectionTitle
        kicker="Paid, due & monthly"
        right={
          <Button variant="soft" onClick={() => setAdding((v) => !v)}>
            <Plus size={15} /> Add payment
          </Button>
        }
      >
        Money
      </SectionTitle>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            Paid
          </div>
          <div className="mt-1 font-serif text-2xl text-moss">{fmtMoney(paid)}</div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            Still owed
          </div>
          <div className="mt-1 font-serif text-2xl text-terracotta">
            {fmtMoney(remaining)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            True monthly
          </div>
          <div className="mt-1 font-serif text-2xl text-walnut">
            {fmtMoney(MOVE.trueMonthlyCost)}
          </div>
        </Card>
      </div>

      {/* House Holding callout */}
      <Card className="mb-8 flex items-start gap-3 border-gold/30 bg-gold/8 p-5">
        <Landmark size={20} className="mt-0.5 shrink-0 text-gold" />
        <div className="text-sm text-walnut/80">
          <span className="font-semibold text-walnut">House Holding account.</span>{" "}
          Auto-transfer ~{fmtMoney(MOVE.houseHoldingMonthly)}/mo for tax + insurance
          accruals. Pay the annual lumps from it (tax ~{fmtMoney(MOVE.taxAnnualEst)} in
          Nov, insurance {fmtMoney(MOVE.insuranceAnnual)} in June). Checking only ever
          feels the ~$1,121/mo of real monthly cash. November stops being a cliff.
        </div>
      </Card>

      {adding && (
        <PaymentEditor
          onCancel={() => setAdding(false)}
          onSave={async (data) => {
            await create(data);
            setAdding(false);
          }}
        />
      )}

      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-dust">
        One-time
      </h3>
      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : (
        <Card className="mb-8 divide-y divide-walnut/8">
          {oneTime.map((p) =>
            editingId === p.id ? (
              <PaymentEditor
                key={p.id}
                payment={p}
                onCancel={() => setEditingId(null)}
                onSave={async (data) => {
                  await update(p.id, data);
                  setEditingId(null);
                }}
              />
            ) : (
              <div
                key={p.id}
                className="group flex items-center gap-3 px-4 py-3 hover:bg-walnut/[0.03]"
              >
                <button
                  onClick={() =>
                    update(p.id, { kind: p.kind === "paid" ? "due" : "paid" })
                  }
                  className={cx(
                    "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition",
                    p.kind === "paid"
                      ? "border-moss bg-moss text-cream"
                      : "border-walnut/25 text-transparent hover:border-moss/60",
                  )}
                >
                  <Check size={13} strokeWidth={3} />
                </button>
                <div className="min-w-0 flex-1">
                  <div
                    className={cx(
                      "text-sm",
                      p.kind === "paid" ? "text-dust" : "text-walnut",
                    )}
                  >
                    {p.label}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge color={KIND_COLOR[p.kind]}>{p.kind}</Badge>
                    {p.dueDate && (
                      <span className="font-mono text-[10px] text-dust">
                        {relativeDay(p.dueDate)}
                      </span>
                    )}
                    {p.notes && (
                      <span className="truncate text-[11px] text-walnut/50">
                        {p.notes}
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-mono text-sm text-walnut">
                  {fmtMoney(p.amount)}
                </div>
                <div className="flex opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => setEditingId(p.id)}
                    className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="cursor-pointer p-1.5 text-walnut/40 hover:text-terracotta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ),
          )}
        </Card>
      )}

      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-dust">
          Monthly true cost of ownership
        </h3>
        <span className="font-mono text-sm text-walnut">
          {fmtMoney(monthlyTotal)}/mo
        </span>
      </div>
      <Card className="divide-y divide-walnut/8">
        {monthly.map((p) => (
          <div
            key={p.id}
            className="group flex items-center gap-3 px-4 py-2.5 hover:bg-walnut/[0.03]"
          >
            <div className="min-w-0 flex-1">
              <span className="text-sm text-walnut">{p.label}</span>
              {p.notes && (
                <span className="ml-2 text-[11px] text-dust">{p.notes}</span>
              )}
            </div>
            <span className="font-mono text-sm text-walnut">
              {fmtMoney(p.amount)}
            </span>
            <button
              onClick={() => remove(p.id)}
              className="cursor-pointer p-1 text-walnut/30 opacity-0 transition hover:text-terracotta group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

function PaymentEditor({
  payment,
  onSave,
  onCancel,
}: {
  payment?: Payment;
  onSave: (data: Partial<Payment>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(payment?.label ?? "");
  const [amount, setAmount] = useState(payment ? String(payment.amount) : "");
  const [kind, setKind] = useState<PaymentKind>(payment?.kind ?? "upcoming");
  const [dueDate, setDueDate] = useState(payment?.dueDate ?? "");
  const [notes, setNotes] = useState(payment?.notes ?? "");

  async function save() {
    if (!label.trim()) return;
    await onSave({
      label: label.trim(),
      amount: amount ? Number(amount) : 0,
      kind,
      dueDate: dueDate || null,
      notes: notes.trim() || null,
    });
  }

  return (
    <div className="mb-6 space-y-2.5 rounded-2xl bg-linen/40 p-4">
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="What is it?"
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
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="$ amount"
          className="w-32"
        />
        <Select value={kind} onChange={(e) => setKind(e.target.value as PaymentKind)}>
          {PAYMENT_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
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
        <Button onClick={save} disabled={!label.trim()}>
          {payment ? "Save" : "Add"}
        </Button>
      </div>
    </div>
  );
}
