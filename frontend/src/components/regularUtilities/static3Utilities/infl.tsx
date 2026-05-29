import React, { useMemo, useState } from "react";

type Phase = "Genesis" | "Expansion" | "Stability" | "Deflationary";

type SchedulePoint = {
  month: string;
  supply: number;
  emissions: number;
  burns: number;
};

type Event = {
  date: string;
  label: string;
  amount: number;
  type: "Emission" | "Burn" | "Unlock";
};

const schedule: SchedulePoint[] = [
  { month: "Jan", supply: 10000000, emissions: 110000, burns: 22000 },
  { month: "Feb", supply: 10088000, emissions: 118000, burns: 25000 },
  { month: "Mar", supply: 10177000, emissions: 121000, burns: 27000 },
  { month: "Apr", supply: 10271000, emissions: 126000, burns: 29000 },
  { month: "May", supply: 10368000, emissions: 132000, burns: 32000 },
  { month: "Jun", supply: 10474000, emissions: 136000, burns: 36000 },
  { month: "Jul", supply: 10580000, emissions: 140000, burns: 41000 }
];

const events: Event[] = [
  { date: "2026-05-02", label: "Community rewards emission", amount: 42000, type: "Emission" },
  { date: "2026-05-07", label: "Treasury burn from buyback", amount: 18000, type: "Burn" },
  { date: "2026-05-12", label: "Team vesting unlock", amount: 60000, type: "Unlock" },
  { date: "2026-05-20", label: "Protocol fee burn", amount: 9000, type: "Burn" },
  { date: "2026-05-26", label: "Liquidity mining release", amount: 51000, type: "Emission" }
];

const phaseMap: Record<Phase, string> = {
  Genesis: "Aggressive distribution with bootstrap incentives",
  Expansion: "Supply growth driven by ecosystem expansion",
  Stability: "Emissions and burns are balanced",
  Deflationary: "Burn pressure outweighs fresh issuance"
};

function formatNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function badgeStyle(type: Event["type"]) {
  if (type === "Burn") return "bg-rose-50 text-rose-700";
  if (type === "Unlock") return "bg-violet-50 text-violet-700";
  return "bg-emerald-50 text-emerald-700";
}

function Card({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function SupplyChart({ data }: { data: SchedulePoint[] }) {
  const max = Math.max(...data.map((d) => d.supply));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Circulating supply</h3>
      <p className="mt-1 text-sm text-slate-500">Supply trend versus emissions and burns.</p>
      <div className="mt-6 grid grid-cols-7 gap-3">
        {data.map((item) => {
          const barHeight = Math.max(28, (item.supply / max) * 190);
          return (
            <div key={item.month} className="flex flex-col items-center justify-end">
              <div className="mb-2 text-xs text-slate-500">{formatNum(item.supply)}</div>
              <div className="flex h-52 w-full items-end rounded-xl bg-slate-50 p-2">
                <div className="w-full rounded-xl bg-gradient-to-t from-slate-800 to-slate-500" style={{ height: barHeight }} />
              </div>
              <div className="mt-2 text-xs font-medium text-slate-600">{item.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TokenInflationMonitor() {
  const [phase, setPhase] = useState<Phase>("Expansion");
  const [showBurnsOnly, setShowBurnsOnly] = useState(false);

  const filteredEvents = useMemo(() => {
    return showBurnsOnly ? events.filter((e) => e.type === "Burn") : events;
  }, [showBurnsOnly]);

  const currentSupply = schedule[schedule.length - 1].supply;
  const totalEmissions = schedule.reduce((sum, row) => sum + row.emissions, 0);
  const totalBurns = schedule.reduce((sum, row) => sum + row.burns, 0);
  const netMinted = totalEmissions - totalBurns;
  const inflationRate = (netMinted / schedule[0].supply) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
          <p className="text-sm text-slate-300">Issue 42</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Token Inflation Monitoring</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Track emissions, burns, unlocks, and the net supply story in a single monitoring dashboard.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-sm text-slate-300">Current phase</p>
              <p className="text-xl font-semibold">{phase}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card title="Current supply" value={formatNum(currentSupply)} detail="Latest circulating total" />
          <Card title="Total emissions" value={formatNum(totalEmissions)} detail="Modeled issuance in window" />
          <Card title="Total burns" value={formatNum(totalBurns)} detail="Fee burn and buyback effects" />
          <Card title="Net inflation" value={`${inflationRate.toFixed(2)}%`} detail="Net new supply against base" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <SupplyChart data={schedule} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Controls</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Phase selector</label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as Phase)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  {Object.keys(phaseMap).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-slate-500">{phaseMap[phase]}</p>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input type="checkbox" checked={showBurnsOnly} onChange={(e) => setShowBurnsOnly(e.target.checked)} />
                <span className="text-sm font-medium">Show only burn events</span>
              </label>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Use burns and vesting unlocks to compare net inflation versus headline emissions.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Event feed</h3>
            <div className="mt-4 space-y-3">
              {filteredEvents.map((item) => (
                <div key={`${item.date}-${item.label}`} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.date}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeStyle(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Amount</span>
                    <span className="font-semibold">{formatNum(item.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Projection and signal</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Base emission share</p>
                <p className="mt-2 text-2xl font-bold">{((totalEmissions / currentSupply) * 100).toFixed(2)}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Burn coverage</p>
                <p className="mt-2 text-2xl font-bold">{((totalBurns / totalEmissions) * 100).toFixed(2)}%</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Next unlock window</p>
                <p className="mt-2 text-2xl font-bold">6 days</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Risk level</p>
                <p className="mt-2 text-2xl font-bold text-amber-600">Moderate</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              Interpretation: supply is still growing, but protocol burns are reducing net inflation. If burns expand faster than unlocks, the token can shift toward stability.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
