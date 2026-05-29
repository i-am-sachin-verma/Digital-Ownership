import React, { useMemo, useState } from "react";

type Signal = {
  label: string;
  score: number;
  weight: number;
  note: string;
};

const signals: Signal[] = [
  { label: "Transaction history", score: 84, weight: 0.32, note: "Long-lived wallet with regular activity." },
  { label: "Governance participation", score: 62, weight: 0.22, note: "Moderate proposal voting and delegation." },
  { label: "Wallet age", score: 91, weight: 0.18, note: "Old wallet with steady reuse." },
  { label: "Suspicious approvals", score: 38, weight: 0.16, note: "Some lingering token approvals remain." },
  { label: "Protocol diversity", score: 74, weight: 0.12, note: "Healthy spread across networks." },
];

function weightedScore(items: Signal[]) {
  return Math.round(items.reduce((sum, item) => sum + item.score * item.weight, 0));
}

export default function ReputationScore() {
  const [boost, setBoost] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const adjusted = useMemo(() => {
    return signals.map((signal) => ({
      ...signal,
      final: Math.max(0, Math.min(100, signal.score + boost)),
    }));
  }, [boost]);

  const score = weightedScore(adjusted);
  const tier = score >= 85 ? "trusted" : score >= 65 ? "credible" : score >= 45 ? "neutral" : "risky";

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Web3 Reputation and Trust Scoring</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Turn wallet behavior into an explainable trust score with weighted signals, tiers, and transparent contributing factors.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Trust score" value={score.toString()} />
          <Metric label="Tier" value={tier} />
          <Metric label="Signals" value={signals.length.toString()} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">Score tuning</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Adjust a global modifier for experiment mode</div>
            </div>
            <input
              type="range"
              min={-10}
              max={10}
              value={boost}
              onChange={(e) => setBoost(Number(e.target.value))}
            />
          </div>

          <div className="space-y-3">
            {adjusted.map((signal, index) => (
              <button
                key={signal.label}
                onClick={() => setSelected(index)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  selected === index
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{signal.label}</span>
                  <span className="text-xs opacity-75">{signal.final}/100</span>
                </div>
                <div className="mt-2 text-xs opacity-80">{signal.note}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Explainable trust view</div>
            <div className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">{score}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Tier: {tier}</div>
          </div>

          <div className="mt-5 grid gap-3">
            {selected === null ? (
              <Info label="Selected signal" value="Select a signal to see its weight and narrative." />
            ) : (
              <Info label="Selected signal" value={`${adjusted[selected].label} • ${adjusted[selected].final}/100`} />
            )}
            <Info label="Guidance" value="High approvals or suspicious activity reduce the score." />
            <Info label="Usage" value="Useful in marketplaces, lending, and governance dashboards." />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Signal distribution</div>
            <div className="mt-4 space-y-3">
              {adjusted.map((signal) => (
                <div key={signal.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{signal.label}</span>
                    <span>{signal.weight.toFixed(2)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${signal.weight * 100}%` }} />
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
