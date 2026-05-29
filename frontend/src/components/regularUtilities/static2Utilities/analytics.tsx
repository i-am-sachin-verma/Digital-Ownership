import React, { useMemo, useState } from "react";

type Row = {
  name: string;
  value: number;
  change: number;
  category: string;
};

const rows: Row[] = [
  { name: "Daily active wallets", value: 42800, change: 6.4, category: "users" },
  { name: "Contract interactions", value: 188000, change: 3.2, category: "activity" },
  { name: "Protocol TVL", value: 142000000, change: -1.1, category: "defi" },
  { name: "NFT traders", value: 9800, change: 8.9, category: "nft" },
  { name: "Delegates active", value: 1240, change: 4.0, category: "governance" },
];

export default function AnalyticsHub() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesCategory = category === "all" || row.category === category;
      const matchesQuery = row.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const categories = ["all", ...new Set(rows.map((row) => row.category))];
  const total = filtered.reduce((sum, row) => sum + row.value, 0);
  const best = [...filtered].sort((a, b) => b.change - a.change)[0];

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Web3 Analytics Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Monitor protocol-level metrics, user activity, and ecosystem growth using a filterable KPI dashboard.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Metrics" value={filtered.length.toString()} />
          <Metric label="Total" value={total.toLocaleString()} />
          <Metric label="Top change" value={best ? `${best.change.toFixed(1)}%` : "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search metric"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {filtered.map((row) => (
            <article key={row.name} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{row.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{row.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{row.value.toLocaleString()}</div>
                  <div className={row.change >= 0 ? "text-xs text-emerald-600" : "text-xs text-rose-600"}>
                    {row.change >= 0 ? "+" : ""}{row.change.toFixed(1)}%
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Metric count" value={String(filtered.length)} />
            <Info label="Best performer" value={best ? best.name : "—"} />
            <Info label="Category" value={category} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Relative contribution</div>
            <div className="mt-4 space-y-3">
              {filtered.map((row) => {
                const pct = total ? (row.value / total) * 100 : 0;
                return (
                  <div key={row.name}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{row.name}</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${pct}%` }} />
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
