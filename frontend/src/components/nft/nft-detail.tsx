
import { useMemo, useState } from "react";

type NftDetailSide = "left" | "right";

type NftDetailChunk = {
  id: string;
  label: string;
  left: string;
  right: string;
};

const NftDetailChunks: NftDetailChunk[] = [
  {
    id: "overview",
    label: "Nft / Detail",
    left: "Initial rollout keeps the structure compact and reviewable.",
    right: "Expanded rollout adds validation, history, and reusable controls.",
  },
  {
    id: "metadata",
    label: "Animated",
    left: "Static metadata and author notes.",
    right: "Versioned metadata with timestamps and revision tracking.",
  },
  {
    id: "actions",
    label: "Media",
    left: "Submit once and move on.",
    right: "Stage actions with confirmation and retry states.",
  },
  {
    id: "diff",
    label: "Sections",
    left: "No structured diff output.",
    right: "Line-level diff summary and change chips.",
  },
  {
    id: "audit",
    label: "Metadata",
    left: "Single snapshot only.",
    right: "Comparable snapshots with audit trail context.",
  },
];

function normalizeText(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function scoreSimilarity(left: string, right: string) {
  const leftWords = new Set(normalizeText(left).split(" "));
  const rightWords = new Set(normalizeText(right).split(" "));
  let score = 0;

  leftWords.forEach((word) => {
    if (rightWords.has(word)) {
      score += 1;
    }
  });

  return score;
}

function buildDifference(left: string, right: string) {
  const leftLines = left.split(" ");
  const rightLines = right.split(" ");
  const removed = leftLines.filter((word) => !rightLines.includes(word));
  const added = rightLines.filter((word) => !leftLines.includes(word));

  return { removed, added };
}

function DifferencePill({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "positive" | "negative";
}) {
  return (
    <span
      className={
        "rounded-full px-3 py-1 text-xs font-medium " +
        (tone === "positive"
          ? "bg-emerald-50 text-emerald-700"
          : tone === "negative"
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-600")
      }
    >
      {label}
    </span>
  );
}

function ComparePane({
  side,
  body,
}: {
  side: NftDetailSide;
  body: string;
}) {
  return (
    <article className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          {side === "left" ? "Original" : "Updated"}
        </p>
        <DifferencePill label={side === "left" ? "Baseline" : "Revision"} tone={side === "left" ? "neutral" : "positive"} />
      </div>
      <p className="text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}

export default function NftDetail() {
  const [selected, setSelected] = useState("overview");
  const [compact, setCompact] = useState(false);

  const chunks = useMemo(() => {
    return NftDetailChunks.map((chunk) => {
      const { added, removed } = buildDifference(chunk.left, chunk.right);
      const similarity = scoreSimilarity(chunk.left, chunk.right);

      return {
        ...chunk,
        similarity,
        added,
        removed,
      };
    });
  }, []);

  const activeChunk = chunks.find((chunk) => chunk.id === selected) ?? chunks[0];

  return (
    <section className="mx-auto grid max-w-7xl gap-6 p-6">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Comparison workspace</p>
        <h2 className="text-2xl font-semibold text-slate-900">"Design an NFT Detail Experience with Animated Media Sections and Metadata Collapse"</h2>
        <p className="max-w-4xl text-sm text-slate-600">"Create a rich NFT detail page with media emphasis, metadata organization, and interactive sections. * Highlight primary media with strong layout balance * Collapse secondary metadata into structured panels * Support action buttons for buy, mint, or transfer * Handle long descriptions and external links well * Keep the page sections reusable for collections"</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCompact((value) => !value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          {compact ? "Expanded" : "Compact"}
        </button>
        {chunks.map((chunk) => (
          <button
            key={chunk.id}
            type="button"
            onClick={() => setSelected(chunk.id)}
            className={
              "rounded-full px-4 py-2 text-sm font-medium transition " +
              (selected === chunk.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")
            }
          >
            {chunk.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ComparePane side="left" body={activeChunk.left} />
        <ComparePane side="right" body={activeChunk.right} />
      </div>

      <div className={compact ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "grid gap-4"}>
        {chunks.map((chunk) => (
          <article key={chunk.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">{chunk.label}</h3>
              <DifferencePill
                label={`Similarity ${chunk.similarity}`}
                tone={chunk.similarity > 4 ? "positive" : chunk.similarity > 2 ? "neutral" : "negative"}
              />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Added:</span>{" "}
                {chunk.added.length ? chunk.added.join(", ") : "No new terms"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Removed:</span>{" "}
                {chunk.removed.length ? chunk.removed.join(", ") : "No removed terms"}
              </p>
            </div>
          </article>
        ))}
      </div>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Selected section</h3>
        <p className="mt-2 text-sm text-slate-600">
          {activeChunk.label} is the active review lane for original versus updated analysis.
        </p>
      </footer>
    </section>
  );
}
