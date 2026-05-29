import React, { useMemo, useState } from "react";

type Referral = {
  code: string;
  inviter: string;
  conversions: number;
  rewards: number;
  status: "active" | "paused" | "expired";
  channel: string;
};

const referrals: Referral[] = [
  { code: "WEB3-A1", inviter: "0xA1B2", conversions: 124, rewards: 18.4, status: "active", channel: "X" },
  { code: "BUILD-7F", inviter: "0xC3D4", conversions: 48, rewards: 7.2, status: "active", channel: "Discord" },
  { code: "DAO-3C", inviter: "0xE5F6", conversions: 16, rewards: 2.9, status: "paused", channel: "Newsletter" },
  { code: "NFT-99Q", inviter: "0x1A2B", conversions: 5, rewards: 0.8, status: "expired", channel: "Community" },
];

function pct(value: number, total: number) {
  return total ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";
}

export default function ReferralTracker() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Referral["status"]>("all");

  const rows = useMemo(() => {
    return referrals.filter((referral) => {
      const matchesQuery = `${referral.code} ${referral.inviter} ${referral.channel}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || referral.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const totalConversions = rows.reduce((sum, row) => sum + row.conversions, 0);
  const totalRewards = rows.reduce((sum, row) => sum + row.rewards, 0);
  const top = [...rows].sort((a, b) => b.conversions - a.conversions)[0];

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Web3 Referral Tracking System</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Track invite codes, conversion volume, reward totals, and campaign state for growth programs and community funnels.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Codes" value={rows.length.toString()} />
          <Metric label="Conversions" value={totalConversions.toString()} />
          <Metric label="Rewards" value={totalRewards.toFixed(1)} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code, inviter, or channel"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((row) => (
            <article key={row.code} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{row.code}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{row.inviter} • {row.channel}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{row.conversions}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{row.status}</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Campaign summary</h2>

          <div className="mt-4 grid gap-3">
            <Info label="Top code" value={top?.code ?? "—"} />
            <Info label="Top share" value={top ? pct(top.conversions, totalConversions) : "—"} />
            <Info label="Reward total" value={`${totalRewards.toFixed(1)} tokens`} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Channel mix</div>
            <div className="mt-4 space-y-3">
              {["X", "Discord", "Newsletter", "Community"].map((channel) => {
                const count = rows.filter((row) => row.channel === channel).length;
                return (
                  <div key={channel}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{channel}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.max(12, count * 25)}%` }} />
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
