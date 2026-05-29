import React, { useMemo, useState } from "react";

type BorrowOffer = {
  protocol: string;
  collateralAsset: string;
  borrowAsset: string;
  rate: number;
  ltv: number;
  maxBorrow: number;
  health: number;
};

const offers: BorrowOffer[] = [
  { protocol: "Aave", collateralAsset: "ETH", borrowAsset: "USDC", rate: 4.2, ltv: 68, maxBorrow: 24000, health: 2.5 },
  { protocol: "Compound", collateralAsset: "WBTC", borrowAsset: "USDT", rate: 5.7, ltv: 60, maxBorrow: 150000, health: 2.1 },
  { protocol: "Spark", collateralAsset: "stETH", borrowAsset: "DAI", rate: 3.8, ltv: 72, maxBorrow: 41000, health: 1.9 },
];

function usd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function BorrowingInterface() {
  const [selected, setSelected] = useState(0);
  const [collateralAmount, setCollateralAmount] = useState(10);
  const offer = offers[selected];

  const maxAllowed = useMemo(() => collateralAmount * offer.ltv * 100, [collateralAmount, offer]);
  const effectiveBorrow = Math.min(maxAllowed, offer.maxBorrow);

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Borrowing Position Builder</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Compare borrowing offers, estimate safe borrow capacity, and review collateral impact before opening a debt position.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Offers" value={offers.length.toString()} />
          <Metric label="Rate" value={`${offer.rate.toFixed(1)}%`} />
          <Metric label="Max borrow" value={usd(effectiveBorrow)} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Collateral amount" value={collateralAmount} onChange={setCollateralAmount} />
            <Info label="Selected collateral" value={offer.collateralAsset} />
          </div>

          <div className="mt-5 space-y-3">
            {offers.map((item, index) => (
              <button
                key={item.protocol}
                onClick={() => setSelected(index)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  index === selected
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{item.protocol}</div>
                    <div className="text-xs opacity-75">{item.collateralAsset} → {item.borrowAsset}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{item.rate.toFixed(1)}% APR</div>
                    <div className="text-xs opacity-75">{item.ltv}% LTV</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Borrow asset" value={offer.borrowAsset} />
            <Info label="Borrow capacity" value={usd(effectiveBorrow)} />
            <Info label="Health factor" value={offer.health.toFixed(2)} />
            <Info label="Rate" value={`${offer.rate.toFixed(1)}% APR`} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Borrowing safety view</div>
            <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(100, offer.health * 35)}%` }} />
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              The bar reflects how much room exists before the loan becomes risky.
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

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
      />
    </label>
  );
}
