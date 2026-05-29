import React, { useMemo, useState } from "react";

type TreasuryAsset = {
  symbol: string;
  category: "stable" | "native" | "liquid";
  amount: number;
  price: number;
  chain: string;
};

const assets: TreasuryAsset[] = [
  { symbol: "USDC", category: "stable", amount: 860000, price: 1, chain: "Ethereum" },
  { symbol: "ETH", category: "native", amount: 320, price: 3650, chain: "Ethereum" },
  { symbol: "OP", category: "native", amount: 54000, price: 2.65, chain: "Optimism" },
  { symbol: "MATIC", category: "native", amount: 68000, price: 0.74, chain: "Polygon" },
  { symbol: "DAI", category: "stable", amount: 240000, price: 1, chain: "Arbitrum" },
  { symbol: "stETH", category: "liquid", amount: 190, price: 3600, chain: "Ethereum" },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value >= 1000 ? 0 : 2 }).format(value);
}

export default function TreasuryAnalytics() {
  const [category, setCategory] = useState<"all" | TreasuryAsset["category"]>("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCategory = category === "all" || asset.category === category;
      const matchesSearch = `${asset.symbol} ${asset.category} ${asset.chain}`.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const totalValue = rows.reduce((sum, asset) => sum + asset.amount * asset.price, 0);
  const stableValue = rows.filter((asset) => asset.category === "stable").reduce((sum, asset) => sum + asset.amount * asset.price, 0);
  const nativeValue = rows.filter((asset) => asset.category === "native").reduce((sum, asset) => sum + asset.amount * asset.price, 0);
  const liquidValue = rows.filter((asset) => asset.category === "liquid").reduce((sum, asset) => sum + asset.amount * asset.price, 0);

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">DAO Treasury Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Track treasury value, asset mix, chain exposure, and liquidity composition in a single financial operations dashboard.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Treasury value" value={money(totalValue)} />
          <Metric label="Stable assets" value={money(stableValue)} />
          <Metric label="Liquid assets" value={money(liquidValue)} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search asset, chain, or category"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All categories</option>
          <option value="stable">Stable</option>
          <option value="native">Native</option>
          <option value="liquid">Liquid</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((asset) => (
            <article key={`${asset.chain}-${asset.symbol}`} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{asset.symbol}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{asset.chain} • {asset.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{money(asset.amount * asset.price)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{asset.amount.toLocaleString()}</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Treasury allocation</h2>

          <div className="mt-4 grid gap-3">
            <Info label="Stable allocation" value={`${((stableValue / totalValue) * 100 || 0).toFixed(1)}%`} />
            <Info label="Native allocation" value={`${((nativeValue / totalValue) * 100 || 0).toFixed(1)}%`} />
            <Info label="Liquid allocation" value={`${((liquidValue / totalValue) * 100 || 0).toFixed(1)}%`} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Composition bar</div>
            <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="flex h-4">
                <div className="bg-emerald-500" style={{ width: `${(stableValue / totalValue) * 100 || 0}%` }} />
                <div className="bg-slate-900 dark:bg-white" style={{ width: `${(nativeValue / totalValue) * 100 || 0}%` }} />
                <div className="bg-indigo-500" style={{ width: `${(liquidValue / totalValue) * 100 || 0}%` }} />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              This layout gives DAOs a quick view of treasury diversification and where capital is sitting on-chain.
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
