import React, { useMemo, useState } from "react";

type Notice = {
  title: string;
  body: string;
  type: "alert" | "info" | "success";
  read: boolean;
};

const notices: Notice[] = [
  { title: "Bridge completed", body: "Your asset arrived on Arbitrum.", type: "success", read: false },
  { title: "Proposal voting starts", body: "A new governance vote is now live.", type: "info", read: true },
  { title: "Approval warning", body: "A token allowance is unusually high.", type: "alert", read: false },
  { title: "Reward claimed", body: "Your staking rewards were successfully claimed.", type: "success", read: true },
];

export default function NotificationCenter() {
  const [filter, setFilter] = useState<"all" | Notice["type"]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return notices.filter((notice) => {
      const matchesType = filter === "all" || notice.type === filter;
      const matchesQuery = `${notice.title} ${notice.body}`.toLowerCase().includes(query.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [filter, query]);

  const unread = filtered.filter((notice) => !notice.read).length;

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Web3 Notification Center</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Consolidate alerts, updates, and user notifications into a central inbox with status and filtering controls.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Total" value={filtered.length.toString()} />
          <Metric label="Unread" value={unread.toString()} />
          <Metric label="Filter" value={filter} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notification"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none sm:flex-1 dark:border-slate-700"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All</option>
          <option value="alert">Alerts</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
        </select>
      </div>

      <div className="mt-6 grid gap-3">
        {filtered.map((notice, index) => (
          <article
            key={index}
            className={`rounded-2xl border px-4 py-3 ${
              notice.type === "alert"
                ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
                : notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{notice.title}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{notice.body}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{notice.type}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{notice.read ? "read" : "unread"}</div>
              </div>
            </div>
          </article>
        ))}
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
