import React, { useEffect, useMemo, useState } from "react";

type Chain = { id: number; name: string; symbol: string; short: string };

const CHAINS: Chain[] = [
  { id: 1, name: "Ethereum", symbol: "ETH", short: "ETH" },
  { id: 10, name: "Optimism", symbol: "ETH", short: "OP" },
  { id: 137, name: "Polygon", symbol: "MATIC", short: "POLY" },
  { id: 42161, name: "Arbitrum", symbol: "ETH", short: "ARB" },
  { id: 8453, name: "Base", symbol: "ETH", short: "BASE" },
];

type SessionState = {
  provider?: string;
  account?: string;
  chainId?: number;
  savedAt?: string;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | object }) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
      providers?: any[];
    };
  }
}

const STORAGE_KEY = "web3.wallet.session.v2";

function shortAddress(address: string) {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

function asChainId(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    if (value.startsWith("0x")) return Number.parseInt(value, 16);
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function chainLabel(chainId: number) {
  return CHAINS.find((c) => c.id === chainId)?.name ?? "Unsupported";
}

function providerLabel(providers: any[] | undefined) {
  if (!providers?.length) return "Injected wallet";
  if (providers.length > 1) return "Multiple injected wallets";
  return "Injected wallet";
}

function balanceLabel(balance: number, symbol: string) {
  return `${balance.toFixed(4)} ${symbol}`;
}

export default function WalletHub() {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);
  const [providerName, setProviderName] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState("");
  const [ens, setEns] = useState("");
  const [balance, setBalance] = useState(0);
  const [lastSync, setLastSync] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showNetworks, setShowNetworks] = useState(false);

  const activeChain = useMemo(() => CHAINS.find((c) => c.id === chainId), [chainId]);
  const connected = Boolean(account);

  useEffect(() => {
    const provider = window.ethereum;
    if (!provider) {
      setError("No injected wallet provider detected.");
      return;
    }

    const restore = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as SessionState;
        if (parsed.provider) setProviderName(parsed.provider);
      } catch {}
    };

    restore();

    provider.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts?.[0]) setAccount(accounts[0]);
      return provider.request({ method: "eth_chainId" });
    }).then((id) => {
      setChainId(asChainId(id));
      if (account) {
        void refreshAccount(account, asChainId(id));
      }
    }).catch(() => {});

    const onAccountsChanged = (accounts: string[]) => {
      if (!accounts.length) {
        setAccount("");
        setBalance(0);
        setEns("");
        setStatus("idle");
        setHistory((items) => ["Wallet disconnected", ...items].slice(0, 6));
        return;
      }
      setAccount(accounts[0]);
      setStatus("connected");
      void refreshAccount(accounts[0], chainId || 1);
    };

    const onChainChanged = (value: string) => {
      const next = asChainId(value);
      setChainId(next);
      if (account) void refreshAccount(account, next);
    };

    provider.on?.("accountsChanged", onAccountsChanged);
    provider.on?.("chainChanged", onChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", onAccountsChanged);
      provider.removeListener?.("chainChanged", onChainChanged);
    };
  }, [account, chainId]);

  async function refreshAccount(addr: string, currentChain: number) {
    const provider = window.ethereum;
    if (!provider) return;
    try {
      const hex = await provider.request({ method: "eth_getBalance", params: [addr, "latest"] }) as string;
      setBalance(Number.parseInt(hex, 16) / 1e18);
      setEns("");
      setLastSync(new Date().toLocaleTimeString());
      setHistory((items) => [`Synced on ${chainLabel(currentChain)}`, ...items].slice(0, 6));
    } catch {
      setBalance(0);
      setLastSync(new Date().toLocaleTimeString());
    }
  }

  async function connect() {
    const provider = window.ethereum;
    if (!provider) {
      setStatus("error");
      setError("Install a Web3 wallet to continue.");
      return;
    }

    setStatus("connecting");
    setError("");

    try {
      const candidates = provider.providers ?? [provider];
      const chosen = candidates[0];
      const accounts = await chosen.request({ method: "eth_requestAccounts" }) as string[];
      const id = await chosen.request({ method: "eth_chainId" }) as string;

      const nextAccount = accounts?.[0] ?? "";
      const nextChainId = asChainId(id);

      setProviderName(providerLabel(candidates));
      setAccount(nextAccount);
      setChainId(nextChainId);
      setStatus("connected");

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          provider: providerLabel(candidates),
          account: nextAccount,
          chainId: nextChainId,
          savedAt: new Date().toISOString(),
        })
      );

      if (nextAccount) {
        await refreshAccount(nextAccount, nextChainId);
        setHistory((items) => [`Connected ${shortAddress(nextAccount)}`, ...items].slice(0, 6));
      }
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Connection rejected");
    }
  }

  function disconnect() {
    localStorage.removeItem(STORAGE_KEY);
    setAccount("");
    setChainId(0);
    setProviderName("");
    setBalance(0);
    setEns("");
    setLastSync("");
    setStatus("idle");
    setError("");
    setHistory((items) => ["Disconnected session", ...items].slice(0, 6));
  }

  async function switchNetwork(target: Chain) {
    const provider = window.ethereum;
    if (!provider) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${target.id.toString(16)}` }],
      });
      setChainId(target.id);
      setHistory((items) => [`Switched to ${target.name}`, ...items].slice(0, 6));
    } catch (e) {
      setError(e instanceof Error ? e.message : `Unable to switch to ${target.name}`);
    }
  }

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Multi-Chain Wallet Connection Hub</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Connect a wallet, preserve the session, detect the active network, and keep the user informed about identity and chain state.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={connect} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900">
              {status === "connecting" ? "Connecting..." : "Connect Wallet"}
            </button>
            <button onClick={disconnect} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900">
              Disconnect
            </button>
            <button onClick={() => setShowNetworks((v) => !v)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900">
              {showNetworks ? "Hide Chains" : "Switch Chain"}
            </button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Stat label="Status" value={status} />
          <Stat label="Provider" value={providerName || "Injected wallet"} />
          <Stat label="Account" value={connected ? shortAddress(account) : "Not connected"} />
          <Stat label="Chain" value={chainLabel(chainId)} />
          <Stat label="ENS" value={ens || "Unavailable"} />
          <Stat label="Balance" value={connected ? balanceLabel(balance, activeChain?.symbol ?? "ETH") : "—"} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Session summary</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Synced {lastSync || "—"}</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Line label="Wallet state" value={connected ? "Connected session active" : "No active session"} />
            <Line label="Network safety" value={activeChain ? "Supported chain" : "Unsupported or unknown"} />
            <Line label="Identity" value={ens || account || "No identity detected"} />
            <Line label="Saved session" value={localStorage.getItem(STORAGE_KEY) ? "Persisted" : "Not saved"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Recent activity</div>
            <div className="mt-3 space-y-2">
              {history.length ? history.map((item, index) => (
                <div key={index} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  {item}
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Use the wallet connector to populate session history, network changes, and balance sync events.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Supported chains</h2>
          {showNetworks ? (
            <div className="mt-4 grid gap-2">
              {CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => switchNetwork(chain)}
                  className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition ${
                    chain.id === chainId
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                  }`}
                >
                  <span>{chain.name}</span>
                  <span className="text-xs opacity-70">{chain.short}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Open the chain picker to switch networks and keep the wallet aligned with the current application context.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 break-words text-sm font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
