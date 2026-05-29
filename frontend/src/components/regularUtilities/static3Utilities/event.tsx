import React, { useMemo, useState } from "react";

type EventLog = {
  name: string;
  source: string;
  block: number;
  severity: "info" | "warning" | "critical";
  decoded: string;
};

const events: EventLog[] = [
  { name: "Transfer", source: "0xToken", block: 18120012, severity: "info", decoded: "Transfer 1200 USDC" },
  { name: "OwnershipChanged", source: "0xProxy", block: 18120022, severity: "warning", decoded: "Proxy admin rotated" },
  { name: "LiquidationCall", source: "0xLend", block: 18120101, severity: "critical", decoded: "Position liquidated by keeper" },
  { name: "RewardClaimed", source: "0xFarm", block: 18120122, severity: "info", decoded: "Rewards claimed successfully" },
];

export default function EventMonitor() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<"all" | EventLog["severity"]>("all");

  const rows = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery = `${event.name} ${event.source} ${event.decoded}`.toLowerCase().includes(query.toLowerCase());
      const matchesSeverity = severity === "all" || event.severity === severity;
      return matchesQuery && matchesSeverity;
    });
  }, [query, severity]);

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Blockchain Event Monitoring Center</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Inspect decoded smart contract events in a live-style feed with source, block, and severity details.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Events" value={rows.length.toString()} />
          <Stat label="Critical" value={rows.filter((event) => event.severity === "critical").length.toString()} />
          <Stat label="Latest block" value={rows[0] ? rows[0].block.toString() : "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search event or source"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((event) => (
            <article
              key={`${event.name}-${event.block}`}
              className={`rounded-2xl border px-4 py-3 ${
                event.severity === "critical"
                  ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
                  : event.severity === "warning"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                  : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{event.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{event.source}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">#{event.block}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{event.severity}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{event.decoded}</div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Feed summary</h2>

          <div className="mt-4 grid gap-3">
            <Info label="Newest event" value={rows[0]?.name ?? "—"} />
            <Info label="Decoded output" value={rows[0]?.decoded ?? "—"} />
            <Info label="Attention level" value={rows[0]?.severity ?? "—"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Event severity mix</div>
            <div className="mt-4 space-y-3">
              {(["info", "warning", "critical"] as const).map((level) => {
                const count = rows.filter((event) => event.severity === level).length;
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
