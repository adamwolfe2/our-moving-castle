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
        "rounded-2xl border border-walnut/10 bg-white/70 shadow-[0_1px_0_rgba(43,36,28,0.04)] backdrop-blur-sm",
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
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-dust">
            {kicker}
          </div>
        )}
        <h2 className="font-serif text-2xl leading-tight text-walnut">{children}</h2>
      </div>
      {right}
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
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "solid" && "bg-walnut text-cream hover:bg-walnut-soft",
        variant === "soft" && "bg-walnut/8 text-walnut hover:bg-walnut/12",
        variant === "ghost" && "text-walnut/70 hover:bg-walnut/8 hover:text-walnut",
        variant === "danger" && "text-terracotta hover:bg-terracotta/10",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl border border-walnut/12 bg-white/80 px-3 py-2 text-sm text-walnut outline-none transition placeholder:text-dust focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/15",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full resize-y rounded-xl border border-walnut/12 bg-white/80 px-3 py-2 text-sm text-walnut outline-none transition placeholder:text-dust focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/15",
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "cursor-pointer rounded-xl border border-walnut/12 bg-white/80 px-2.5 py-2 text-sm text-walnut outline-none transition focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/15",
        props.className,
      )}
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
        "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition",
        checked
          ? "border-moss bg-moss text-cream"
          : "border-walnut/25 bg-white/60 text-transparent hover:border-moss/60",
        className,
      )}
    >
      <Check size={13} strokeWidth={3} />
    </button>
  );
}

export function Badge({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        className,
      )}
      style={
        color
          ? { backgroundColor: `${color}1f`, color: shade(color) }
          : undefined
      }
    >
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  );
}

function shade(hex: string) {
  // keep CSS-var colors as-is; darken raw hex a touch for contrast
  if (hex.startsWith("var(")) return hex;
  return hex;
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-walnut/8">
      <div
        className="h-full rounded-full bg-moss transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-walnut/15 px-4 py-8 text-center text-sm text-dust">
      {children}
    </div>
  );
}
