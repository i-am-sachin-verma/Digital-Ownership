import React, { useMemo, useState } from "react";

type TreasuryLine = {
  label: string;
  amount: number;
  kind: "asset" | "liability" | "runway";
  chain: string;
};

const lines: TreasuryLine[] = [
  { label: "USDC reserves", amount: 860000, kind: "asset", chain: "Ethereum" },
  { label: "ETH holdings", amount: 320, kind: "asset", chain: "Ethereum" },
  { label: "Pending grants", amount: 165000, kind: "liability", chain: "DAO" },
  { label: "Annual payroll runway", amount: 14, kind: "runway", chain: "Ops" },
  { label: "Liquidity buffer", amount: 210000, kind: "asset", chain: "Arbitrum" },
  { label: "Partner commitments", amount: 92000, kind: "liability", chain: "DAO" },
];

function usd(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function TreasuryForecast() {
  const [kind, setKind] = useState<"all" | TreasuryLine["kind"]>("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return lines.filter((line) => {
      const matchesKind = kind === "all" || line.kind === kind;
      const matchesSearch = `${line.label} ${line.chain} ${line.kind}`.toLowerCase().includes(search.toLowerCase());
      return matchesKind && matchesSearch;
    });
  }, [kind, search]);

  const assets = rows.filter((line) => line.kind === "asset").reduce((sum, line) => sum + line.amount, 0);
  const liabilities = rows.filter((line) => line.kind === "liability").reduce((sum, line) => sum + line.amount, 0);
  const runwayMonths = rows.find((line) => line.kind === "runway")?.amount ?? 0;
  const net = assets - liabilities;

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Blockchain Treasury Forecast Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Analyze treasury assets, obligations, runway, and budget headroom with a finance-focused Web3 view.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Net position" value={usd(net)} />
          <Stat label="Runway" value={`${runwayMonths} months`} />
          <Stat label="Entries" value={rows.length.toString()} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search label or chain"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All</option>
          <option value="asset">Assets</option>
          <option value="liability">Liabilities</option>
          <option value="runway">Runway</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((line) => (
            <article key={line.label} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{line.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{line.chain}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{line.kind === "runway" ? `${line.amount} mo` : usd(line.amount)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{line.kind}</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Forecast summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Assets" value={usd(assets)} />
            <Info label="Liabilities" value={usd(liabilities)} />
            <Info label="Net treasury" value={usd(net)} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Runway gauge</div>
            <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(100, runwayMonths * 7)}%` }} />
            </div>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              A higher runway means the treasury can sustain operations for longer without external funding.
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
