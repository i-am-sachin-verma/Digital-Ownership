import React, { useMemo, useState } from "react";

type Plan = "Starter" | "Pro" | "Enterprise";

type Subscription = {
  id: string;
  customer: string;
  plan: Plan;
  region: string;
  mrr: number;
  activeSeats: number;
  renewalInDays: number;
  churnRisk: "Low" | "Medium" | "High";
  startedAt: string;
  lastPaidAt: string;
};

type MonthPoint = { label: string; value: number };

const subscriptions: Subscription[] = [
  { id: "sub_01", customer: "Orbit Labs", plan: "Enterprise", region: "NA", mrr: 8600, activeSeats: 42, renewalInDays: 12, churnRisk: "Low", startedAt: "2025-01-08", lastPaidAt: "2026-05-01" },
  { id: "sub_02", customer: "ChainMint", plan: "Pro", region: "EU", mrr: 4200, activeSeats: 18, renewalInDays: 8, churnRisk: "Medium", startedAt: "2025-04-20", lastPaidAt: "2026-05-15" },
  { id: "sub_03", customer: "Nexus DAO", plan: "Pro", region: "APAC", mrr: 3900, activeSeats: 20, renewalInDays: 21, churnRisk: "Low", startedAt: "2024-12-12", lastPaidAt: "2026-04-27" },
  { id: "sub_04", customer: "LedgerFlow", plan: "Starter", region: "NA", mrr: 980, activeSeats: 6, renewalInDays: 5, churnRisk: "High", startedAt: "2025-10-04", lastPaidAt: "2026-05-10" },
  { id: "sub_05", customer: "BlockSphere", plan: "Enterprise", region: "EU", mrr: 11200, activeSeats: 56, renewalInDays: 29, churnRisk: "Low", startedAt: "2024-08-19", lastPaidAt: "2026-04-30" },
  { id: "sub_06", customer: "MintGrid", plan: "Starter", region: "APAC", mrr: 740, activeSeats: 4, renewalInDays: 2, churnRisk: "High", startedAt: "2025-09-13", lastPaidAt: "2026-05-13" }
];

const monthlyRevenue: MonthPoint[] = [
  { label: "Nov", value: 12400 }, { label: "Dec", value: 13200 }, { label: "Jan", value: 14100 },
  { label: "Feb", value: 15900 }, { label: "Mar", value: 17100 }, { label: "Apr", value: 18300 },
  { label: "May", value: 19820 }
];

