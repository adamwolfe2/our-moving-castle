"use client";
import { useState } from "react";
import {
  ExternalLink,
  ImageOff,
  Link as LinkIcon,
  Loader2,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import {
  MARKETPLACE_STATUSES,
  type MarketplaceItem,
  type MarketplaceStatus,
} from "@/lib/constants";
import { fmtMoney } from "@/lib/format";
import {
  Badge,
  type BadgeTone,
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Textarea,
  SectionTitle,
  cx,
} from "@/components/app/ui";

const STATUS_TONE: Record<MarketplaceStatus, BadgeTone> = {
  wishlist: "gray",
  posted: "amber",
  found: "blue",
  contacted: "amber",
  bought: "green",
};

function hostOf(url: string | null) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function MarketplacePage() {
  const { items, loading, create, update, remove } =
    useCollection<MarketplaceItem>("/api/marketplace");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const wanted = items.filter((i) => i.status !== "bought");
  const targetTotal = wanted.reduce((s, i) => s + (i.targetPrice ?? 0), 0);
  const boughtTotal = items
    .filter((i) => i.status === "bought")
    .reduce((s, i) => s + (i.targetPrice ?? 0), 0);

  async function addLink() {
    const link = url.trim();
    if (!link) return;
    setBusy(true);
    setErr(null);
    let preview: { title?: string | null; image?: string | null; price?: number | null } = {};
    try {
      const res = await fetch("/api/marketplace/unfurl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      });
      if (res.ok) preview = await res.json();
    } catch {
      /* fall back to bare link */
    }
    const junkTitle = /^(error|facebook|log ?in.*|.*log ?in to facebook.*)$/i;
    const cleanTitle =
      preview.title && !junkTitle.test(preview.title.trim())
        ? preview.title.slice(0, 200)
        : null;
    try {
      await create({
        item: cleanTitle || `Marketplace find — ${hostOf(link)}`,
        url: link,
        imageUrl: preview.image || null,
        targetPrice: preview.price ?? null,
        status: "found",
        location: "Portland, OR (NE / Cadet)",
      });
      setUrl("");
    } catch {
      setErr("Couldn't save that link.");
    } finally {
      setBusy(false);
    }
  }

  async function addBlank() {
    await create({ item: "New item", status: "wishlist" });
  }

  return (
    <div>
      <SectionTitle kicker="Paste links to things you want — a scrapbook">
        Marketplace
      </SectionTitle>
      <p className="mb-5 max-w-xl text-sm text-ink-3">
        Paste a Facebook Marketplace listing link and it’s saved as a card with its
        photo and price. Target prices roll into the Budget live.
      </p>

      {/* Paste bar */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3">
            <LinkIcon size={15} className="text-ink-3" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a facebook.com/marketplace/item/… link"
              className="min-h-11 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-3 sm:min-h-0"
              onKeyDown={(e) => e.key === "Enter" && addLink()}
            />
          </div>
          <Button onClick={addLink} disabled={busy || !url.trim()}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Save link
          </Button>
        </div>
        {err && <p className="mt-2 text-sm text-bad">{err}</p>}
        <button
          onClick={addBlank}
          className="mt-2 flex min-h-11 cursor-pointer items-center text-xs text-ink-3 hover:text-ink sm:min-h-0"
        >
          or add a wishlist item without a link
        </button>
      </Card>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Saved / wanted
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.01em] text-ink">
            {wanted.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Target total
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.01em] text-bad">
            {fmtMoney(targetTotal)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
            Bought
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.01em] text-ok">
            {fmtMoney(boughtTotal)}
          </div>
        </Card>
      </div>

      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>Paste your first Marketplace link above.</EmptyState>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
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
  const [open, setOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const host = hostOf(m.url);

  return (
    <Card className={cx("group overflow-hidden", m.status === "bought" && "opacity-70")}>
      {/* Cover */}
      <a
        href={m.url || undefined}
        target="_blank"
        rel="noreferrer"
        className="relative block"
      >
        {m.imageUrl && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.imageUrl}
            alt={m.item}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-canvas text-ink-3">
            {m.url ? <Store size={28} /> : <ImageOff size={28} />}
          </div>
        )}
        <span className="absolute left-2 top-2">
          <Badge tone={STATUS_TONE[m.status]} className="bg-surface shadow-sm">
            {m.status}
          </Badge>
        </span>
      </a>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div
              className={cx(
                "text-sm font-medium leading-snug text-ink",
                m.status === "bought" && "line-through",
              )}
            >
              {m.item}
            </div>
            {m.targetPrice != null && (
              <div className="font-mono text-sm tabular-nums text-ink-2">
                {fmtMoney(m.targetPrice)}
              </div>
            )}
          </div>
          <button
            onClick={onDelete}
            className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center text-ink-3 opacity-100 transition hover:text-bad sm:min-h-0 sm:min-w-0 sm:p-1 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Select
            value={m.status}
            onChange={(e) =>
              onUpdate({ status: e.target.value as MarketplaceStatus })
            }
            className="text-xs"
          >
            {MARKETPLACE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          {m.url && (
            <a
              href={m.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-xs text-ink-2 hover:text-ink hover:underline sm:min-h-0"
            >
              <ExternalLink size={12} /> {host || "Open"}
            </a>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto flex min-h-11 cursor-pointer items-center text-xs text-ink-3 hover:text-ink sm:min-h-0"
          >
            {open ? "Done" : "Edit"}
          </button>
        </div>

        {open && (
          <div className="mt-3 space-y-2 border-t border-line pt-3">
            <Input
              defaultValue={m.item}
              placeholder="Title"
              onBlur={(e) => e.target.value !== m.item && onUpdate({ item: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                defaultValue={m.targetPrice != null ? String(m.targetPrice) : ""}
                placeholder="Price"
                className="w-28"
                onBlur={(e) => {
                  const v = e.target.value ? Number(e.target.value) : null;
                  if (v !== m.targetPrice) onUpdate({ targetPrice: v });
                }}
              />
              <Input
                defaultValue={m.url ?? ""}
                placeholder="Listing URL"
                onBlur={(e) =>
                  e.target.value !== (m.url ?? "") &&
                  onUpdate({ url: e.target.value || null })
                }
              />
            </div>
            <Input
              defaultValue={m.imageUrl ?? ""}
              placeholder="Image URL (optional)"
              onBlur={(e) => {
                if (e.target.value !== (m.imageUrl ?? "")) {
                  setImgFailed(false);
                  onUpdate({ imageUrl: e.target.value || null });
                }
              }}
            />
            <Textarea
              defaultValue={m.notes ?? ""}
              placeholder="Notes (seller, pickup, condition…)"
              rows={2}
              onBlur={(e) =>
                e.target.value !== (m.notes ?? "") &&
                onUpdate({ notes: e.target.value || null })
              }
            />
          </div>
        )}

        {!open && m.notes && (
          <p className="mt-2 text-xs leading-relaxed text-ink-3">{m.notes}</p>
        )}
      </div>
    </Card>
  );
}
