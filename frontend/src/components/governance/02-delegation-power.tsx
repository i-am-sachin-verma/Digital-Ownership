
import { useMemo, useState } from "react";

type DelegationPowerItem = {
  id: string;
  name: string;
  price: number;
  rarity: number;
  chain: string;
  featured: boolean;
  listed: boolean;
};

const DelegationPowerItems: DelegationPowerItem[] = [
  { id: "i1", name: "Delegation Alpha", price: 14.2, rarity: 94, chain: "Base", featured: true, listed: true },
  { id: "i2", name: "Voting Prime", price: 9.8, rarity: 81, chain: "Ethereum", featured: false, listed: true },
  { id: "i3", name: "Power Core", price: 31.5, rarity: 76, chain: "Polygon", featured: true, listed: false },
  { id: "i4", name: "Explorer Vault", price: 5.4, rarity: 88, chain: "Arbitrum", featured: false, listed: true },
  { id: "i5", name: "Wallet Signal", price: 18.9, rarity: 90, chain: "Optimism", featured: true, listed: true },
  { id: "i6", name: "Based Drift", price: 22.3, rarity: 73, chain: "Base", featured: false, listed: false },
];

function sortItems(items: DelegationPowerItem[], mode: "price" | "rarity" | "featured") {
  const copy = [...items];
  if (mode === "price") return copy.sort((a, b) => a.price - b.price);
  if (mode === "rarity") return copy.sort((a, b) => b.rarity - a.rarity);
  return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
}

function browserTone(value: boolean) {
  return value ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600";
}

function MetricTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ItemCard({
  item,
}: {
  item: DelegationPowerItem;
}) {
  return (
    <article className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{item.chain}</p>
        </div>
        <span className={"rounded-full px-3 py-1 text-xs font-medium " + browserTone(item.featured)}>
          {item.featured ? "featured" : "standard"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
        <MetricTile label="Price" value={`${item.price.toFixed(1)} ETH`} />
        <MetricTile label="Rarity" value={`${item.rarity}`} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={"rounded-full px-3 py-1 text-xs font-medium " + browserTone(item.listed)}>
          {item.listed ? "listed" : "hidden"}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          id {item.id}
        </span>
      </div>
    </article>
  );
}

function FilterRail({
  chains,
  active,
  onChange,
}: {
  chains: string[];
  active: string;
  onChange: (chain: string) => void;
}) {
  return (
    <aside className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Chains</h3>
      <button
        type="button"
        onClick={() => onChange("all")}
        className={"rounded-full px-4 py-2 text-left text-sm font-medium " + (active === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")}
      >
        All chains
      </button>
      {chains.map((chain) => (
        <button
          key={chain}
          type="button"
          onClick={() => onChange(chain)}
          className={"rounded-full px-4 py-2 text-left text-sm font-medium " + (active === chain ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")}
        >
          {chain}
        </button>
      ))}
    </aside>
  );
}

export default function DelegationPower() {
  const [sort, setSort] = useState<"price" | "rarity" | "featured">("featured");
  const [chain, setChain] = useState<string>("all");
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [showOnlyListed, setShowOnlyListed] = useState(false);

  const visible = useMemo(() => {
    return sortItems(
      DelegationPowerItems.filter((item) => {
        if (chain !== "all" && item.chain !== chain) return false;
        if (showOnlyFeatured && !item.featured) return false;
        if (showOnlyListed && !item.listed) return false;
        return true;
      }),
      sort
    );
  }, [sort, chain, showOnlyFeatured, showOnlyListed]);

  const chains = useMemo(() => {
    return Array.from(new Set(DelegationPowerItems.map((item) => item.chain)));
  }, []);

  const chainCounts = useMemo(() => {
    return visible.reduce<Record<string, number>>((acc, item) => {
      acc[item.chain] = (acc[item.chain] ?? 0) + 1;
      return acc;
    }, {});
  }, [visible]);

  const featuredCount = useMemo(() => visible.filter((item) => item.featured).length, [visible]);

  return (
    <section className="mx-auto grid max-w-7xl gap-6 p-6">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Marketplace browser</p>
        <h2 className="text-2xl font-semibold text-slate-900">"Develop a Delegation Voting Power Explorer with Wallet-Based Token Snapshot Visualization"</h2>
        <p className="max-w-4xl text-sm text-slate-600">"Create a governance view that displays delegated voting power, token ownership snapshots, and voting eligibility in a clear interface. * Show wallet-connected voting power data * Visualize token snapshot distribution * Highlight active delegates and delegators * Handle empty and loading states gracefully * Keep the layout adaptable for mobile and desktop"</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Visible</p>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{visible.length}</div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Featured</p>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{featuredCount}</div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chains</p>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{chains.length}</div>
        </article>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["featured", "price", "rarity"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSort(option)}
            className={
              "rounded-full px-4 py-2 text-sm font-medium transition " +
              (sort === option ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")
            }
          >
            {option}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowOnlyFeatured((value) => !value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          {showOnlyFeatured ? "All items" : "Featured only"}
        </button>
        <button
          type="button"
          onClick={() => setShowOnlyListed((value) => !value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          {showOnlyListed ? "Show hidden" : "Listed only"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <FilterRail chains={chains} active={chain} onChange={setChain} />

        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {Object.keys(chainCounts).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setChain(value)}
                className={"rounded-full px-4 py-2 text-sm font-medium " + (chain === value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")}
              >
                {value} · {chainCounts[value]}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
              No assets matched the current filter state. Try another chain, sort order, or list mode.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
