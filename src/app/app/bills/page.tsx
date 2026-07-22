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
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">Est. monthly</div>
          <div className="mt-0.5 font-serif text-2xl text-walnut">{fmtMoney(stats.estTotal)}</div>
        </Card>
        <Card className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">On autopay</div>
          <div className={cx("mt-0.5 font-serif text-2xl", stats.onAutopay === stats.accountCount ? "text-moss" : "text-terracotta")}>
            {stats.onAutopay}/{stats.accountCount}
          </div>
        </Card>
        <Card className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">Pending bills</div>
          <div className="mt-0.5 font-serif text-2xl text-gold">
            {stats.pendingCount ? fmtMoney(stats.pendingTotal) : "—"}
          </div>
        </Card>
        <Card className="p-3.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            {stats.lastPeriod ? `Actuals ${stats.lastPeriod}` : "Actuals"}
          </div>
          <div className="mt-0.5 font-serif text-2xl text-walnut">
            {stats.lastPeriodTotal != null ? fmtMoney(stats.lastPeriodTotal) : "—"}
          </div>
        </Card>
      </div>

      {/* Autopay nag */}
      {notEnrolled.length > 0 && (
        <Card className="mb-5 flex items-start gap-3 border-terracotta/25 bg-terracotta/6 p-4">
          <CircleAlert size={18} className="mt-0.5 shrink-0 text-terracotta" />
          <div className="text-sm text-walnut/80">
            <span className="font-semibold text-walnut">Autopay not enrolled:</span>{" "}
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
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-dust">
        Accounts
      </h3>
      {accountsApi.loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : (
        <Card className="mb-8 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-walnut/10 bg-linen/80">
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
            <tbody className="divide-y divide-walnut/6">
              {accounts.map((a) =>
                editingId === a.id ? (
                  <tr key={a.id}>
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
                  <tr key={a.id} className="group text-sm hover:bg-walnut/[0.03]">
                    <td className="py-2.5 pl-3 pr-2 text-walnut">{a.provider}</td>
                    <td className="py-2.5 pr-2">
                      <Badge color={SERVICE_COLOR[a.service]}>{a.service}</Badge>
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-[11px] text-walnut/60">{a.billingCycle}</td>
                    <td className="py-2.5 pr-2">
                      <button
                        onClick={() => accountsApi.update(a.id, { autopay: !a.autopay })}
                        className={cx(
                          "cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition",
                          a.autopay
                            ? "bg-moss/15 text-moss"
                            : "bg-terracotta/12 text-terracotta hover:bg-terracotta/20",
                        )}
                      >
                        {a.autopay ? "enrolled" : "not set"}
                      </button>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-mono text-sm text-walnut">
                      {a.estMonthly != null ? fmtMoney(a.estMonthly) : "—"}
                    </td>
                    <td className="py-2.5 pr-2 font-mono text-[11px] text-walnut/60">{a.dueDay ?? "—"}</td>
                    <td className="max-w-[200px] truncate py-2.5 pr-2 text-[11px] text-walnut/50" title={a.notes ?? ""}>
                      {a.notes}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex justify-end opacity-0 transition group-hover:opacity-100">
                        <button onClick={() => setEditingId(a.id)} className="cursor-pointer p-1 text-walnut/40 hover:text-walnut">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => accountsApi.remove(a.id)} className="cursor-pointer p-1 text-walnut/40 hover:text-terracotta">
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
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-dust">
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
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-walnut/10 bg-linen/80">
                <Th>Period</Th>
                <Th>Account</Th>
                <Th className="text-right">Amount</Th>
                <Th>Due</Th>
                <Th>Status</Th>
                <Th>Notes</Th>
                <Th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-walnut/6">
              {bills.map((b) => (
                <tr key={b.id} className="group text-sm hover:bg-walnut/[0.03]">
                  <td className="py-2 pl-3 pr-2 font-mono text-[11px] text-walnut/70">{b.period}</td>
                  <td className="py-2 pr-2 text-walnut">{accountName(b.accountId)}</td>
                  <td className="py-2 pr-2 text-right font-mono text-sm text-walnut">{fmtMoney(b.amount)}</td>
                  <td className="py-2 pr-2 font-mono text-[11px] text-walnut/50">
                    {b.dueDate ? fmtDateShort(b.dueDate) : "—"}
                  </td>
                  <td className="py-2 pr-2">
                    <button
                      onClick={() =>
                        billsApi.update(b.id, { status: b.status === "paid" ? "pending" : "paid" })
                      }
                      className={cx(
                        "cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition",
                        b.status === "paid"
                          ? "bg-moss/15 text-moss"
                          : "bg-gold/15 text-gold hover:bg-gold/25",
                      )}
                    >
                      {b.status}
                    </button>
                  </td>
                  <td className="max-w-[180px] truncate py-2 pr-2 text-[11px] text-walnut/50">{b.notes}</td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => billsApi.remove(b.id)}
                      className="cursor-pointer p-1 text-walnut/30 opacity-0 transition hover:text-terracotta group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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
  return (
    <th
      className={cx(
        "py-2 pl-3 pr-2 font-mono text-[10px] font-medium uppercase tracking-wider text-dust",
        className,
      )}
    >
      {children}
    </th>
  );
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
    <div className="space-y-2.5 rounded-2xl bg-linen/40 p-4">
      <div className="flex items-center gap-2">
        <Input autoFocus value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" />
        <button onClick={onCancel} className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut">
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
        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-walnut/70">
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
    <div className="mb-4 space-y-2.5 rounded-2xl bg-linen/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(accountId)} onChange={(e) => setAccountId(Number(e.target.value))}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.provider}</option>
          ))}
        </Select>
        <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="YYYY-MM" className="w-28" />
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="$ amount" className="w-28" />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-auto" />
        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-walnut/70">
          <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          Paid
        </label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="min-w-40 flex-1" />
        <button onClick={onCancel} className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut">
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
