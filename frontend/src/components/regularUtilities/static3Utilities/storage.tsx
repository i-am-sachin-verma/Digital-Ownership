import React, { useMemo, useState } from "react";

type FileItem = {
  name: string;
  type: "image" | "document" | "json" | "archive";
  size: number;
  pinned: boolean;
  updated: string;
};

const files: FileItem[] = [
  { name: "proposal.pdf", type: "document", size: 1240000, pinned: true, updated: "1h ago" },
  { name: "profile.png", type: "image", size: 420000, pinned: false, updated: "3h ago" },
  { name: "snapshot.json", type: "json", size: 7800, pinned: true, updated: "5h ago" },
  { name: "bundle.zip", type: "archive", size: 3220000, pinned: false, updated: "1d ago" },
  { name: "handbook.pdf", type: "document", size: 2410000, pinned: true, updated: "2d ago" },
];

function readableSize(size: number) {
  if (size >= 1_000_000) return `${(size / 1_000_000).toFixed(1)} MB`;
  if (size >= 1_000) return `${(size / 1_000).toFixed(1)} KB`;
  return `${size} B`;
}

export default function StorageManager() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | FileItem["type"]>("all");

  const rows = useMemo(() => {
    return files.filter((file) => {
      const matchesQuery = `${file.name} ${file.type}`.toLowerCase().includes(query.toLowerCase());
      const matchesType = type === "all" || file.type === type;
      return matchesQuery && matchesType;
    });
  }, [query, type]);

  const pinned = rows.filter((file) => file.pinned).length;
  const totalSize = rows.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Decentralized Storage File Manager</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            View files, pinning state, modification timing, and storage categories in a familiar file-management experience.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Files" value={rows.length.toString()} />
          <Stat label="Pinned" value={pinned.toString()} />
          <Stat label="Size" value={readableSize(totalSize)} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search file or type"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          <option value="all">All types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
          <option value="json">JSON</option>
          <option value="archive">Archives</option>
        </select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {rows.map((file) => (
            <article key={file.name} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{file.type} • {file.updated}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{readableSize(file.size)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{file.pinned ? "pinned" : "unpinned"}</div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Storage summary</h2>
          <div className="mt-4 grid gap-3">
            <Info label="Pinned files" value={String(pinned)} />
            <Info label="Total storage" value={readableSize(totalSize)} />
            <Info label="Last updated" value={rows[0]?.updated ?? "—"} />
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-sm font-medium text-slate-900 dark:text-white">File type distribution</div>
            <div className="mt-4 space-y-3">
              {(["image", "document", "json", "archive"] as const).map((kind) => {
                const count = rows.filter((file) => file.type === kind).length;
                return (
                  <div key={kind}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{kind}</span>
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
