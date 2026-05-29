import React, { useMemo, useState } from "react";

type KeyRecord = {
  key: string;
  scope: string;
  usage: number;
  status: "active" | "disabled" | "rotating";
  lastUsed: string;
};

const keys: KeyRecord[] = [
  { key: "pk_live_A1", scope: "read:webhooks", usage: 12400, status: "active", lastUsed: "2m ago" },
  { key: "pk_live_B2", scope: "write:relayer", usage: 2400, status: "rotating", lastUsed: "10m ago" },
  { key: "pk_live_C3", scope: "admin:projects", usage: 300, status: "disabled", lastUsed: "2d ago" },
];

export default function ApiKeyManager() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | KeyRecord["status"]>("all");

  const rows = useMemo(() => {
    return keys.filter((key) => {
      const matchesSearch = `${key.key} ${key.scope}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || key.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const activeCount = rows.filter((key) => key.status === "active").length;

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Web3 API Key Management Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Create, inspect, rotate, and disable service keys with usage metrics and scoped access information.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Keys" value={rows.length.toString()} />
          <Stat label="Active" value={activeCount.toString()} />
          <Stat label="Total usage" value={rows.reduce((s, key) => s + key.usage, 0).toLocaleString()} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search key or scope"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="rotating">Rotating</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((key) => (
            <article key={key.key} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{key.key}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{key.scope}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{key.usage.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{key.status}</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Key summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Active keys" value={String(activeCount)} />
            <Info label="Most used" value={rows[0]?.key ?? "—"} />
            <Info label="Last used" value={rows[0]?.lastUsed ?? "—"} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Usage intensity</div>
            <div className="mt-4 space-y-3">
              {rows.map((key) => (
                <div key={key.key}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{key.key}</span>
                    <span>{key.usage.toLocaleString()}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${Math.min(100, key.usage / 150)}%` }} />
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
