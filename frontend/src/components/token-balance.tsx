import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Variant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type Size = "sm" | "md" | "lg";

export interface TokenBalanceCardProps {
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

function SectionHeader({ title, description }: Pick<TokenBalanceCardProps, "title" | "description">) {
  return (
    <header className="space-y-1">
      <h2 className="text-base font-semibold tracking-tight">{title ?? "Token Balance Card"}</h2>
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


type Token = { symbol: string; name: string; amount: number; usd: number };

const tokens: Token[] = [
  { symbol: "ETH", name: "Ether", amount: 1.42, usd: 4100 },
  { symbol: "USDC", name: "USD Coin", amount: 3280, usd: 3280 },
  { symbol: "UNI", name: "Uniswap", amount: 52.4, usd: 430 },
];

export interface TokenBalanceCardProps extends TokenBalanceCardProps {
  address?: string;
  totalUsd?: number;
}

export default function TokenBalanceCard({
  address,
  totalUsd = 0,
  className,
  title = "Portfolio Balance",
}: TokenBalanceCardProps) {
  const sorted = useMemo(() => [...tokens].sort((a, b) => b.usd - a.usd), []);
  const total = totalUsd || sorted.reduce((sum, token) => sum + token.usd, 0);

  return (
    <CardShell className={className}>
      <SectionHeader title={title} description={address ? shortAddress(address) : "Asset balances across your wallet."} />
      <div className="mt-4 space-y-3">
        <div className="rounded-xl border bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Total Value</p>
          <p className="text-2xl font-bold">${formatCompact(total)}</p>
        </div>
        <div className="space-y-2">
          {sorted.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
              <div>
                <strong>{token.symbol}</strong>
                <p className="text-xs text-slate-500">{token.name}</p>
              </div>
              <div className="text-right">
                <p>{token.amount}</p>
                <p className="text-xs text-slate-500">${formatCompact(token.usd)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}


export const TokenBalanceVariants = ["default", "primary", "secondary", "success", "warning", "danger"] as const;
export const TokenBalanceSizes = ["sm", "md", "lg"] as const;
export function TokenBalanceIsInteractive(disabled?: boolean) { return !disabled; }
export function TokenBalanceDisplayLabel(index: number) { return "TokenBalance item " + String(index + 1); }
