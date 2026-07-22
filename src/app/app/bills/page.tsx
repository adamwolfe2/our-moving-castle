"use client";
// Home OS — Bills & housing costs. Accounts spreadsheet (autopay state, est
// cost, due day) + actual-bill ledger so real costs replace estimates over time.
import { Fragment, useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  Pencil,
  Plus,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import {
  BILLING_CYCLES,
  SERVICE_TYPES,
  type BillingCycle,
  type HomeAccount,
  type HomeBill,
  type ServiceType,
} from "@/lib/constants";
import { fmtMoney, fmtDateShort, todayISO } from "@/lib/format";
import {
  Badge,
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

const SERVICE_COLOR: Record<string, string> = {
  gas: "#C26B4A",
  electric: "#C8A96E",
  water: "#5B8AA6",
  internet: "#7E9B8A",
  garbage: "#8A8577",
  insurance: "#9A6A4F",
  tax: "#6B7A5A",
  other: "#A89685",
};

export default function BillsPage() {
  const accountsApi = useCollection<HomeAccount>("/api/home-accounts");
  const billsApi = useCollection<HomeBill>("/api/home-bills");
  const [addingAccount, setAddingAccount] = useState(false);
  const [addingBill, setAddingBill] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const accounts = accountsApi.items;
  const bills = billsApi.items;

  const stats = useMemo(() => {
    const estTotal = accounts.reduce((s, a) => s + (a.estMonthly ?? 0), 0);
    const onAutopay = accounts.filter((a) => a.autopay).length;
    const pending = bills.filter((b) => b.status === "pending");
    const pendingTotal = pending.reduce((s, b) => s + b.amount, 0);
    // last full month actuals
    const byPeriod = new Map<string, number>();
    for (const b of bills) byPeriod.set(b.period, (byPeriod.get(b.period) ?? 0) + b.amount);
    const periods = Array.from(byPeriod.keys()).sort().reverse();
    const lastPeriod = periods[0] ?? null;
    return {
      estTotal,
      onAutopay,
      accountCount: accounts.length,
      pendingCount: pending.length,
      pendingTotal,
      lastPeriod,
      lastPeriodTotal: lastPeriod ? byPeriod.get(lastPeriod)! : null,
    };
  }, [accounts, bills]);

  const accountName = (id: number | null) =>
    accounts.find((a) => a.id === id)?.provider ?? "—";

  const notEnrolled = accounts.filter((a) => !a.autopay);

  return (
    <div>
      <SectionTitle
        kicker="Home OS · utilities, insurance & tax"
        right={
          <div className="flex gap-2">
            <Button variant="soft" onClick={() => setAddingBill((v) => !v)}>
              <Plus size={15} /> Log bill
            </Button>
            <Button variant="soft" onClick={() => setAddingAccount((v) => !v)}>
              <Plus size={15} /> Account
            </Button>
          </div>
        }
      >
        Bills
      </SectionTitle>

      {/* Stat strip */}
      <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line shadow-[0_1px_2px_rgba(0,0,0,0.03)] md:grid-cols-4">
        <Stat className="bg-surface" label="Est. monthly" value={fmtMoney(stats.estTotal)} />
        <Stat
          className="bg-surface"
          label="On autopay"
          value={`${stats.onAutopay}/${stats.accountCount}`}
          tone={stats.onAutopay === stats.accountCount ? "ok" : "bad"}
          sub={stats.onAutopay === stats.accountCount ? "all enrolled" : "action needed"}
        />
        <Stat
          className="bg-surface"
          label="Pending bills"
          value={stats.pendingCount ? fmtMoney(stats.pendingTotal) : "—"}
          tone={stats.pendingCount ? "warn" : undefined}
        />
        <Stat
          className="bg-surface"
          label={stats.lastPeriod ? `Actuals ${stats.lastPeriod}` : "Actuals"}
          value={stats.lastPeriodTotal != null ? fmtMoney(stats.lastPeriodTotal) : "—"}
        />
      </div>

      {/* Autopay nag */}
      {notEnrolled.length > 0 && (
        <Card className="mb-5 flex items-start gap-3 border-bad/25 bg-bad/6 p-4">
          <CircleAlert size={18} className="mt-0.5 shrink-0 text-bad" />
          <div className="text-sm text-ink-2">
            <span className="font-semibold text-ink">Autopay not enrolled:</span>{" "}
            {notEnrolled.map((a) => a.provider).join(", ")}. Enroll in each portal,
            then flip the toggle here. Account numbers stay in the vault — never in this app.
          </div>
        </Card>
      )}

      {addingAccount && (
        <AccountEditor
          onCancel={() => setAddingAccount(false)}
          onSave={async (d) => {
            await accountsApi.create(d);
            setAddingAccount(false);
          }}
        />
      )}

      {/* Accounts spreadsheet */}
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3">
        Accounts
      </h3>
      {accountsApi.loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : (
        <>
        {/* Mobile account cards */}
        <div className="mb-8 space-y-2 md:hidden">
          {accounts.map((a) =>
            editingId === a.id ? (
              <AccountEditor
                key={a.id}
                account={a}
                onCancel={() => setEditingId(null)}
                onSave={async (d) => {
                  await accountsApi.update(a.id, d);
                  setEditingId(null);
                }}
              />
            ) : (
              <Card key={a.id} className="p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink">{a.provider}</div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Badge color={SERVICE_COLOR[a.service]}>{a.service}</Badge>
                      <span className="font-mono text-[10px] text-ink-3">
                        {a.billingCycle}
                        {a.dueDay ? ` · ${a.dueDay}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-mono text-base text-ink tabular-nums">
                      {a.estMonthly != null ? fmtMoney(a.estMonthly) : "—"}
                    </span>
                    <button
                      onClick={() => accountsApi.update(a.id, { autopay: !a.autopay })}
                      className={cx(
                        "min-h-8 cursor-pointer rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition",
                        a.autopay
                          ? "bg-ok/15 text-ok"
                          : "bg-bad/12 text-bad",
                      )}
                    >
                      {a.autopay ? "autopay ✓" : "no autopay"}
                    </button>
                  </div>
                </div>
                {a.notes && (
                  <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-ink-3">{a.notes}</p>
                )}
                <div className="mt-1 flex justify-end">
                  <button
                    onClick={() => setEditingId(a.id)}
                    className="cursor-pointer p-2 text-ink-3 active:text-ink"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => accountsApi.remove(a.id)}
                    className="cursor-pointer p-2 text-ink-3 active:text-bad"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ),
          )}
        </div>

        <Card className="mb-8 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-canvas">
                <Th>Provider</Th>
                <Th>Service</Th>
                <Th>Cycle</Th>
                <Th>Autopay</Th>
                <Th className="text-right">Est $/mo</Th>
                <Th>Due</Th>
                <Th>Notes</Th>
                <Th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) =>
                editingId === a.id ? (
                  <tr key={a.id} className="border-t border-line">
                    <td colSpan={8} className="p-0">
                      <AccountEditor
                        account={a}
                        onCancel={() => setEditingId(null)}
                        onSave={async (d) => {
                          await accountsApi.update(a.id, d);
                          setEditingId(null);
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={a.id} className={cx(TR, "group")}>
                    <td className={TD}>{a.provider}</td>
                    <td className={TD}>
                      <Badge color={SERVICE_COLOR[a.service]}>{a.service}</Badge>
                    </td>
                    <td className={cx(TD, "font-mono text-[11px] text-ink-2")}>{a.billingCycle}</td>
                    <td className={TD}>
                      <button
                        onClick={() => accountsApi.update(a.id, { autopay: !a.autopay })}
                        className={cx(
                          "cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition",
                          a.autopay
                            ? "bg-ok/15 text-ok"
                            : "bg-bad/12 text-bad hover:bg-bad/20",
                        )}
                      >
                        {a.autopay ? "enrolled" : "not set"}
                      </button>
                    </td>
                    <td className={cx(TD, "text-right font-mono tabular-nums")}>
                      {a.estMonthly != null ? fmtMoney(a.estMonthly) : "—"}
                    </td>
                    <td className={cx(TD, "font-mono text-[11px] text-ink-2")}>{a.dueDay ?? "—"}</td>
                    <td className={cx(TD, "max-w-[200px] truncate text-ink-3")} title={a.notes ?? ""}>
                      {a.notes}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end opacity-0 transition group-hover:opacity-100">
                        <button onClick={() => setEditingId(a.id)} className="cursor-pointer p-1 text-ink-3 hover:text-ink">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => accountsApi.remove(a.id)} className="cursor-pointer p-1 text-ink-3 hover:text-bad">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </Card>
        </>
      )}

      {addingBill && (
        <BillEditor
          accounts={accounts}
          onCancel={() => setAddingBill(false)}
          onSave={async (d) => {
            await billsApi.create(d);
            setAddingBill(false);
          }}
        />
      )}

      {/* Bill ledger */}
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3">
        Bill ledger · actuals
      </h3>
      {billsApi.loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : bills.length === 0 ? (
        <EmptyState>
          <Zap size={16} className="mx-auto mb-1" />
          No bills logged yet. Log each real bill as it lands — actuals replace
          estimates and the forecast sharpens.
        </EmptyState>
      ) : (
        <>
        {/* Mobile ledger rows */}
        <Card className="divide-y divide-line md:hidden">
          {bills.map((b) => (
            <div key={b.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-ink">{accountName(b.accountId)}</div>
                <div className="font-mono text-[10px] text-ink-3">
                  {b.period}
                  {b.dueDate ? ` · due ${fmtDateShort(b.dueDate)}` : ""}
                </div>
              </div>
              <span className="font-mono text-sm text-ink tabular-nums">{fmtMoney(b.amount)}</span>
              <button
                onClick={() =>
                  billsApi.update(b.id, { status: b.status === "paid" ? "pending" : "paid" })
                }
                className={cx(
                  "min-h-8 shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
                  b.status === "paid" ? "bg-ok/15 text-ok" : "bg-warn/15 text-warn",
                )}
              >
                {b.status}
              </button>
            </div>
          ))}
        </Card>

        <Card className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-canvas">
                <Th>Period</Th>
                <Th>Account</Th>
                <Th className="text-right">Amount</Th>
                <Th>Due</Th>
                <Th>Status</Th>
                <Th>Notes</Th>
                <Th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className={cx(TR, "group")}>
                  <td className={cx(TD, "font-mono text-[11px] text-ink-2")}>{b.period}</td>
                  <td className={TD}>{accountName(b.accountId)}</td>
                  <td className={cx(TD, "text-right font-mono tabular-nums")}>{fmtMoney(b.amount)}</td>
                  <td className={cx(TD, "font-mono text-[11px] text-ink-3")}>
                    {b.dueDate ? fmtDateShort(b.dueDate) : "—"}
                  </td>
                  <td className={TD}>
                    <button
                      onClick={() =>
                        billsApi.update(b.id, { status: b.status === "paid" ? "pending" : "paid" })
                      }
                      className={cx(
                        "cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition",
                        b.status === "paid"
                          ? "bg-ok/15 text-ok"
                          : "bg-warn/15 text-warn hover:bg-warn/25",
                      )}
                    >
                      {b.status}
                    </button>
                  </td>
                  <td className={cx(TD, "max-w-[180px] truncate text-ink-3")}>{b.notes}</td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => billsApi.remove(b.id)}
                      className="cursor-pointer p-1 text-ink-3 opacity-0 transition hover:text-bad group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
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
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <th className={cx(TH, className)}>{children}</th>;
}

function AccountEditor({
  account,
  onSave,
  onCancel,
}: {
  account?: HomeAccount;
  onSave: (d: Partial<HomeAccount>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [provider, setProvider] = useState(account?.provider ?? "");
  const [service, setService] = useState<ServiceType>(account?.service ?? "other");
  const [cycle, setCycle] = useState<BillingCycle>(account?.billingCycle ?? "monthly");
  const [autopay, setAutopay] = useState(account?.autopay ?? false);
  const [dueDay, setDueDay] = useState(account?.dueDay ?? "");
  const [estMonthly, setEstMonthly] = useState(
    account?.estMonthly != null ? String(account.estMonthly) : "",
  );
  const [notes, setNotes] = useState(account?.notes ?? "");

  return (
    <div className="space-y-2.5 rounded-lg border border-line bg-canvas p-4">
      <div className="flex items-center gap-2">
        <Input autoFocus value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <button onClick={onCancel} className="cursor-pointer p-1.5 text-ink-3 hover:text-ink">
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={service} onChange={(e) => setService(e.target.value as ServiceType)}>
          {SERVICE_TYPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Select value={cycle} onChange={(e) => setCycle(e.target.value as BillingCycle)}>
          {BILLING_CYCLES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Input type="number" value={estMonthly} onChange={(e) => setEstMonthly(e.target.value)} placeholder="Est $/mo" className="w-28" />
        <Input value={dueDay} onChange={(e) => setDueDay(e.target.value)} placeholder="Due (e.g. ~15th, Nov 15)" className="w-44" />
        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-2">
          <input type="checkbox" checked={autopay} onChange={(e) => setAutopay(e.target.checked)} />
          Autopay
        </label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="min-w-48 flex-1" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!provider.trim()}
          onClick={() =>
            onSave({
              provider: provider.trim(),
              service,
              billingCycle: cycle,
              autopay,
              dueDay: dueDay.trim() || null,
              estMonthly: estMonthly ? Number(estMonthly) : null,
              notes: notes.trim() || null,
            })
          }
        >
          {account ? "Save" : "Add"}
        </Button>
      </div>
    </div>
  );
}

function BillEditor({
  accounts,
  onSave,
  onCancel,
}: {
  accounts: HomeAccount[];
  onSave: (d: Partial<HomeBill>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? 0);
  const [period, setPeriod] = useState(todayISO().slice(0, 7));
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <div className="mb-4 space-y-2.5 rounded-lg border border-line bg-canvas p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(accountId)} onChange={(e) => setAccountId(Number(e.target.value))}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.provider}</option>
          ))}
        </Select>
        <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="YYYY-MM" className="w-28" />
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$ amount" className="w-28" />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-auto" />
        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-2">
          <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          Paid
        </label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="min-w-40 flex-1" />
        <button onClick={onCancel} className="cursor-pointer p-1.5 text-ink-3 hover:text-ink">
          <X size={16} />
        </button>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          disabled={!amount || !/^\d{4}-\d{2}$/.test(period)}
          onClick={() =>
            onSave({
              accountId: accountId || null,
              period,
              amount: Number(amount),
              dueDate: dueDate || null,
              status: paid ? "paid" : "pending",
              notes: notes.trim() || null,
            })
          }
        >
          <Check size={14} /> Log bill
        </Button>
      </div>
    </div>
  );
}
