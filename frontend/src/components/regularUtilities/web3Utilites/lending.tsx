import React, { useMemo, useState } from "react";

type Position = {
  protocol: string;
  collateralAsset: string;
  debtAsset: string;
  collateralValue: number;
  debtValue: number;
  health: number;
  apy: number;
};

const positions: Position[] = [
  { protocol: "Aave", collateralAsset: "ETH", debtAsset: "USDC", collateralValue: 68000, debtValue: 24000, health: 2.6, apy: 4.3 },
  { protocol: "Compound", collateralAsset: "WBTC", debtAsset: "USDT", collateralValue: 165000, debtValue: 50000, health: 2.0, apy: 5.8 },
  { protocol: "Spark", collateralAsset: "stETH", debtAsset: "DAI", collateralValue: 92000, debtValue: 40000, health: 1.8, apy: 3.7 },
];

function usd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function LendingPositionDashboard() {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return positions.filter((item) => `${item.protocol} ${item.collateralAsset} ${item.debtAsset}`.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const pos = filtered[selected] ?? filtered[0];
  const ltv = (pos.debtValue / pos.collateralValue) * 100;
  const safety = pos.health >= 2.2 ? "Safe" : pos.health >= 1.8 ? "Watch" : "Risky";

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">DeFi Lending Position Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Track borrowed capital, collateral exposure, interest costs, and health factor across multiple lending protocols.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Positions" value={filtered.length.toString()} />
          <Stat label="Health" value={pos.health.toFixed(2)} />
          <Stat label="LTV" value={`${ltv.toFixed(1)}%`} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search protocol or asset"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {filtered.map((position, index) => (
            <button
              key={position.protocol}
              onClick={() => setSelected(index)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${index === selected ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{position.protocol}</div>
                  <div className="text-xs opacity-75">{position.collateralAsset} → {position.debtAsset}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{position.health.toFixed(2)} HF</div>
                  <div className="text-xs opacity-75">{position.apy.toFixed(1)}% borrow rate</div>
                </div>
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Collateral value" value={usd(pos.collateralValue)} />
            <Info label="Debt value" value={usd(pos.debtValue)} />
            <Info label="LTV" value={`${ltv.toFixed(1)}%`} />
            <Info label="Safety" value={safety} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Health meter</div>
            <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(100, pos.health * 40)}%` }} />
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Monitor whether the position is staying safely above liquidation thresholds.
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
