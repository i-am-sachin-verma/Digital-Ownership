import React, { useMemo, useState } from "react";

type Plan = {
  label: string;
  total: number;
  claimed: number;
  cliffMonth: string;
  cadence: string;
  beneficiary: string;
};

const plans: Plan[] = [
  { label: "Team", total: 120000, claimed: 34000, cliffMonth: "Jan 2026", cadence: "Monthly", beneficiary: "Core contributors" },
  { label: "Investors", total: 80000, claimed: 20000, cliffMonth: "Mar 2026", cadence: "Quarterly", beneficiary: "Seed + strategic" },
  { label: "Advisors", total: 20000, claimed: 5000, cliffMonth: "Feb 2026", cadence: "Monthly", beneficiary: "Advisors" },
  { label: "Community", total: 100000, claimed: 42000, cliffMonth: "Dec 2025", cadence: "Weekly", beneficiary: "Airdrop + rewards" },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function VestingDashboard() {
  const [selected, setSelected] = useState(0);
  const [projectionMonths, setProjectionMonths] = useState(12);

  const plan = plans[selected];
  const claimedPct = (plan.claimed / plan.total) * 100;
  const monthlyUnlock = useMemo(() => {
    const remaining = plan.total - plan.claimed;
    return Math.max(0, Math.round(remaining / projectionMonths));
  }, [plan, projectionMonths]);

  const timeline = useMemo(() => {
    const remaining = plan.total - plan.claimed;
    const points = Array.from({ length: 12 }, (_, index) => {
      const unlocked = Math.min(plan.total, plan.claimed + ((index + 1) / 12) * remaining);
      return Math.round(unlocked);
    });
    return points;
  }, [plan]);

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">On-Chain Token Vesting Visualization</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Inspect release schedules, claimable amounts, and forward unlock projections for multiple beneficiaries in one component.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Plans" value={plans.length.toString()} />
          <Metric label="Claimed" value={`${formatPercent(claimedPct)}`} />
          <Metric label="Monthly unlock" value={formatNumber(monthlyUnlock)} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="space-y-3">
            {plans.map((item, index) => {
              const pct = (item.claimed / item.total) * 100;
              return (
                <button
                  key={item.label}
                  onClick={() => setSelected(index)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    index === selected
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.beneficiary}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatPercent(pct)}</div>
                      <div className="text-xs opacity-75">{item.cadence}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <Box label="Total allocation" value={formatNumber(plan.total)} />
            <Box label="Already claimed" value={formatNumber(plan.claimed)} />
            <Box label="Cliff" value={plan.cliffMonth} />
            <Box label="Cadence" value={plan.cadence} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Vesting progress</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Projected over {projectionMonths} months</div>
              </div>
              <input
                type="range"
                min={3}
                max={24}
                value={projectionMonths}
                onChange={(e) => setProjectionMonths(Number(e.target.value))}
              />
            </div>

            <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${claimedPct}%` }} />
            </div>

            <svg viewBox="0 0 320 120" className="mt-5 h-32 w-full">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-slate-900 dark:text-white"
                points={timeline.map((value, index) => `${(index / 11) * 300 + 10},${110 - (value / plan.total) * 90}`).join(" ")}
              />
              {timeline.map((value, index) => (
                <circle
                  key={index}
                  cx={(index / 11) * 300 + 10}
                  cy={110 - (value / plan.total) * 90}
                  r="3"
                  className="fill-slate-900 dark:fill-white"
                />
              ))}
            </svg>
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

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
