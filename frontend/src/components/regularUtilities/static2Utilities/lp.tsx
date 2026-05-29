import React, { useMemo, useState } from "react";

type Pool = {
  pair: string;
  tvl: number;
  apr: number;
  volume24h: number;
  feeApr: number;
  chain: string;
};

const pools: Pool[] = [
  { pair: "ETH/USDC", tvl: 13200000, apr: 8.4, volume24h: 210000, feeApr: 4.8, chain: "Ethereum" },
  { pair: "ARB/ETH", tvl: 4200000, apr: 15.7, volume24h: 86000, feeApr: 7.2, chain: "Arbitrum" },
  { pair: "OP/USDC", tvl: 1860000, apr: 21.2, volume24h: 62000, feeApr: 10.5, chain: "Optimism" },
  { pair: "MATIC/USDC", tvl: 8700000, apr: 11.6, volume24h: 184000, feeApr: 5.3, chain: "Polygon" },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value >= 1000 ? 0 : 2 }).format(value);
}

export default function LiquidityAnalytics() {
  const [chain, setChain] = useState("All");
  const [search, setSearch] = useState("");

  const chains = ["All", ...new Set(pools.map((pool) => pool.chain))];
  const rows = useMemo(() => {
    return pools.filter((pool) => {
      const matchesChain = chain === "All" || pool.chain === chain;
      const matchesSearch = `${pool.pair} ${pool.chain}`.toLowerCase().includes(search.toLowerCase());
      return matchesChain && matchesSearch;
    });
  }, [chain, search]);

  const totalTvl = rows.reduce((sum, pool) => sum + pool.tvl, 0);
  const top = [...rows].sort((a, b) => b.apr - a.apr)[0];

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Liquidity Pool Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Compare TVL, APR, fee generation, and liquidity depth across pools with quick chain filtering.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Pools" value={rows.length.toString()} />
          <Metric label="TVL" value={money(totalTvl)} />
          <Metric label="Best APR" value={top ? `${top.apr.toFixed(1)}%` : "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pair or chain"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          {chains.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((pool) => (
            <article key={`${pool.chain}-${pool.pair}`} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{pool.pair}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{pool.chain}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{pool.apr.toFixed(1)}% APR</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{money(pool.volume24h)} volume</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Pool insight</h2>

          <div className="mt-4 grid gap-3">
            <Info label="Highest APR" value={top ? `${top.pair} (${top.apr.toFixed(1)}%)` : "—"} />
            <Info label="Fee APR" value={top ? `${top.feeApr.toFixed(1)}%` : "—"} />
            <Info label="Selected chain" value={chain} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">TVL distribution</div>
            <div className="mt-4 space-y-3">
              {rows.map((pool) => {
                const pct = totalTvl ? (pool.tvl / totalTvl) * 100 : 0;
                return (
                  <div key={pool.pair}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{pool.pair}</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
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
