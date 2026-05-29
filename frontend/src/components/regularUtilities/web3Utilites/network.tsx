import React, { useMemo, useState } from "react";

type NetworkStat = {
  name: string;
  blockTime: number;
  tps: number;
  health: number;
  alerts: number;
};

const stats: NetworkStat[] = [
  { name: "Ethereum", blockTime: 12.1, tps: 14.3, health: 96, alerts: 1 },
  { name: "Arbitrum", blockTime: 0.3, tps: 31.8, health: 99, alerts: 0 },
  { name: "Optimism", blockTime: 2.0, tps: 26.7, health: 97, alerts: 2 },
  { name: "Polygon", blockTime: 2.1, tps: 38.4, health: 93, alerts: 3 },
  { name: "Base", blockTime: 2.3, tps: 29.1, health: 98, alerts: 0 },
];

export default function NetworkHealthDashboard() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"health" | "tps" | "alerts">("health");

  const rows = useMemo(() => {
    return [...stats]
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === "tps") return b.tps - a.tps;
        if (sort === "alerts") return a.alerts - b.alerts;
        return b.health - a.health;
      });
  }, [search, sort]);

  const best = rows[0];
  const totalAlerts = rows.reduce((sum, item) => sum + item.alerts, 0);

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Blockchain Network Health Monitoring</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Track block times, throughput, health status, and open alerts across major networks in a single monitoring view.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Networks" value={rows.length.toString()} />
          <Stat label="Alerts" value={totalAlerts.toString()} />
          <Stat label="Top health" value={best ? `${best.health}%` : "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search network"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="health">Sort by health</option>
          <option value="tps">Sort by TPS</option>
          <option value="alerts">Sort by alerts</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((network) => (
            <article key={network.name} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{network.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{network.blockTime.toFixed(1)} sec block time</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{network.health}% health</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{network.alerts} alerts</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Operational summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Best network" value={best?.name ?? "—"} />
            <Info label="Fastest TPS" value={rows[0] ? `${rows[0].tps.toFixed(1)} TPS` : "—"} />
            <Info label="Open alerts" value={String(totalAlerts)} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Health bars</div>
            <div className="mt-4 space-y-3">
              {rows.map((network) => (
                <div key={network.name}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{network.name}</span>
                    <span>{network.health}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${network.health}%` }} />
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
