import React, { useMemo, useState } from "react";

type Subscription = {
  name: string;
  nextCharge: string;
  token: string;
  amount: number;
  status: "active" | "paused" | "expired";
  cadence: string;
};

const subscriptions: Subscription[] = [
  { name: "Premium API", nextCharge: "2026-06-02", token: "USDC", amount: 49, status: "active", cadence: "Monthly" },
  { name: "Analytics Pro", nextCharge: "2026-05-31", token: "ETH", amount: 0.03, status: "paused", cadence: "Monthly" },
  { name: "Storage Plan", nextCharge: "2026-06-08", token: "USDT", amount: 19, status: "active", cadence: "Monthly" },
  { name: "Enterprise Alerts", nextCharge: "2026-06-14", token: "USDC", amount: 199, status: "active", cadence: "Yearly" },
];

export default function SubscriptionBilling() {
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return subscriptions.filter((item) =>
      `${item.name} ${item.token} ${item.status}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const subscription = filtered[selected] ?? filtered[0];
  const totalMonthly = filtered.reduce((sum, item) => sum + (item.cadence === "Monthly" ? item.amount : item.amount / 12), 0);

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Web3 Subscription Payment Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Manage recurring on-chain payments, next charge dates, and subscription status with a simple billing interface.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Plans" value={filtered.length.toString()} />
          <Metric label="Monthly total" value={totalMonthly.toFixed(2)} />
          <Metric label="Active" value={filtered.filter((item) => item.status === "active").length.toString()} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search plans"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
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
                  <div className="text-xs opacity-75">{item.cadence}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{item.amount} {item.token}</div>
                  <div className="text-xs opacity-75">{item.status}</div>
                </div>
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {subscription ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Plan" value={subscription.name} />
                <Info label="Next charge" value={subscription.nextCharge} />
                <Info label="Token" value={subscription.token} />
                <Info label="Status" value={subscription.status} />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                <div className="text-sm font-medium text-slate-900 dark:text-white">Payment summary</div>
                <div className="mt-3 grid gap-2 text-sm">
                  <Row label="Cadence" value={subscription.cadence} />
                  <Row label="Charge amount" value={`${subscription.amount} ${subscription.token}`} />
                  <Row label="Renewal behavior" value={subscription.status === "active" ? "Auto-renew enabled" : "Requires user action"} />
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No matching subscriptions found.
            </div>
          )}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
