import React, { useMemo, useState } from "react";

type StakePosition = {
  token: string;
  staked: number;
  apy: number;
  pending: number;
  cooldown: string;
  validator: string;
};

const positions: StakePosition[] = [
  { token: "ETH", staked: 2.4, apy: 3.8, pending: 0.12, cooldown: "No lockup", validator: "Lido" },
  { token: "MATIC", staked: 1500, apy: 8.1, pending: 85, cooldown: "3 days", validator: "Polygon validator set" },
  { token: "ATOM", staked: 320, apy: 14.5, pending: 11, cooldown: "21 days", validator: "Cosmos Hub" },
  { token: "SOL", staked: 190, apy: 6.2, pending: 7, cooldown: "2 days", validator: "Solana validator" },
];

function projectedReward(staked: number, apy: number) {
  return staked * (apy / 100);
}

export default function StakingMonitor() {
  const [selected, setSelected] = useState(0);
  const [months, setMonths] = useState(12);

  const position = positions[selected];
  const yearly = useMemo(() => projectedReward(position.staked, position.apy), [position]);
  const monthly = yearly / 12;
  const projection = monthly * months;

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Staking Rewards Monitoring</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Track staking positions, pending rewards, validator context, and projected returns across multiple assets.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Assets" value={positions.length.toString()} />
          <Metric label="Yearly reward" value={yearly.toFixed(2)} />
          <Metric label="Projection" value={projection.toFixed(2)} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="space-y-3">
            {positions.map((item, index) => (
              <button
                key={item.token}
                onClick={() => setSelected(index)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  index === selected
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{item.token}</div>
                    <div className="text-xs opacity-75">{item.validator}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{item.apy.toFixed(1)}% APY</div>
                    <div className="text-xs opacity-75">{item.cooldown}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <Box label="Staked" value={position.staked.toLocaleString(undefined, { maximumFractionDigits: 4 })} />
            <Box label="Pending rewards" value={position.pending.toLocaleString(undefined, { maximumFractionDigits: 4 })} />
            <Box label="Validator" value={position.validator} />
            <Box label="Cooldown" value={position.cooldown} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Reward projection</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Simulated for {months} months</div>
              </div>
              <input
                type="range"
                min={3}
                max={24}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              />
            </div>
            <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(100, months / 24 * 100)}%` }} />
            </div>
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Estimated return over {months} months: <span className="font-semibold text-slate-900 dark:text-white">{projection.toFixed(4)}</span>
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

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
