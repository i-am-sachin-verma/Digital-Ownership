import React, { useMemo, useState } from "react";

type Approval = {
  token: string;
  spender: string;
  allowance: number;
  lastUsed: string;
  risk: "low" | "medium" | "high";
};

const approvals: Approval[] = [
  { token: "USDC", spender: "0xRouter", allowance: 500000, lastUsed: "2h ago", risk: "high" },
  { token: "ETH", spender: "0xStaking", allowance: 8, lastUsed: "1d ago", risk: "medium" },
  { token: "ARB", spender: "0xDEX", allowance: 12000, lastUsed: "5d ago", risk: "low" },
  { token: "OP", spender: "0xFarm", allowance: 4000, lastUsed: "7d ago", risk: "medium" },
];

export default function ApprovalManager() {
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState<"all" | Approval["risk"]>("all");

  const rows = useMemo(() => {
    return approvals.filter((approval) => {
      const matchesSearch = `${approval.token} ${approval.spender}`.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = risk === "all" || approval.risk === risk;
      return matchesSearch && matchesRisk;
    });
  }, [search, risk]);

  const risky = rows.filter((item) => item.risk === "high").length;

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Token Approval Management Panel</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Review spend permissions, detect risky allowances, and keep token approvals organized across multiple chains.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Approvals" value={rows.length.toString()} />
          <Stat label="High risk" value={risky.toString()} />
          <Stat label="Risk filter" value={risk} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search token or spender"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All risk levels</option>
          <option value="low">Low risk</option>
          <option value="medium">Medium risk</option>
          <option value="high">High risk</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((approval) => (
            <article
              key={`${approval.token}-${approval.spender}`}
              className={`rounded-2xl border px-4 py-3 ${
                approval.risk === "high"
                  ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
                  : approval.risk === "medium"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                  : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{approval.token}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{approval.spender}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{approval.allowance.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{approval.lastUsed}</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Safety summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Risky approvals" value={String(risky)} />
            <Info label="Most recent use" value={rows[0]?.lastUsed ?? "—"} />
            <Info label="Recommended action" value="Revoke or reduce allowances with unused high-risk spenders." />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Approval concentration</div>
            <div className="mt-4 space-y-3">
              {rows.map((approval) => (
                <div key={approval.token}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{approval.token}</span>
                    <span>{approval.allowance.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(100, approval.allowance / 5000) * 100}%` }} />
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
