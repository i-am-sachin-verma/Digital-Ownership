import React, { useMemo, useState } from "react";

type Listing = {
  name: string;
  chain: string;
  price: number;
  seller: string;
  rating: number;
  sold: number;
};

const listings: Listing[] = [
  { name: "Ledger Cover", chain: "Ethereum", price: 0.42, seller: "0xA1B2", rating: 4.8, sold: 128 },
  { name: "DAO Hoodie", chain: "Polygon", price: 0.18, seller: "0xD4E5", rating: 4.6, sold: 244 },
  { name: "Genesis Badge", chain: "Arbitrum", price: 0.95, seller: "0xF6A7", rating: 4.9, sold: 96 },
  { name: "NFT Frame", chain: "Base", price: 0.27, seller: "0x1C2D", rating: 4.5, sold: 201 },
];

export default function MarketplacePanel() {
  const [chain, setChain] = useState("All");
  const [search, setSearch] = useState("");

  const chains = ["All", ...new Set(listings.map((item) => item.chain))];

  const rows = useMemo(() => {
    return listings.filter((item) => {
      const matchesChain = chain === "All" || item.chain === chain;
      const matchesSearch = `${item.name} ${item.seller}`.toLowerCase().includes(search.toLowerCase());
      return matchesChain && matchesSearch;
    });
  }, [chain, search]);

  const avgRating = rows.reduce((sum, item) => sum + item.rating, 0) / (rows.length || 1);

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Web3 Marketplace Seller Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Explore listings, seller performance, sales trends, and collection-level marketplace insights in one interface.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Listings" value={rows.length.toString()} />
          <Metric label="Avg rating" value={avgRating.toFixed(1)} />
          <Metric label="Selected chain" value={chain} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listing or seller"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          {chains.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((listing) => (
            <article key={`${listing.chain}-${listing.name}`} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{listing.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{listing.chain} • seller {listing.seller}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{listing.price} ETH</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{listing.sold} sold</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Seller insights</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Top seller" value={rows[0]?.seller ?? "—"} />
            <Info label="Most sold" value={rows.sort((a, b) => b.sold - a.sold)[0]?.name ?? "—"} />
            <Info label="Average price" value={rows.length ? `${(rows.reduce((s, i) => s + i.price, 0) / rows.length).toFixed(2)} ETH` : "—"} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Sales intensity</div>
            <div className="mt-4 space-y-3">
              {rows.map((listing) => {
                const pct = Math.min(100, listing.sold / 3);
                return (
                  <div key={listing.name}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{listing.name}</span>
                      <span>{listing.sold}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
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
