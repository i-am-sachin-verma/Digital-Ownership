import React, { useMemo, useState } from "react";

type Validator = {
  id: string;
  name: string;
  chain: string;
  uptime: number;
  commission: number;
  rewards24h: number;
  slashRisk: "Low" | "Medium" | "High";
  delegators: number;
  missedBlocks: number;
};

const validators: Validator[] = [
  { id: "val_1", name: "North Star", chain: "Cosmos", uptime: 99.92, commission: 4, rewards24h: 1240, slashRisk: "Low", delegators: 4800, missedBlocks: 1 },
  { id: "val_2", name: "Anchor Grid", chain: "Polkadot", uptime: 99.71, commission: 6, rewards24h: 980, slashRisk: "Low", delegators: 3110, missedBlocks: 3 },
  { id: "val_3", name: "Signal Forge", chain: "Solana", uptime: 98.88, commission: 7, rewards24h: 1530, slashRisk: "Medium", delegators: 6200, missedBlocks: 12 },
  { id: "val_4", name: "Ledger Halo", chain: "Ethereum", uptime: 99.48, commission: 5, rewards24h: 760, slashRisk: "Medium", delegators: 2100, missedBlocks: 7 },
  { id: "val_5", name: "Orbit Node", chain: "Cosmos", uptime: 99.99, commission: 3, rewards24h: 2100, slashRisk: "Low", delegators: 8800, missedBlocks: 0 },
  { id: "val_6", name: "Blue Peak", chain: "Polkadot", uptime: 97.95, commission: 8, rewards24h: 640, slashRisk: "High", delegators: 1450, missedBlocks: 18 }
];

const uptimeHistory = [
  { day: "Mon", avg: 99.4 },
  { day: "Tue", avg: 99.2 },
  { day: "Wed", avg: 99.0 },
  { day: "Thu", avg: 98.9 },
  { day: "Fri", avg: 99.1 },
  { day: "Sat", avg: 99.3 },
  { day: "Sun", avg: 99.5 }
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
}

function pill(risk: Validator["slashRisk"]) {
  if (risk === "Low") return "bg-emerald-50 text-emerald-700";
  if (risk === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function UptimeSpark({ data }: { data: typeof uptimeHistory }) {
  const max = Math.max(...data.map((d) => d.avg));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Network uptime trend</h3>
      <p className="mt-1 text-sm text-slate-500">Weekly aggregate uptime across the selected validator set.</p>
      <div className="mt-6 grid grid-cols-7 gap-3">
        {data.map((item) => {
          const h = Math.max(20, (item.avg / max) * 180);
          return (
            <div key={item.day} className="flex flex-col items-center">
              <div className="mb-2 text-xs text-slate-500">{item.avg.toFixed(2)}%</div>
              <div className="flex h-52 w-full items-end rounded-xl bg-slate-50 p-2">
                <div className="w-full rounded-xl bg-slate-900" style={{ height: h }} />
              </div>
              <div className="mt-2 text-xs font-medium text-slate-600">{item.day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ValidatorPerformanceDashboard() {
  const [chain, setChain] = useState("All");
  const [sortBy, setSortBy] = useState<"uptime" | "rewards" | "delegators">("uptime");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const result = validators.filter((v) => {
      const chainMatch = chain === "All" || v.chain === chain;
      const textMatch = v.name.toLowerCase().includes(query.toLowerCase());
      return chainMatch && textMatch;
    });

    return [...result].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [chain, sortBy, query]);

  const averageUptime = filtered.length
    ? filtered.reduce((sum, v) => sum + v.uptime, 0) / filtered.length
    : 0;
  const averageCommission = filtered.length
    ? filtered.reduce((sum, v) => sum + v.commission, 0) / filtered.length
    : 0;
  const risky = filtered.filter((v) => v.slashRisk === "High").length;
  const topRewards = filtered.reduce((sum, v) => sum + v.rewards24h, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
          <p className="text-sm text-slate-300">Issue 43</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Validator Performance Dashboard</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Compare uptime, rewards, commissions, delegator count, and slashing exposure before choosing where to delegate.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-sm text-slate-300">Validators shown</p>
              <p className="text-xl font-semibold">{filtered.length}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric title="Average uptime" value={`${averageUptime.toFixed(2)}%`} detail="Filtered validator set" />
          <Metric title="Average commission" value={`${averageCommission.toFixed(1)}%`} detail="Current fee take rate" />
          <Metric title="24h rewards" value={formatCurrency(topRewards)} detail="Combined daily reward output" />
          <Metric title="High slash risk" value={`${risky}`} detail="Needs closer inspection" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <UptimeSpark data={uptimeHistory} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Filters and sorting</h3>
            <div className="mt-4 space-y-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search validator..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <select value={chain} onChange={(e) => setChain(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option>All</option>
                <option>Cosmos</option>
                <option>Polkadot</option>
                <option>Solana</option>
                <option>Ethereum</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option value="uptime">Sort by uptime</option>
                <option value="rewards">Sort by rewards</option>
                <option value="delegators">Sort by delegators</option>
              </select>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Delegators can use the uptime and risk numbers together, not in isolation, to evaluate validator reliability.
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Validator ranking</h3>
            <span className="text-sm text-slate-500">Sorted by {sortBy}</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Validator</th>
                  <th className="px-4 py-3">Uptime</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Delegators</th>
                  <th className="px-4 py-3">24h Rewards</th>
                  <th className="px-4 py-3">Risk</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="text-xs text-slate-500">{row.chain} • {row.missedBlocks} missed blocks</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{row.uptime.toFixed(2)}%</td>
                    <td className="px-4 py-3">{row.commission}%</td>
                    <td className="px-4 py-3">{formatCurrency(row.delegators)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.rewards24h)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${pill(row.slashRisk)}`}>{row.slashRisk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {filtered.map((row) => (
            <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">{row.name}</h4>
                  <p className="text-sm text-slate-500">{row.chain}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${pill(row.slashRisk)}`}>{row.slashRisk}</span>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span><span>{row.uptime.toFixed(2)}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: `${row.uptime}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Delegators</span><span>{formatCurrency(row.delegators)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-slate-700" style={{ width: `${Math.min(100, row.delegators / 100)}%` }} />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  Rewards last 24h: <span className="font-semibold text-slate-900">{formatCurrency(row.rewards24h)}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
