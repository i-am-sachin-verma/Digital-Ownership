import React, { useMemo, useState } from "react";

type Chain = { id: string; name: string };
const chains: Chain[] = [
  { id: "eth", name: "Ethereum" },
  { id: "arb", name: "Arbitrum" },
  { id: "opt", name: "Optimism" },
  { id: "poly", name: "Polygon" },
  { id: "base", name: "Base" },
];

const tokens = ["ETH", "USDC", "USDT", "DAI"];

function chainName(id: string) {
  return chains.find((c) => c.id === id)?.name ?? id;
}

export default function BridgeInterface() {
  const [from, setFrom] = useState("eth");
  const [to, setTo] = useState("arb");
  const [token, setToken] = useState("ETH");
  const [amount, setAmount] = useState(1.2);
  const [history, setHistory] = useState<string[]>([]);

  const fee = useMemo(() => amount * 0.0035 + 0.4, [amount]);
  const eta = useMemo(() => (from === to ? "Instant" : "8-15 min"), [from, to]);
  const route = useMemo(() => `${chainName(from)} → ${chainName(to)}`, [from, to]);

  function addHistory(entry: string) {
    setHistory((items) => [entry, ...items].slice(0, 5));
  }

  function startBridge() {
    addHistory(`Prepared ${amount.toFixed(3)} ${token} on ${route}`);
    addHistory(`Estimated fee $${fee.toFixed(2)} and ETA ${eta}`);
  }

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Enterprise Cross-Chain Bridge Interface</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Select source and destination chains, inspect fees, estimate transfer time, and keep a clear history of previous bridge operations.
          </p>
        </div>
        <button onClick={startBridge} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
          Start bridge
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Source chain" value={from} onChange={setFrom} items={chains} />
            <Select label="Destination chain" value={to} onChange={setTo} items={chains} />
            <Select label="Token" value={token} onChange={setToken} items={tokens.map((item) => ({ id: item, name: item }))} />
            <Field label="Amount" value={amount} onChange={setAmount} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="grid gap-3 text-sm">
              <Row label="Route" value={route} />
              <Row label="Bridge fee" value={`$${fee.toFixed(2)}`} />
              <Row label="Estimated duration" value={eta} />
              <Row label="Token validation" value={amount > 0 ? "Sufficient balance assumed" : "Enter an amount"} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bridge history</h2>
          <div className="mt-4 space-y-3">
            {history.length ? history.map((entry, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
                {entry}
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No transfer history yet. Start a bridge to record routing and fee summaries.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  items,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  items: { id: string; name: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
      >
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
