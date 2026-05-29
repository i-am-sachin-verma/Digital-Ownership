import React, { useMemo, useState } from "react";

type MintTier = {
  name: string;
  supply: number;
  minted: number;
  price: number;
  limit: number;
};

const tiers: MintTier[] = [
  { name: "Whitelist", supply: 2000, minted: 1460, price: 0.06, limit: 2 },
  { name: "Public", supply: 4000, minted: 2810, price: 0.09, limit: 4 },
  { name: "Partner", supply: 800, minted: 530, price: 0.04, limit: 3 },
];

export default function MintingWizard() {
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);
  const [phase, setPhase] = useState<"select" | "review" | "confirm">("select");

  const tier = tiers[selected];
  const remaining = tier.supply - tier.minted;
  const totalCost = tier.price * qty;
  const canMint = qty <= tier.limit && qty <= remaining;

  const progress = useMemo(() => (tier.minted / tier.supply) * 100, [tier]);

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">NFT Minting Wizard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Guide the user through mint tier selection, supply checks, quantity review, and final mint confirmation.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Supply" value={`${tier.minted}/${tier.supply}`} />
          <Stat label="Price" value={`${tier.price.toFixed(2)} ETH`} />
          <Stat label="Phase" value={phase} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="space-y-3">
            {tiers.map((item, index) => (
              <button
                key={item.name}
                onClick={() => setSelected(index)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  index === selected ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.price.toFixed(2)} ETH • limit {item.limit}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{item.minted}/{item.supply}</div>
                    <div className="text-xs opacity-75">{remaining} left</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Quantity" value={qty} onChange={setQty} />
            <Info label="Eligibility" value={canMint ? "Mint allowed" : "Check supply or limit"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="flex items-center justify-between text-sm">
              <span>Supply usage</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Mint summary</div>
            <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{tier.name}</div>
            <div className="mt-3 grid gap-3">
              <Info label="Selected tier" value={tier.name} />
              <Info label="Requested qty" value={qty.toString()} />
              <Info label="Total cost" value={`${totalCost.toFixed(2)} ETH`} />
              <Info label="Remaining supply" value={remaining.toString()} />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setPhase("review")}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              Review
            </button>
            <button
              onClick={() => setPhase("confirm")}
              disabled={!canMint}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-slate-900"
            >
              Mint now
            </button>
          </div>

          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Keep the phase flow explicit so the user always knows whether they are selecting, reviewing, or confirming the mint.
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
    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
      />
    </label>
  );
}
