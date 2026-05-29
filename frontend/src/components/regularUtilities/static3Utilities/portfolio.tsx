import React, { useMemo, useState } from "react";

type ChainAsset = {
  chain: string;
  symbol: string;
  value: number;
  weight: number;
};

const assets: ChainAsset[] = [
  { chain: "Ethereum", symbol: "ETH", value: 68000, weight: 42 },
  { chain: "Arbitrum", symbol: "ARB", value: 12000, weight: 8 },
  { chain: "Optimism", symbol: "OP", value: 19000, weight: 12 },
  { chain: "Polygon", symbol: "MATIC", value: 8400, weight: 5 },
  { chain: "Base", symbol: "ETH", value: 22000, weight: 14 },
  { chain: "Solana", symbol: "SOL", value: 18000, weight: 12 },
];

export default function CrossChainPortfolio() {
  const [chain, setChain] = useState("All");
  const [query, setQuery] = useState("");

  const chains = ["All", ...new Set(assets.map((item) => item.chain))];

  const rows = useMemo(() => {
    return assets.filter((item) => {
      const matchesChain = chain === "All" || item.chain === chain;
      const matchesQuery = `${item.symbol} ${item.chain}`.toLowerCase().includes(query.toLowerCase());
      return matchesChain && matchesQuery;
    });
  }, [chain, query]);

  const total = rows.reduce((sum, item) => sum + item.value, 0);
  const heaviest = [...rows].sort((a, b) => b.weight - a.weight)[0];

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Cross-Chain Portfolio Comparison</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Compare capital allocation across chains side by side and identify concentration or fragmentation patterns.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Assets" value={rows.length.toString()} />
          <Stat label="Total" value={`$${total.toLocaleString()}`} />
          <Stat label="Largest" value={heaviest ? heaviest.chain : "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chain or asset"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          {chains.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((asset) => (
            <article key={`${asset.chain}-${asset.symbol}`} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{asset.symbol}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{asset.chain}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">${asset.value.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{asset.weight}% weight</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Allocation summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Top chain" value={heaviest ? heaviest.chain : "—"} />
            <Info label="Top weight" value={heaviest ? `${heaviest.weight}%` : "—"} />
            <Info label="Portfolio value" value={`$${total.toLocaleString()}`} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Weights</div>
            <div className="mt-4 space-y-3">
              {rows.map((asset) => (
                <div key={asset.chain + asset.symbol}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{asset.chain}</span>
                    <span>{asset.weight}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${asset.weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
