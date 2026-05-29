import React, { useMemo, useState } from "react";

type Strategy = {
  name: string;
  market: string;
  apr: number;
  drawdown: number;
  score: number;
  notes: string;
};

const strategies: Strategy[] = [
  { name: "Stable borrow loop", market: "Aave", apr: 11.4, drawdown: 4.2, score: 82, notes: "Low volatility with predictable financing cost." },
  { name: "ETH leverage", market: "Compound", apr: 18.6, drawdown: 12.1, score: 64, notes: "Higher return with sharper downside risk." },
  { name: "Yield basis trade", market: "Morpho", apr: 24.3, drawdown: 8.7, score: 73, notes: "Relies on spread compression and borrow efficiency." },
  { name: "LP hedge loop", market: "Spark", apr: 15.1, drawdown: 9.3, score: 70, notes: "Mix of borrow and LP fees with moderate risk." },
];

export default function StrategyBacktest() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"apr" | "score" | "drawdown">("apr");

  const rows = useMemo(() => {
    return [...strategies]
      .filter((item) => `${item.name} ${item.market} ${item.notes}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === "score") return b.score - a.score;
        if (sort === "drawdown") return a.drawdown - b.drawdown;
        return b.apr - a.apr;
      });
  }, [query, sort]);

  const best = rows[0];

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">DeFi Strategy Backtesting Interface</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Compare lending and leveraged strategies by APR, drawdown, and efficiency to understand historical resilience.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Strategies" value={rows.length.toString()} />
          <Stat label="Best APR" value={best ? `${best.apr.toFixed(1)}%` : "—"} />
          <Stat label="Best score" value={best ? best.score.toString() : "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search strategy or market"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="apr">Sort by APR</option>
          <option value="score">Sort by score</option>
          <option value="drawdown">Sort by drawdown</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((strategy) => (
            <article key={strategy.name} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{strategy.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{strategy.market}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{strategy.apr.toFixed(1)}% APR</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{strategy.score} score</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{strategy.notes}</div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Backtest summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Top strategy" value={best?.name ?? "—"} />
            <Info label="Top APR" value={best ? `${best.apr.toFixed(1)}%` : "—"} />
            <Info label="Top drawdown" value={best ? `${best.drawdown.toFixed(1)}%` : "—"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Efficiency bars</div>
            <div className="mt-4 space-y-3">
              {rows.map((strategy) => (
                <div key={strategy.name}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{strategy.name}</span>
                    <span>{strategy.score}/100</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${strategy.score}%` }} />
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
