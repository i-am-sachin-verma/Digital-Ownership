import React, { useMemo, useState } from "react";

type FeeOption = {
  name: string;
  maxFee: number;
  priority: number;
  eta: string;
  reliability: number;
};

const presets: FeeOption[] = [
  { name: "Slow", maxFee: 18, priority: 1, eta: "~5 min", reliability: 0.88 },
  { name: "Standard", maxFee: 24, priority: 1.5, eta: "~2 min", reliability: 0.95 },
  { name: "Fast", maxFee: 34, priority: 2.5, eta: "~30 sec", reliability: 0.99 },
  { name: "Express", maxFee: 44, priority: 3.5, eta: "~15 sec", reliability: 1.0 },
];

function ethCost(gasLimit: number, gwei: number) {
  return gasLimit * (gwei / 1e9);
}

function usd(eth: number, price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(eth * price);
}

export default function GasEstimator() {
  const [gasLimit, setGasLimit] = useState(21000);
  const [ethPrice, setEthPrice] = useState(3650);
  const [multiplier, setMultiplier] = useState(1.08);
  const [selected, setSelected] = useState(1);

  const options = useMemo(
    () =>
      presets.map((p) => ({
        ...p,
        adjustedMax: p.maxFee * multiplier,
        adjustedPriority: p.priority * multiplier,
        costEth: ethCost(gasLimit, p.maxFee * multiplier),
      })),
    [gasLimit, multiplier]
  );

  const current = options[selected];
  const congestion = multiplier > 1.22 ? "High" : multiplier > 1.05 ? "Moderate" : "Calm";

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Gas Fee Estimation and Transaction Cost Analysis</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Compare confirmation speed, network pressure, and transaction cost before signing, with both EIP-1559 and congestion-aware estimates.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          Network congestion: <span className="font-semibold">{congestion}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gas limit" value={gasLimit} onChange={(v) => setGasLimit(Math.max(21000, Number(v) || 21000))} />
            <Field label="ETH price" value={ethPrice} onChange={(v) => setEthPrice(Math.max(1, Number(v) || 1))} />
            <Field label="Congestion multiplier" value={multiplier} onChange={(v) => setMultiplier(Math.max(1, Number(v) || 1))} step="0.01" />
            <Field label="Wallet chain estimate" value={gasLimit > 100000 ? "Contract call" : "Transfer"} onChange={() => {}} readOnly />
          </div>

          <div className="mt-5 space-y-3">
            {options.map((option, index) => (
              <button
                key={option.name}
                onClick={() => setSelected(index)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  index === selected
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option.name}</span>
                  <span className="text-xs opacity-80">{option.eta}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs opacity-90">
                  <span>Max {option.adjustedMax.toFixed(2)} gwei</span>
                  <span>Tip {option.adjustedPriority.toFixed(2)} gwei</span>
                  <span>Reliability {(option.reliability * 100).toFixed(0)}%</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Estimated execution cost</h2>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{current.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{current.eta}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{usd(current.costEth, ethPrice)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{current.costEth.toFixed(6)} ETH</div>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <Row label="Gas limit" value={`${gasLimit.toLocaleString()} units`} />
              <Row label="Max fee per gas" value={`${current.adjustedMax.toFixed(2)} gwei`} />
              <Row label="Priority fee" value={`${current.adjustedPriority.toFixed(2)} gwei`} />
              <Row label="Estimated cost" value={usd(current.costEth, ethPrice)} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Fee trend model</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Illustrative congestion curve</div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Realtime aware</div>
            </div>
            <svg viewBox="0 0 320 150" className="mt-4 h-36 w-full">
              <defs>
                <linearGradient id="gasFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M10,112 C34,91 50,86 70,72 C92,56 110,35 135,47 C161,60 164,89 185,81 C204,74 220,54 244,49 C264,44 281,39 290,32 L290,136 L10,136 Z"
                fill="url(#gasFill)"
                className="text-slate-900 dark:text-white"
              />
              <path
                d="M10,112 C34,91 50,86 70,72 C92,56 110,35 135,47 C161,60 164,89 185,81 C204,74 220,54 244,49 C264,44 281,39 290,32"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-slate-900 dark:text-white"
              />
            </svg>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step,
  readOnly,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  step?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:focus:border-white"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
