import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Variant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type Size = "sm" | "md" | "lg";

export interface WalletConnectPanelProps {
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

function SectionHeader({ title, description }: Pick<WalletConnectPanelProps, "title" | "description">) {
  return (
    <header className="space-y-1">
      <h2 className="text-base font-semibold tracking-tight">{title ?? "Wallet Connect Panel"}</h2>
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


type WalletProvider = "MetaMask" | "WalletConnect" | "Coinbase Wallet";

const providers: WalletProvider[] = ["MetaMask", "WalletConnect", "Coinbase Wallet"];

export interface WalletConnectPanelProps extends WalletConnectPanelProps {
  onConnect?: (provider: WalletProvider) => void;
  walletAddress?: string;
  balance?: number;
}

function ProviderBadge({ provider }: { provider: WalletProvider }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{provider}</span>;
}

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={cx("h-2.5 w-2.5 rounded-full", connected ? "bg-emerald-500" : "bg-slate-400")} />
      <span>{connected ? "Connected" : "Disconnected"}</span>
    </div>
  );
}

export default function WalletConnectPanel({
  title = "Connect Wallet",
  description = "Connect your wallet to start interacting with the app.",
  onConnect,
  walletAddress,
  balance = 0,
  className,
  variant = "default",
  size = "md",
}: WalletConnectPanelProps) {
  const [connected, setConnected] = useState(!!walletAddress);
  const [activeProvider, setActiveProvider] = useState<WalletProvider>("MetaMask");
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    setConnected(!!walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleConnect = useCallback((provider: WalletProvider) => {
    setLoading(true);
    window.setTimeout(() => {
      if (!mounted.current) return;
      setActiveProvider(provider);
      setConnected(true);
      setLoading(false);
      onConnect?.(provider);
    }, 350);
  }, [onConnect]);

  return (
    <CardShell className={className} variant={variant} size={size}>
      <SectionHeader title={title} description={description} />
      <div className="mt-4 space-y-4">
        <ConnectionStatus connected={connected} />
        <div className="flex flex-wrap gap-2">
          {providers.map((provider) => (
            <button
              key={provider}
              type="button"
              disabled={loading}
              onClick={() => handleConnect(provider)}
              className={cx(
                "rounded-xl border px-3 py-2 text-sm font-medium transition",
                provider === activeProvider ? "border-blue-500 bg-blue-50" : "bg-white hover:bg-slate-50",
                loading && "opacity-60"
              )}
            >
              <ProviderBadge provider={provider} />
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Address</p>
            <p className="font-mono text-sm">{shortAddress(walletAddress)}</p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Balance</p>
            <p className="text-sm font-semibold">{formatCompact(balance)} ETH</p>
          </div>
        </div>
        <ButtonRow>
          <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
            {connected ? "Open Wallet" : "Create Wallet"}
          </button>
          <button type="button" className="rounded-lg border px-4 py-2 text-sm">
            Disconnect
          </button>
        </ButtonRow>
      </div>
    </CardShell>
  );
}


export const WalletConnectVariants = ["default", "primary", "secondary", "success", "warning", "danger"] as const;
export const WalletConnectSizes = ["sm", "md", "lg"] as const;
export function WalletConnectIsInteractive(disabled?: boolean) { return !disabled; }
export function WalletConnectDisplayLabel(index: number) { return "WalletConnect item " + String(index + 1); }
