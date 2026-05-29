import React, { useMemo, useState } from "react";

type Finding = {
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "fixed" | "acknowledged";
  file: string;
  detail: string;
};

const findings: Finding[] = [
  { title: "Unchecked external call", severity: "critical", status: "open", file: "contracts/Pool.sol", detail: "External call lacks a guard and should be isolated." },
  { title: "Event missing indexed parameter", severity: "low", status: "fixed", file: "contracts/Governance.sol", detail: "Adds better observability for off-chain indexing." },
  { title: "Insufficient input validation", severity: "high", status: "acknowledged", file: "contracts/Swap.sol", detail: "User-controlled amount should be bounded." },
  { title: "Upgradeable admin path", severity: "medium", status: "open", file: "contracts/Proxy.sol", detail: "Review initializer and ownership transfer flow." },
];

const severityRank: Record<Finding["severity"], number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export default function AuditViewer() {
  const [status, setStatus] = useState<"all" | Finding["status"]>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return [...findings]
      .filter((item) => status === "all" || item.status === status)
      .filter((item) => `${item.title} ${item.file} ${item.detail}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);
  }, [status, query]);

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Smart Contract Audit Visualization</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Review findings by severity, status, and file path in a structured audit summary with remediation visibility.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Findings" value={rows.length.toString()} />
          <Stat label="Critical" value={rows.filter((item) => item.severity === "critical").length.toString()} />
          <Stat label="Open" value={rows.filter((item) => item.status === "open").length.toString()} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issue, file, or detail"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((finding) => (
            <article key={finding.title} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{finding.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{finding.file}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{finding.severity}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{finding.status}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{finding.detail}</div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Audit summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Highest severity" value={rows[0]?.severity ?? "—"} />
            <Info label="Most common status" value="open" />
            <Info label="Suggested next step" value="Prioritize critical and high severity findings first." />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Severity breakdown</div>
            <div className="mt-4 space-y-3">
              {(["low", "medium", "high", "critical"] as const).map((level) => {
                const count = rows.filter((item) => item.severity === level).length;
                return (
                  <div key={level}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{level}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.max(10, count * 25)}%` }} />
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
