import React, { useMemo, useState } from "react";

type Route = {
  name: string;
  chain: string;
  volume: number;
  fee: number;
  time: string;
  reliability: number;
};

const routes: Route[] = [
  { name: "Stargate", chain: "Arbitrum", volume: 4200000, fee: 0.35, time: "6 min", reliability: 98 },
  { name: "Hop", chain: "Optimism", volume: 1800000, fee: 0.28, time: "8 min", reliability: 96 },
  { name: "Across", chain: "Base", volume: 2600000, fee: 0.22, time: "4 min", reliability: 99 },
  { name: "Celer", chain: "Polygon", volume: 1500000, fee: 0.18, time: "9 min", reliability: 94 },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export default function BridgeAnalytics() {
  const [chain, setChain] = useState("All");
  const [query, setQuery] = useState("");

  const chains = ["All", ...new Set(routes.map((route) => route.chain))];
  const filtered = useMemo(() => {
    return routes.filter((route) => {
      const matchesChain = chain === "All" || route.chain === chain;
      const matchesQuery = `${route.name} ${route.chain}`.toLowerCase().includes(query.toLowerCase());
      return matchesChain && matchesQuery;
    });
  }, [chain, query]);

  const totalVolume = filtered.reduce((sum, route) => sum + route.volume, 0);
  const best = [...filtered].sort((a, b) => b.reliability - a.reliability)[0];

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Layer-2 Bridge Analytics Interface</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Compare routes, transfer volumes, fees, and reliability across major bridge providers and destination chains.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Routes" value={filtered.length.toString()} />
          <Stat label="Volume" value={money(totalVolume)} />
          <Stat label="Best reliability" value={best ? `${best.reliability}%` : "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bridge or chain"
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

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {filtered.map((route) => (
            <article key={route.name} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{route.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{route.chain}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{route.reliability}%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{route.time}</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Routing summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Top route" value={best ? best.name : "—"} />
            <Info label="Estimated fee" value={best ? money(best.fee) : "—"} />
            <Info label="Time" value={best?.time ?? "—"} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Reliability bars</div>
            <div className="mt-4 space-y-3">
              {filtered.map((route) => (
                <div key={route.name}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{route.name}</span>
                    <span>{route.reliability}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${route.reliability}%` }} />
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
