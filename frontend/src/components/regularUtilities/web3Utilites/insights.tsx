import React, { useMemo, useState } from "react";

type Insight = {
  title: string;
  value: number;
  delta: number;
  description: string;
};

const insights: Insight[] = [
  { title: "Wallet growth", value: 12840, delta: 6.1, description: "New wallet signups across tracked communities." },
  { title: "Bridge usage", value: 4820, delta: 3.8, description: "Cross-chain transfer activity for the week." },
  { title: "Governance turnout", value: 74, delta: -1.2, description: "Voting participation across active DAOs." },
  { title: "Swap volume", value: 2310000, delta: 8.4, description: "DEX volume across selected routes." },
  { title: "Retention", value: 42, delta: 2.0, description: "Repeat usage among active wallets." },
];

export default function InsightsPanel() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"value" | "delta">("value");

  const rows = useMemo(() => {
    return [...insights]
      .filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (sort === "value" ? b.value - a.value : b.delta - a.delta));
  }, [search, sort]);

  const top = rows[0];

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Protocol Insights Panel</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Surface actionable analytics, trending metrics, and summary cards for a Web3 dashboard experience.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Insights" value={rows.length.toString()} />
          <Metric label="Top metric" value={top?.title ?? "—"} />
          <Metric label="Sort" value={sort} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search insight"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="value">Sort by value</option>
          <option value="delta">Sort by change</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.value.toLocaleString()}</div>
                  <div className={item.delta >= 0 ? "text-xs text-emerald-600" : "text-xs text-rose-600"}>
                    {item.delta >= 0 ? "+" : ""}{item.delta.toFixed(1)}%
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Insight summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Leading metric" value={top?.title ?? "—"} />
            <Info label="Value" value={top ? top.value.toLocaleString() : "—"} />
            <Info label="Delta" value={top ? `${top.delta.toFixed(1)}%` : "—"} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Directional view</div>
            <svg viewBox="0 0 300 120" className="mt-4 h-28 w-full">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-slate-900 dark:text-white"
                points="10,85 40,78 70,70 100,64 130,55 160,62 190,52 220,44 250,36 290,28"
              />
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
