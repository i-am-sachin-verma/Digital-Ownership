import React, { useMemo, useState } from "react";

type Opportunity = {
  protocol: string;
  pair: string;
  apy: number;
  tvl: number;
  risk: "low" | "mid" | "high";
  reward: string;
};

const opportunities: Opportunity[] = [
  { protocol: "Aave", pair: "USDC / ETH", apy: 9.4, tvl: 13200000, risk: "low", reward: "Protocol incentives" },
  { protocol: "Uniswap", pair: "ARB / ETH", apy: 22.1, tvl: 4200000, risk: "mid", reward: "LP fees + emissions" },
  { protocol: "Pendle", pair: "sUSDe / USDE", apy: 31.8, tvl: 1860000, risk: "high", reward: "Rate arbitrage" },
  { protocol: "Curve", pair: "stETH / ETH", apy: 7.1, tvl: 18400000, risk: "low", reward: "Swaps + incentives" },
];

export default function YieldDiscovery() {
  const [risk, setRisk] = useState<"all" | "low" | "mid" | "high">("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return opportunities.filter((item) => {
      const matchesRisk = risk === "all" || item.risk === risk;
      const matchesSearch = `${item.protocol} ${item.pair} ${item.reward}`.toLowerCase().includes(search.toLowerCase());
      return matchesRisk && matchesSearch;
    });
  }, [risk, search]);

  const top = [...rows].sort((a, b) => b.apy - a.apy)[0];

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">DeFi Yield Farming Discovery</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Compare APY, reward source, and liquidity risk across live farming opportunities in a single filterable dashboard.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Opportunities" value={rows.length.toString()} />
          <Metric label="Top APY" value={top ? `${top.apy.toFixed(1)}%` : "—"} />
          <Metric label="Risk mode" value={risk} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search protocol, pair, or reward"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
        <select
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
          value={risk}
          onChange={(e) => setRisk(e.target.value as any)}
        >
          <option value="all">All risk levels</option>
          <option value="low">Low risk</option>
          <option value="mid">Mid risk</option>
          <option value="high">High risk</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((opportunity) => (
            <article key={`${opportunity.protocol}-${opportunity.pair}`} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{opportunity.protocol}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{opportunity.pair}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{opportunity.apy.toFixed(1)}%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{opportunity.risk} risk</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{opportunity.reward}</div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Opportunity summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Best APY" value={top ? `${top.protocol} (${top.apy.toFixed(1)}%)` : "—"} />
            <Info label="Lowest risk" value={rows.find((item) => item.risk === "low")?.protocol ?? "—"} />
            <Info label="Liquidity source" value={top ? top.reward : "—"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Risk spread</div>
            <div className="mt-4 space-y-3">
              {["low", "mid", "high"].map((level) => {
                const count = rows.filter((item) => item.risk === level).length;
                return (
                  <div key={level}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{level}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${count ? (count / rows.length) * 100 : 0}%` }} />
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
