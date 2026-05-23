import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Variant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type Size = "sm" | "md" | "lg";

export interface ChainSwitcherProps {
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

function SectionHeader({ title, description }: Pick<ChainSwitcherProps, "title" | "description">) {
  return (
    <header className="space-y-1">
      <h2 className="text-base font-semibold tracking-tight">{title ?? "Chain Switcher"}</h2>
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


type Chain = { id: number; name: string; rpcHealthy: boolean };

const chains: Chain[] = [
  { id: 1, name: "Ethereum", rpcHealthy: true },
  { id: 137, name: "Polygon", rpcHealthy: true },
  { id: 8453, name: "Base", rpcHealthy: false },
  { id: 42161, name: "Arbitrum", rpcHealthy: true },
];

export interface ChainSwitcherProps extends ChainSwitcherProps {
  selectedChainId?: number;
  onSelect?: (id: number) => void;
}

export default function ChainSwitcher({
  selectedChainId = 1,
  onSelect,
  className,
  title = "Switch Network",
}: ChainSwitcherProps) {
  const [selected, setSelected] = useState(selectedChainId);

  useEffect(() => setSelected(selectedChainId), [selectedChainId]);

  const choose = useCallback((id: number) => {
    setSelected(id);
    onSelect?.(id);
  }, [onSelect]);

  return (
    <CardShell className={className}>
      <SectionHeader title={title} description="Choose the chain you want to interact with." />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {chains.map((chain) => (
          <button
            key={chain.id}
            type="button"
            onClick={() => choose(chain.id)}
            className={cx(
              "rounded-xl border px-3 py-3 text-left text-sm transition",
              selected === chain.id ? "border-blue-500 bg-blue-50" : "bg-white hover:bg-slate-50"
            )}
          >
            <div className="flex items-center justify-between">
              <strong>{chain.name}</strong>
              <span className={cx("h-2.5 w-2.5 rounded-full", chain.rpcHealthy ? "bg-emerald-500" : "bg-amber-500")} />
            </div>
            <p className="mt-1 text-xs text-slate-500">Chain ID: {chain.id}</p>
          </button>
        ))}
      </div>
    </CardShell>
  );
}


export const ChainSwitcherVariants = ["default", "primary", "secondary", "success", "warning", "danger"] as const;
export const ChainSwitcherSizes = ["sm", "md", "lg"] as const;
export function ChainSwitcherIsInteractive(disabled?: boolean) { return !disabled; }
export function ChainSwitcherDisplayLabel(index: number) { return "ChainSwitcher item " + String(index + 1); }
