import React, { useMemo, useState } from "react";

type Route = {
  venue: string;
  output: number;
  feeUsd: number;
  slippage: number;
  liquidity: number;
};

const routes: Route[] = [
  { venue: "Uniswap", output: 1.982, feeUsd: 12.4, slippage: 0.24, liquidity: 82 },
  { venue: "1inch", output: 1.995, feeUsd: 13.2, slippage: 0.11, liquidity: 89 },
  { venue: "CowSwap", output: 1.998, feeUsd: 11.8, slippage: 0.08, liquidity: 78 },
  { venue: "SushiSwap", output: 1.973, feeUsd: 10.6, slippage: 0.31, liquidity: 71 },
];

export default function SwapOptimizer() {
  const [inputAmount, setInputAmount] = useState(1);
  const [inputToken, setInputToken] = useState("ETH");
  const [outputToken, setOutputToken] = useState("USDC");

  const best = useMemo(() => [...routes].sort((a, b) => b.output - a.output)[0], []);
  const estimatedOut = (best.output * inputAmount).toFixed(4);

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Advanced Token Swap Interface</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Compare routes across multiple DEX venues, preview price impact, and highlight the best execution path before approval.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Routes" value={routes.length.toString()} />
          <Metric label="Best output" value={best.output.toFixed(4)} />
          <Metric label="Fee" value={`$${best.feeUsd.toFixed(2)}`} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Input token" value={inputToken} onChange={setInputToken} />
            <Field label="Output token" value={outputToken} onChange={setOutputToken} />
            <NumberField label="Input amount" value={inputAmount} onChange={setInputAmount} />
          </div>

          <div className="mt-5 space-y-3">
            {routes.map((route) => (
              <article key={route.venue} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{route.venue}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Liquidity score {route.liquidity}/100</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{(route.output * inputAmount).toFixed(4)}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{route.slippage.toFixed(2)}% slippage</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Routing fee ${route.feeUsd.toFixed(2)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Best route</div>
            <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{best.venue}</div>
            <div className="mt-3 grid gap-3 text-sm">
              <Info label="Expected output" value={estimatedOut} />
              <Info label="Fee estimate" value={`$${best.feeUsd.toFixed(2)}`} />
              <Info label="Slippage" value={`${best.slippage.toFixed(2)}%`} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Route quality</div>
            <div className="mt-4 space-y-3">
              {routes.map((route) => (
                <div key={route.venue}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{route.venue}</span>
                    <span>{route.liquidity}/100</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${route.liquidity}%` }} />
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
    <div className="rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
      />
    </label>
  );
}
