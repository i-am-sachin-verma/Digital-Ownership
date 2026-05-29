import React, { useMemo, useState } from "react";

type LendingPosition = {
  protocol: string;
  asset: string;
  collateral: number;
  debt: number;
  ltv: number;
  health: number;
  rate: number;
};

const positions: LendingPosition[] = [
  { protocol: "Aave", asset: "ETH", collateral: 18.2, debt: 24000, ltv: 68, health: 2.4, rate: 4.3 },
  { protocol: "Compound", asset: "USDC", collateral: 51000, debt: 15000, ltv: 58, health: 1.9, rate: 5.8 },
  { protocol: "Spark", asset: "stETH", collateral: 30.5, debt: 40000, ltv: 63, health: 2.1, rate: 3.6 },
  { protocol: "Morpho", asset: "WBTC", collateral: 4.1, debt: 120000, ltv: 72, health: 1.6, rate: 6.4 },
];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function LendingDashboard() {
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("");
  const position = positions[selected];

  const filtered = useMemo(() => {
    return positions.filter((item) => `${item.protocol} ${item.asset}`.toLowerCase().includes(filter.toLowerCase()));
  }, [filter]);

  const healthColor = position.health >= 2.2 ? "text-emerald-600" : position.health >= 1.8 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">DeFi Lending Position Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Review collateral, debt, loan-to-value, and health factors across lending protocols with risk-aware monitoring.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Positions" value={filtered.length.toString()} />
          <Metric label="Health" value={position.health.toFixed(2)} />
          <Metric label="Rate" value={`${position.rate.toFixed(1)}%`} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search protocol or asset"
            className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
          />
          <div className="mt-4 space-y-3">
            {filtered.map((item, index) => (
              <button
                key={`${item.protocol}-${item.asset}`}
                onClick={() => setSelected(index)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  index === selected
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{item.protocol}</div>
                    <div className="text-xs opacity-75">{item.asset}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{item.health.toFixed(2)} HF</div>
                    <div className="text-xs opacity-75">{item.ltv}% LTV</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Collateral" value={typeof position.collateral === "number" && position.collateral < 100 ? `${position.collateral} ${position.asset}` : formatUsd(position.collateral)} />
            <Info label="Debt" value={formatUsd(position.debt)} />
            <Info label="LTV" value={`${position.ltv}%`} />
            <Info label="Health factor" value={position.health.toFixed(2)} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Risk meter</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Health threshold monitoring</div>
              </div>
              <div className={`text-sm font-semibold ${healthColor}`}>{position.health >= 2.2 ? "Safe" : position.health >= 1.8 ? "Watch" : "Danger"}</div>
            </div>
            <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(100, position.health * 40)}%` }} />
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              This area shows how close the position is to the liquidation threshold.
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
