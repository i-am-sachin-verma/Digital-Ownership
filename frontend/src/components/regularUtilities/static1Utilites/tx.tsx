import React, { useMemo, useState } from "react";

type TxStatus = "idle" | "queued" | "broadcast" | "pending" | "confirmed" | "failed";

const stepsMap: Record<TxStatus, string[]> = {
  idle: ["Sign", "Broadcast", "Pending", "Confirm"],
  queued: ["Sign ✓", "Broadcast", "Pending", "Confirm"],
  broadcast: ["Sign ✓", "Broadcast ✓", "Pending", "Confirm"],
  pending: ["Sign ✓", "Broadcast ✓", "Pending ✓", "Confirm"],
  confirmed: ["Sign ✓", "Broadcast ✓", "Pending ✓", "Confirm ✓"],
  failed: ["Sign ✓", "Broadcast ✓", "Pending ✕", "Confirm ✕"],
};

export default function TransactionTracker() {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [hash, setHash] = useState("");
  const [confirmations, setConfirmations] = useState(0);
  const [block, setBlock] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  const steps = useMemo(() => stepsMap[status], [status]);

  async function run() {
    const tx = `0x${crypto.getRandomValues(new Uint8Array(16)).reduce((acc, value) => acc + value.toString(16).padStart(2, "0"), "")}`;
    setHash(tx);
    setHistory([]);
    setStatus("queued");
    push("Signature requested");
    await wait(600);
    setStatus("broadcast");
    push("Broadcast to node");
    setBlock((value) => value + 1);
    await wait(900);
    setStatus("pending");
    push("Transaction waiting in mempool");
    setConfirmations(0);
    await wait(1200);
    const ok = Math.random() > 0.18;
    if (ok) {
      setStatus("confirmed");
      setConfirmations(12);
      setBlock((value) => value + 2);
      push("Receipt confirmed");
    } else {
      setStatus("failed");
      push("Execution reverted");
    }
  }

  function reset() {
    setStatus("idle");
    setHash("");
    setConfirmations(0);
    setBlock(0);
    setHistory([]);
  }

  function push(entry: string) {
    setHistory((items) => [entry, ...items].slice(0, 6));
  }

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Blockchain Transaction Lifecycle Tracker</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Follow a transaction through signing, broadcast, mempool waiting, and final confirmation with clear state transitions.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={run} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
            Run simulation
          </button>
          <button onClick={reset} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Transaction hash" value={hash} onChange={setHash} placeholder="0x..." />
            <Field label="Network" value={"Ethereum"} onChange={() => {}} readOnly placeholder="" />
          </div>

          <div className="mt-5 space-y-3">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`rounded-2xl border px-4 py-3 transition ${
                  index <= stageIndex(status)
                    ? status === "failed" && index >= 2
                      ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40"
                      : "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                    : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{step}</div>
                  <Badge tone={index <= stageIndex(status) ? "success" : "neutral"}>
                    {index <= stageIndex(status) ? "active" : "waiting"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Receipt summary</h2>

          <div className="mt-4 grid gap-3">
            <Info label="Status" value={status} />
            <Info label="Confirmations" value={String(confirmations)} />
            <Info label="Block number" value={block ? `#${block}` : "—"} />
            <Info label="Explorer link" value={hash ? `explorer/${hash.slice(0, 12)}…` : "—"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Lifecycle log</div>
            <div className="mt-3 space-y-2">
              {history.length ? history.map((item, i) => (
                <div key={i} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  {item}
                </div>
              )) : (
                <div className="rounded-xl border border-dashed border-slate-300 px-3 py-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Run the simulation to populate lifecycle events and receipt information.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stageIndex(status: TxStatus) {
  return { idle: -1, queued: 0, broadcast: 1, pending: 2, confirmed: 3, failed: 2 }[status];
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-slate-900 dark:border-slate-700 dark:focus:border-white"
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900/60">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="break-all font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function Badge({ tone, children }: { tone: "neutral" | "success"; children: React.ReactNode }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tone === "success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
      {children}
    </span>
  );
}
