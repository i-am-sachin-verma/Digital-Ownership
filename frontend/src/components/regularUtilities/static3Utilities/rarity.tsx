import React, { useMemo, useState } from "react";

type Trait = {
  name: string;
  rarity: number;
  count: number;
};

type Item = {
  id: number;
  name: string;
  score: number;
  floor: number;
  traits: Trait[];
};

const items: Item[] = [
  {
    id: 1,
    name: "Alpha #120",
    score: 96,
    floor: 12.4,
    traits: [
      { name: "Laser Eyes", rarity: 1.2, count: 12 },
      { name: "Gold Fur", rarity: 2.1, count: 21 },
      { name: "Crown", rarity: 0.8, count: 8 },
    ],
  },
  {
    id: 2,
    name: "Alpha #844",
    score: 81,
    floor: 4.9,
    traits: [
      { name: "Blue Hat", rarity: 8.4, count: 84 },
      { name: "Smile", rarity: 15.6, count: 156 },
      { name: "Neon BG", rarity: 3.3, count: 33 },
    ],
  },
  {
    id: 3,
    name: "Alpha #204",
    score: 74,
    floor: 3.2,
    traits: [
      { name: "Silver Fur", rarity: 4.7, count: 47 },
      { name: "Beard", rarity: 12.2, count: 122 },
      { name: "Star Jacket", rarity: 2.9, count: 29 },
    ],
  },
];

export default function RarityDashboard() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);

  const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [search]);
  const asset = filtered[selected] ?? filtered[0];
  const averageRarity = asset.traits.reduce((sum, trait) => sum + trait.rarity, 0) / asset.traits.length;
  const rankBucket = asset.score >= 90 ? "Top tier" : asset.score >= 80 ? "Strong" : "Average";

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">NFT Rarity Analytics Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Rank traits, inspect rarity distribution, and compare item-level scores against collection expectations.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Items" value={filtered.length.toString()} />
          <Stat label="Score" value={asset.score.toString()} />
          <Stat label="Bucket" value={rankBucket} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search NFT"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {filtered.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelected(index)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${index === selected ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">Floor {item.floor} ETH</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{item.score}</div>
                  <div className="text-xs opacity-75">rarity score</div>
                </div>
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Selected" value={asset.name} />
            <Info label="Floor" value={`${asset.floor} ETH`} />
            <Info label="Avg trait rarity" value={`${averageRarity.toFixed(2)}%`} />
            <Info label="Score bucket" value={rankBucket} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Trait breakdown</div>
            <div className="mt-4 space-y-3">
              {asset.traits.map((trait) => (
                <div key={trait.name}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{trait.name}</span>
                    <span>{trait.rarity}% rarity</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.max(4, 100 - trait.rarity * 8)}%` }} />
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