const retentionCohorts = [
  { cohort: "Jan 2025", m1: 100, m3: 96, m6: 91, m12: 84 },
  { cohort: "Apr 2025", m1: 100, m3: 94, m6: 88, m12: 0 },
  { cohort: "Oct 2025", m1: 100, m3: 97, m6: 0, m12: 0 }
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function StatCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function RevenueBarChart({ data }: { data: MonthPoint[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recurring revenue trend</h3>
          <p className="text-sm text-slate-500">Monthly recurring revenue across the last 7 months.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Live sync</span>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-3">
        {data.map((item) => {
          const height = Math.max(24, (item.value / max) * 180);
          return (
            <div key={item.label} className="flex flex-col items-center justify-end">
              <div className="mb-2 text-xs font-medium text-slate-500">{formatMoney(item.value)}</div>
              <div className="flex h-48 w-full items-end justify-center rounded-xl bg-slate-50 p-2">
                <div className="w-full rounded-xl bg-slate-900" style={{ height }} />
              </div>
              <div className="mt-2 text-xs text-slate-600">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CohortTable() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Cohort retention</h3>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Cohort</th>
              <th className="px-4 py-3">M1</th>
              <th className="px-4 py-3">M3</th>
              <th className="px-4 py-3">M6</th>
              <th className="px-4 py-3">M12</th>
            </tr>
          </thead>
          <tbody>
            {retentionCohorts.map((row) => (
              <tr key={row.cohort} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{row.cohort}</td>
                <td className="px-4 py-3">{row.m1}%</td>
                <td className="px-4 py-3">{row.m3}%</td>
                <td className="px-4 py-3">{row.m6 ? `${row.m6}%` : "—"}</td>
                <td className="px-4 py-3">{row.m12 ? `${row.m12}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SubscriptionRevenueDashboard() {
  const [plan, setPlan] = useState<Plan | "All">("All");
  const [region, setRegion] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesPlan = plan === "All" || sub.plan === plan;
      const matchesRegion = region === "All" || sub.region === region;
      const matchesQuery = sub.customer.toLowerCase().includes(query.toLowerCase());
      return matchesPlan && matchesRegion && matchesQuery;
    });
  }, [plan, region, query]);

  const totalMRR = filtered.reduce((sum, sub) => sum + sub.mrr, 0);
  const annualized = totalMRR * 12;
  const avgSeats = filtered.length ? Math.round(filtered.reduce((sum, s) => sum + s.activeSeats, 0) / filtered.length) : 0;
  const highRisk = filtered.filter((s) => s.churnRisk === "High").length;
  const renewalsSoon = filtered.filter((s) => s.renewalInDays <= 14);

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-slate-300">Issue 41</p>
              <h1 className="mt-1 text-3xl font-bold">Subscription Revenue Analytics</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Track recurring revenue, churn risk, renewal timing, and cohort retention for a Web3 SaaS billing view.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[340px]">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-slate-300">Net MRR</p>
                <p className="mt-1 text-xl font-semibold">{formatMoney(totalMRR)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-slate-300">ARR</p>
                <p className="mt-1 text-xl font-semibold">{formatMoney(annualized)}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard title="Customers shown" value={`${filtered.length}`} hint="After filters are applied" />
          <StatCard title="Avg. active seats" value={`${avgSeats}`} hint="Seat utilization snapshot" />
          <StatCard title="High churn risk" value={`${highRisk}`} hint="Requires attention from CS" />
          <StatCard title="Renewals due in 14 days" value={`${renewalsSoon.length}`} hint="Priority renewal queue" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <RevenueBarChart data={monthlyRevenue} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Filters</h3>
            <div className="mt-4 space-y-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-slate-900"
              />
              <div className="grid grid-cols-2 gap-3">
                <select value={plan} onChange={(e) => setPlan(e.target.value as Plan | "All")} className="rounded-xl border border-slate-300 px-4 py-3">
                  <option>All</option>
                  <option>Starter</option>
                  <option>Pro</option>
                  <option>Enterprise</option>
                </select>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3">
                  <option>All</option>
                  <option>NA</option>
                  <option>EU</option>
                  <option>APAC</option>
                </select>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Use the renewal queue to prioritize high-risk accounts before the invoice date arrives.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Accounts</h3>
              <span className="text-sm text-slate-500">{filtered.length} results</span>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">MRR</th>
                    <th className="px-4 py-3">Renewal</th>
                    <th className="px-4 py-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.customer}</div>
                        <div className="text-xs text-slate-500">{row.region} • started {row.startedAt}</div>
                      </td>
                      <td className="px-4 py-3">{row.plan}</td>
                      <td className="px-4 py-3 font-medium">{formatMoney(row.mrr)}</td>
                      <td className="px-4 py-3">{row.renewalInDays} days</td>
                      <td className="px-4 py-3">
                        <span className={
                          row.churnRisk === "Low"
                            ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                            : row.churnRisk === "Medium"
                              ? "rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                              : "rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                        }>
                          {row.churnRisk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <CohortTable />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Renewal focus list</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {renewalsSoon.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.customer}</p>
                    <p className="text-sm text-slate-500">{item.plan} • {item.region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Renewal in</p>
                    <p className="text-xl font-bold">{item.renewalInDays}d</p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.max(20, 100 - item.renewalInDays * 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
