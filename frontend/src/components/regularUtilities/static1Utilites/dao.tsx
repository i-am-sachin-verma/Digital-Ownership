import React, { useMemo, useState } from "react";

type Proposal = {
  id: number;
  title: string;
  summary: string;
  yes: number;
  no: number;
  abstain: number;
  status: "active" | "passed" | "failed";
};

const proposals: Proposal[] = [
  {
    id: 1,
    title: "Increase treasury diversification",
    summary: "Move a portion of idle treasury assets into stable, yield-bearing reserves.",
    yes: 1840,
    no: 320,
    abstain: 84,
    status: "active",
  },
  {
    id: 2,
    title: "Fund developer tooling initiative",
    summary: "Allocate resources to improve SDKs, templates, and onboarding flow.",
    yes: 2400,
    no: 110,
    abstain: 42,
    status: "passed",
  },
  {
    id: 3,
    title: "Adjust validator incentives",
    summary: "Modify rewards to better align network uptime and stake distribution.",
    yes: 860,
    no: 980,
    abstain: 31,
    status: "failed",
  },
];

export default function DAOVoting() {
  const [selected, setSelected] = useState(0);
  const proposal = proposals[selected];

  const total = proposal.yes + proposal.no + proposal.abstain;
  const quorum = useMemo(() => (total / 3000) * 100, [total]);
  const yesPct = (proposal.yes / total) * 100;
  const noPct = (proposal.no / total) * 100;
  const abstainPct = (proposal.abstain / total) * 100;

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">DAO Governance Proposal Voting</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Explore active and historical proposals, review vote distribution, quorum progress, and governance status in one interface.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total votes" value={String(total)} />
          <Stat label="Quorum" value={`${quorum.toFixed(1)}%`} />
          <Stat label="Yes" value={`${yesPct.toFixed(1)}%`} />
          <Stat label="No" value={`${noPct.toFixed(1)}%`} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {proposals.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelected(index)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                index === selected
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs opacity-75">{item.status}</span>
              </div>
              <div className="mt-2 text-xs opacity-80">{item.summary}</div>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Proposal details</h2>
          <div className="mt-4 space-y-3">
            <Info label="Title" value={proposal.title} />
            <Info label="Summary" value={proposal.summary} />
            <Info label="Status" value={proposal.status} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="flex items-center justify-between text-sm">
              <span>Yes / No / Abstain</span>
              <span>{yesPct.toFixed(1)}% / {noPct.toFixed(1)}% / {abstainPct.toFixed(1)}%</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${yesPct}%` }} />
            </div>
            <div className="mt-2 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-rose-500" style={{ width: `${noPct}%` }} />
            </div>
            <div className="mt-2 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-amber-500" style={{ width: `${abstainPct}%` }} />
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
      <div className="mt-1 font-semibold text-slate-900 dark:text-white">{value}</div>
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
