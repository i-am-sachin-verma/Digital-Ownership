import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Variant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type Size = "sm" | "md" | "lg";

export interface SwapRoutePreviewProps {
  className?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
}

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatCompact(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function shortAddress(address?: string) {
  if (!address) return "0x0000…0000";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEscape]);
}

function useOutsideClick<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);

  return ref;
}

function SectionHeader({ title, description }: Pick<SwapRoutePreviewProps, "title" | "description">) {
  return (
    <header className="space-y-1">
      <h2 className="text-base font-semibold tracking-tight">{title ?? "Swap Route Preview"}</h2>
      {description ? <p className="text-sm text-slate-500">{description}</p> : null}
    </header>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-full border bg-white px-3 py-1 text-xs shadow-sm">
      <span className="text-slate-500">{label}:</span>{" "}
      <strong className="font-semibold">{value}</strong>
    </div>
  );
}

function ButtonRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function variantClass(variant: Variant) {
  switch (variant) {
    case "primary":
      return "border-blue-200 bg-blue-50 text-blue-900";
    case "secondary":
      return "border-slate-300 bg-slate-50 text-slate-900";
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "danger":
      return "border-red-200 bg-red-50 text-red-900";
    default:
      return "border-slate-200 bg-white text-slate-900";
  }
}

function sizeClass(size: Size) {
  switch (size) {
    case "sm":
      return "text-sm";
    case "lg":
      return "text-lg";
    default:
      return "text-base";
  }
}

function CardShell({
  className,
  children,
  variant = "default",
  size = "md",
  disabled = false,
}: {
  className?: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
}) {
  return (
    <section
      className={cx(
        "rounded-2xl border p-4 shadow-sm transition",
        variantClass(variant),
        sizeClass(size),
        disabled && "pointer-events-none opacity-60",
        className
      )}
      aria-disabled={disabled}
    >
      {children}
    </section>
  );
}


type DataItem = {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
};

const sampleItems: DataItem[] = [
  { id: "1", label: "Overview", value: "Ready", hint: "Connected to wallet" },
  { id: "2", label: "Status", value: "Synced", hint: "Latest block indexed" },
  { id: "3", label: "Mode", value: "Live", hint: "Mainnet session active" },
];

function SummaryRow({ label, value, hint, accent }: DataItem) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
      <div className="min-w-0">
        <strong className="block truncate">{label}</strong>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        {accent ? <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden="true" /> : null}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}

function ItemFilters({ items, query }: { items: DataItem[]; query: string }) {
  const filtered = items.filter((item) =>
    [item.label, item.value, item.hint, item.accent].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="space-y-2">
      {filtered.map((item) => (
        <SummaryRow key={item.id} {...item} />
      ))}
    </div>
  );
}

export interface SwapRoutePreviewProps extends SwapRoutePreviewProps {
  items?: DataItem[];
}

export default function SwapRoutePreview({
  title = "Swap Route Preview",
  description = "Reusable web3 frontend component.",
  items = sampleItems,
  className,
  variant = "default",
  size = "md",
}: SwapRoutePreviewProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? "");
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId]);

  useEffect(() => {
    if (!items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? "");
    }
  }, [items, selectedId]);

  return (
    <CardShell className={className} variant={variant} size={size}>
      <SectionHeader title={title} description={description} />
      <div className="mt-4 space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-medium text-slate-500">Filter</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Search items"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Selected</p>
            <p className="font-semibold">{selected?.label ?? "None"}</p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Count</p>
            <p className="font-semibold">{items.length}</p>
          </div>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={cx("w-full rounded-xl border px-3 py-2 text-left transition", selected?.id === item.id ? "border-blue-500 bg-blue-50" : "bg-white hover:bg-slate-50")}
            >
              <SummaryRow {...item} />
            </button>
          ))}
        </div>
        <div className="rounded-xl border bg-white p-3">
          <p className="text-xs font-medium text-slate-500">Filtered list</p>
          <div className="mt-3">
            <ItemFilters items={items} query={query} />
          </div>
        </div>
        <ButtonRow>
          <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">Primary Action</button>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm">Secondary Action</button>
        </ButtonRow>
      </div>
    </CardShell>
  );
}



export const SwapRoutePreviewVariants = ["default", "primary", "secondary", "success", "warning", "danger"] as const;
export const SwapRoutePreviewSizes = ["sm", "md", "lg"] as const;
export function SwapRoutePreviewIsInteractive(disabled?: boolean) { return !disabled; }
export function SwapRoutePreviewDisplayLabel(index: number) { return "SwapRoutePreview item " + String(index + 1); }
