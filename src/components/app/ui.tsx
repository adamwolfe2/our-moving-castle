"use client";
import clsx from "clsx";
import { Check } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const cx = clsx;

/* ---------------------------------------------------------------
   Shared table classes — every /app table should converge on these.
   Numerics: add "text-right tabular-nums" on the cell.
   --------------------------------------------------------------- */
export const TH =
  "px-3 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3";
export const TD = "px-3 py-2 text-[13px] text-ink";
export const TR = "border-t border-line transition-colors hover:bg-canvas";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-[10px] border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  kicker,
  right,
}: {
  children: ReactNode;
  kicker?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {kicker && (
          <div className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-3">
            {kicker}
          </div>
        )}
        <h2 className="text-[15px] font-semibold leading-6 tracking-[-0.01em] text-ink">
          {children}
        </h2>
      </div>
      {right}
    </div>
  );
}

/* Stat tile for dashboard/list-header strips: label + big number + delta. */
export function Stat({
  label,
  value,
  sub,
  tone,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "ok" | "warn" | "bad" | "info";
  className?: string;
}) {
  return (
    <div className={cx("min-w-0 px-4 py-3", className)}>
      <div className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-ink-3">
        {label}
      </div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums tracking-[-0.01em] text-ink">
        {value}
      </div>
      {sub && (
        <div
          className={cx(
            "mt-0.5 truncate text-[11px]",
            tone === "ok" && "text-ok",
            tone === "warn" && "text-warn",
            tone === "bad" && "text-bad",
            tone === "info" && "text-info",
            !tone && "text-ink-3",
          )}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function Button({
  variant = "solid",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "soft" | "danger";
}) {
  return (
    <button
      className={cx(
        "inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid" &&
          "bg-ink text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] hover:bg-walnut-soft",
        variant === "soft" &&
          "border border-line bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-canvas",
        variant === "ghost" && "text-ink-2 hover:bg-cream-deep hover:text-ink",
        variant === "danger" && "text-bad hover:bg-bad/8",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

const fieldCls =
  "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-line-strong focus:ring-2 focus:ring-ink/8";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx("w-full", fieldCls, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx("w-full resize-y", fieldCls, props.className)}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx("cursor-pointer", fieldCls, "px-2.5", props.className)}
    />
  );
}

export function Checkbox({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onChange}
      className={cx(
        "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border transition",
        checked
          ? "border-ink bg-ink text-white"
          : "border-line-strong bg-surface text-transparent hover:border-ink-3",
        className,
      )}
    >
      <Check size={13} strokeWidth={3} />
    </button>
  );
}

/* ---------------------------------------------------------------
   Badge — status chips.
   Preferred: tone="green|amber|red|blue|gray".
   Back-compat: color=<hex|css-var> renders a neutral chip with a
   colored dot (no colored washes) so legacy call sites still look
   professional until they migrate.
   --------------------------------------------------------------- */
export type BadgeTone = "green" | "amber" | "red" | "blue" | "gray";

const TONE_CLS: Record<BadgeTone, string> = {
  green: "border-ok/25 bg-ok/8 text-[#15803D]",
  amber: "border-warn/30 bg-warn/8 text-[#B45309]",
  red: "border-bad/25 bg-bad/8 text-[#B91C1C]",
  blue: "border-info/25 bg-info/8 text-[#1D4ED8]",
  gray: "border-line bg-canvas text-ink-2",
};

const TONE_DOT: Record<BadgeTone, string> = {
  green: "bg-ok",
  amber: "bg-warn",
  red: "bg-bad",
  blue: "bg-info",
  gray: "bg-ink-3",
};

export function Badge({
  children,
  tone,
  color,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  color?: string;
  className?: string;
}) {
  const toneCls = tone ? TONE_CLS[tone] : color ? TONE_CLS.gray : TONE_CLS.gray;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-[3px] text-[11px] font-medium leading-none",
        toneCls,
        className,
      )}
    >
      {tone && <span className={cx("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} />}
      {!tone && color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-deep">
      <div
        className="h-full rounded-full bg-ink transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-[13px] text-ink-3">
      {children}
    </div>
  );
}
