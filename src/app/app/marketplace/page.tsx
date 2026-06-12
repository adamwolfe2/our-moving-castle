"use client";
import { useState } from "react";
import {
  Check,
  ClipboardCopy,
  ExternalLink,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import {
  MARKETPLACE_STATUSES,
  type MarketplaceItem,
  type MarketplaceStatus,
} from "@/lib/constants";
import { fmtMoney } from "@/lib/format";
import {
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Textarea,
  SectionTitle,
  cx,
} from "@/components/app/ui";

const STATUS_COLOR: Record<MarketplaceStatus, string> = {
  wishlist: "#A89685",
  posted: "#C8A96E",
  found: "#5B8AA6",
  contacted: "#C26B4A",
  bought: "#6B7A5A",
};

const fbSearch = (q: string) =>
  `https://www.facebook.com/marketplace/search?query=${encodeURIComponent(q)}`;

const defaultIso = (item: string, price: number | null) =>
  `ISO: ${item} in good condition${price ? `, up to $${price}` : ""}. NE Portland / Cadet area — can pick up, cash ready. Moving in mid-June.`;

export default function MarketplacePage() {
  const { items, loading, create, update, remove } =
    useCollection<MarketplaceItem>("/api/marketplace");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const wanted = items.filter((i) => i.status !== "bought");
  const targetTotal = wanted.reduce((s, i) => s + (i.targetPrice ?? 0), 0);
  const boughtTotal = items
    .filter((i) => i.status === "bought")
    .reduce((s, i) => s + (i.targetPrice ?? 0), 0);

  async function add() {
    if (!name.trim()) return;
    const p = price ? Number(price) : null;
    await create({
      item: name.trim(),
      targetPrice: p,
      status: "wishlist",
      location: "Portland, OR (NE / Cadet)",
      isoPost: defaultIso(name.trim(), p),
    });
    setName("");
    setPrice("");
  }

  return (
    <div>
      <SectionTitle
        kicker="Source it secondhand — buy smart"
        right={
          <Button variant="soft" onClick={() => setAdding((v) => !v)}>
            <Plus size={15} /> Add item
          </Button>
        }
      >
        Marketplace
      </SectionTitle>
      <p className="mb-6 max-w-xl text-sm text-dust">
        Furniture and big items to find on Facebook Marketplace. Each has a ready
        “ISO” post to copy and a button to search Marketplace. Target prices feed the
        Budget live.
      </p>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            Still wanted
          </div>
          <div className="mt-1 font-serif text-2xl text-walnut">{wanted.length}</div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            Target total
          </div>
          <div className="mt-1 font-serif text-2xl text-terracotta">
            {fmtMoney(targetTotal)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] uppercase tracking-wider text-dust">
            Bought
          </div>
          <div className="mt-1 font-serif text-2xl text-moss">
            {fmtMoney(boughtTotal)}
          </div>
        </Card>
      </div>

      {adding && (
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What to buy (e.g. Couch)"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Target $"
              className="w-28"
            />
            <Button onClick={add} disabled={!name.trim()}>
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
        <EmptyState>No items yet — add the first thing you want to find.</EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((m) => (
            <MarketCard
              key={m.id}
              m={m}
              onUpdate={(d) => update(m.id, d)}
              onDelete={() => remove(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MarketCard({
  m,
  onUpdate,
  onDelete,
}: {
  m: MarketplaceItem;
  onUpdate: (d: Partial<MarketplaceItem>) => void;
  onDelete: () => void;
}) {
  const [iso, setIso] = useState(m.isoPost ?? defaultIso(m.item, m.targetPrice));
  const [url, setUrl] = useState(m.url ?? "");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(iso);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Card className={cx("group p-4", m.status === "bought" && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div
            className={cx(
              "font-serif text-lg text-walnut",
              m.status === "bought" && "line-through",
            )}
          >
            {m.item}
          </div>
          {m.targetPrice != null && (
            <div className="font-mono text-sm text-terracotta">
              up to {fmtMoney(m.targetPrice)}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="cursor-pointer p-1 text-walnut/30 opacity-0 transition hover:text-terracotta group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select
          value={m.status}
          onChange={(e) =>
            onUpdate({ status: e.target.value as MarketplaceStatus })
          }
          className="text-xs"
          style={{ color: STATUS_COLOR[m.status] }}
        >
          {MARKETPLACE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <a
          href={fbSearch(m.item)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-walnut/8 px-2.5 py-1.5 text-xs text-walnut transition hover:bg-walnut/12"
        >
          <Search size={13} /> Search Marketplace
        </a>
        <button
          onClick={copy}
          className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-walnut/8 px-2.5 py-1.5 text-xs text-walnut transition hover:bg-walnut/12"
        >
          {copied ? <Check size={13} /> : <ClipboardCopy size={13} />}
          {copied ? "Copied" : "Copy ISO"}
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer text-xs text-dust hover:text-walnut"
        >
          {open ? "Hide" : "Edit"}
        </button>
      </div>

      {m.url && !open && (
        <a
          href={m.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-terracotta hover:underline"
        >
          <ExternalLink size={12} /> View listing
        </a>
      )}

      {open && (
        <div className="mt-3 space-y-2 border-t border-walnut/8 pt-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => url !== (m.url ?? "") && onUpdate({ url: url || null })}
            placeholder="Paste listing URL"
          />
          <Textarea
            value={iso}
            onChange={(e) => setIso(e.target.value)}
            onBlur={() => iso !== m.isoPost && onUpdate({ isoPost: iso })}
            rows={3}
          />
          <Input
            defaultValue={m.targetPrice != null ? String(m.targetPrice) : ""}
            type="number"
            placeholder="Target price"
            onBlur={(e) => {
              const v = e.target.value ? Number(e.target.value) : null;
              if (v !== m.targetPrice) onUpdate({ targetPrice: v });
            }}
          />
        </div>
      )}
    </Card>
  );
}
