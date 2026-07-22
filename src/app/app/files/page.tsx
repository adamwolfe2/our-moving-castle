"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import {
  DOC_CATEGORIES,
  type DocCategory,
  type DocumentItem,
} from "@/lib/constants";
import {
  Button,
  Card,
  EmptyState,
  Select,
  SectionTitle,
  cx,
} from "@/components/app/ui";

const CAT_LABEL: Record<DocCategory, string> = {
  inspection: "Inspection reports",
  closing: "Closing & contract",
  insurance: "Insurance",
  utilities: "Utilities",
  estimates: "Estimates & bids",
  receipts: "Receipts & invoices",
  other: "Other",
};

function fmtSize(b: number | null) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function FilesPage() {
  const { items, loading, create, update, remove } =
    useCollection<DocumentItem>("/api/documents");
  const [category, setCategory] = useState<DocCategory>("inspection");
  const [uploading, setUploading] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setErr(null);
    for (const file of Array.from(files)) {
      setUploading((u) => [...u, file.name]);
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/documents/upload",
        });
        await create({
          name: file.name,
          category,
          url: blob.url,
          pathname: blob.pathname,
          size: file.size,
          contentType: file.type || null,
        });
      } catch (e) {
        setErr(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      } finally {
        setUploading((u) => u.filter((n) => n !== file.name));
      }
    }
  }

  const groups = DOC_CATEGORIES.map((c) => ({
    cat: c,
    items: items.filter((d) => d.category === c),
  })).filter((g) => g.items.length);

  const totalSize = items.reduce((s, d) => s + (d.size ?? 0), 0);

  return (
    <div>
      <SectionTitle kicker="Inspection reports, closing docs, receipts — one place">
        Files
      </SectionTitle>
      <p className="mb-5 max-w-xl text-sm text-ink-3">
        Upload PDFs, scans, and photos. Stored privately in cloud, viewable from both
        your phones. {items.length} file{items.length === 1 ? "" : "s"} ·{" "}
        {fmtSize(totalSize) || "0 B"}.
      </p>

      {/* Upload zone */}
      <div
        className={cx(
          "mb-6 rounded-[10px] border-2 border-dashed p-6 transition",
          drag ? "border-ink/40 bg-canvas" : "border-line bg-surface",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <Upload size={24} className="text-ink-3" />
          <div className="text-sm text-ink">
            Drag files here, or
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-ink-3">Save into:</span>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocCategory)}
            >
              {DOC_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CAT_LABEL[c]}
                </option>
              ))}
            </Select>
            <Button onClick={() => inputRef.current?.click()}>
              <Upload size={15} /> Choose files
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {uploading.length > 0 && (
          <div className="mt-4 space-y-1">
            {uploading.map((n) => (
              <div
                key={n}
                className="flex items-center gap-2 text-xs text-ink-2"
              >
                <Loader2 size={13} className="animate-spin" /> Uploading {n}…
              </div>
            ))}
          </div>
        )}
        {err && <p className="mt-3 text-center text-sm text-bad">{err}</p>}
      </div>

      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>No files yet — upload your inspection reports to start.</EmptyState>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.cat}>
              <h3 className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3">
                {CAT_LABEL[g.cat]} · {g.items.length}
              </h3>
              <Card className="divide-y divide-line">
                {g.items.map((d) => (
                  <DocRow
                    key={d.id}
                    doc={d}
                    onMove={(c) => update(d.id, { category: c })}
                    onDelete={() => remove(d.id)}
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

function DocRow({
  doc,
  onMove,
  onDelete,
}: {
  doc: DocumentItem;
  onMove: (c: DocCategory) => void;
  onDelete: () => void;
}) {
  const isImg = (doc.contentType ?? "").startsWith("image/");
  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 hover:bg-canvas">
      <div className="text-ink-3">
        {isImg ? <ImageIcon size={18} /> : <FileText size={18} />}
      </div>
      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1"
      >
        <div className="truncate text-[13px] text-ink hover:text-ink-2">
          {doc.name}
        </div>
        <div className="font-mono text-[10px] text-ink-3">{fmtSize(doc.size)}</div>
      </a>
      <Select
        value={doc.category}
        onChange={(e) => onMove(e.target.value as DocCategory)}
        className="text-xs opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
      >
        {DOC_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CAT_LABEL[c]}
          </option>
        ))}
      </Select>
      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        download
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink-3 hover:bg-canvas hover:text-ink md:h-8 md:w-8"
      >
        <Download size={15} />
      </a>
      <button
        onClick={onDelete}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-ink-3 opacity-100 transition hover:bg-bad/8 hover:text-bad md:h-8 md:w-8 md:opacity-0 md:group-hover:opacity-100"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
