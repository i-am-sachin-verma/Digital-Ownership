import React, { useMemo, useState } from "react";

type RiskScenario = {
  label: string;
  priceDrop: number;
  healthAfter: number;
  liquidationRisk: string;
};

const scenarios: RiskScenario[] = [
  { label: "Current price", priceDrop: 0, healthAfter: 2.5, liquidationRisk: "Low" },
  { label: "-5% move", priceDrop: 5, healthAfter: 2.1, liquidationRisk: "Watch" },
  { label: "-10% move", priceDrop: 10, healthAfter: 1.7, liquidationRisk: "High" },
  { label: "-20% move", priceDrop: 20, healthAfter: 1.1, liquidationRisk: "Critical" },
];

export default function LiquidationMonitor() {
  const [collateralValue, setCollateralValue] = useState(68000);
  const [debtValue, setDebtValue] = useState(24000);
  const health = useMemo(() => collateralValue / debtValue, [collateralValue, debtValue]);

  const projected = scenarios.map((scenario) => ({
    ...scenario,
    adjustedHealth: Math.max(0.2, health - scenario.priceDrop / 20),
  }));

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Liquidation Risk Monitoring Interface</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Model position safety under price pressure and surface liquidations before they become urgent.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Health" value={health.toFixed(2)} />
          <Stat label="Risk" value={health >= 2.2 ? "Safe" : health >= 1.8 ? "Watch" : "Danger"} />
          <Stat label="Scenarios" value={projected.length.toString()} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Collateral value" value={collateralValue} onChange={setCollateralValue} />
            <Field label="Debt value" value={debtValue} onChange={setDebtValue} />
          </div>

          <div className="mt-5 space-y-3">
            {projected.map((scenario) => (
              <article key={scenario.label} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{scenario.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Risk {scenario.liquidationRisk}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{scenario.adjustedHealth.toFixed(2)} HF</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">- {scenario.priceDrop}%</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Risk overview</h2>

          <div className="mt-4 grid gap-3">
            <Info label="Current health" value={health.toFixed(2)} />
            <Info label="Liquidation status" value={health >= 1.8 ? "Position is above danger zone" : "Position is close to liquidation"} />
            <Info label="Recommended action" value={health >= 1.8 ? "Monitor closely" : "Reduce debt or add collateral"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Health bar</div>
            <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(100, health * 35)}%` }} />
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              The bar represents relative room before the position enters a liquidation-prone state.
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

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
      />
    </label>
  );
}
