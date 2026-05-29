import React, { useMemo, useState } from "react";

type Launch = {
  name: string;
  token: string;
  price: number;
  targetRaise: number;
  raised: number;
  whitelist: boolean;
  unlock: string;
};

const launches: Launch[] = [
  { name: "Nova", token: "NOVA", price: 0.08, targetRaise: 500000, raised: 312000, whitelist: true, unlock: "30% TGE" },
  { name: "Orbit", token: "ORB", price: 0.14, targetRaise: 900000, raised: 780000, whitelist: false, unlock: "10% TGE" },
  { name: "Beacon", token: "BCN", price: 0.22, targetRaise: 750000, raised: 460000, whitelist: true, unlock: "20% TGE" },
];

export default function Launchpad() {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return launches.filter((item) =>
      `${item.name} ${item.token}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const launch = filtered[selected] ?? filtered[0];
  const progress = (launch.raised / launch.targetRaise) * 100;

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Token Launchpad Participation Interface</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Browse token sales, check whitelist rules, track funding progress, and inspect unlock conditions before joining a launch.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Launches" value={filtered.length.toString()} />
          <Metric label="Raised" value={`$${launch.raised.toLocaleString()}`} />
          <Metric label="Progress" value={`${progress.toFixed(1)}%`} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search launch"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {filtered.map((item, index) => (
            <button
              key={item.name}
              onClick={() => setSelected(index)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                index === selected
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">{item.token}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">${item.raised.toLocaleString()}</div>
                  <div className="text-xs opacity-75">{item.whitelist ? "Whitelist" : "Open sale"}</div>
                </div>
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {launch ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Token" value={launch.token} />
                <Info label="Price" value={`$${launch.price.toFixed(2)}`} />
                <Info label="Target raise" value={`$${launch.targetRaise.toLocaleString()}`} />
                <Info label="Unlock" value={launch.unlock} />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                <div className="flex items-center justify-between text-sm">
                  <span>Funding progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  {launch.whitelist ? "This sale requires whitelist access." : "This sale is open to all eligible participants."}
                </div>
              </div>
            </>
          ) : null}
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
