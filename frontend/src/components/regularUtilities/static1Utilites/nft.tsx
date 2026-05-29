import React, { useMemo, useState } from "react";

type Collection = {
  name: string;
  floor: number;
  volume: number;
  holders: number;
  trend: number;
  market: string;
};

const collections: Collection[] = [
  { name: "Azuki", floor: 7.2, volume: 1820, holders: 5580, trend: 4.2, market: "Blur" },
  { name: "BAYC", floor: 15.4, volume: 1980, holders: 5890, trend: -1.8, market: "OpenSea" },
  { name: "Pudgy Penguins", floor: 5.1, volume: 2310, holders: 6110, trend: 2.5, market: "Blur" },
  { name: "Moonbirds", floor: 1.9, volume: 870, holders: 2250, trend: 6.1, market: "OpenSea" },
  { name: "MAYC", floor: 3.7, volume: 940, holders: 5290, trend: 1.4, market: "Blur" },
];

export default function NFTAnalytics() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"floor" | "volume" | "holders" | "trend">("floor");

  const rows = useMemo(() => {
    const filtered = collections.filter((collection) => collection.name.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "volume":
          return b.volume - a.volume;
        case "holders":
          return b.holders - a.holders;
        case "trend":
          return b.trend - a.trend;
        default:
          return b.floor - a.floor;
      }
    });
  }, [query, sort]);

  const top = rows[0];

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">NFT Collection Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Track floor price movement, sales volume, holder concentration, and market venue differences in one responsive dashboard.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Collections" value={String(rows.length)} />
          <Stat label="Top floor" value={top ? `${top.floor} ETH` : "—"} />
          <Stat label="Top trend" value={top ? `${top.trend.toFixed(1)}%` : "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search collection"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
          <option value="floor">Sort by floor</option>
          <option value="volume">Sort by volume</option>
          <option value="holders">Sort by holders</option>
          <option value="trend">Sort by trend</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((collection) => (
            <div key={collection.name} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{collection.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{collection.market} primary market</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{collection.floor} ETH</div>
                  <div className={collection.trend >= 0 ? "text-xs text-emerald-600" : "text-xs text-rose-600"}>
                    {collection.trend >= 0 ? "+" : ""}{collection.trend.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Analytics panel</h2>

          <div className="mt-4 grid gap-3">
            <Info label="Collection" value={top?.name ?? "—"} />
            <Info label="Floor" value={top ? `${top.floor} ETH` : "—"} />
            <Info label="Volume" value={top ? `${top.volume.toLocaleString()} ETH` : "—"} />
            <Info label="Holders" value={top ? top.holders.toLocaleString() : "—"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Trend overview</div>
            <svg viewBox="0 0 300 120" className="mt-4 h-28 w-full">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-slate-900 dark:text-white"
                points="10,90 40,70 70,74 100,55 130,52 160,44 190,50 220,34 250,30 290,24"
              />
            </svg>
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
      <div className="mt-1 font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
