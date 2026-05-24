
import { useEffect, useMemo, useRef, useState } from "react";

type CommandPaletteResult = {
  id: string;
  label: string;
  kind: string;
  detail: string;
  score: number;
};

const CommandPaletteCatalog: CommandPaletteResult[] = [
  { id: "r1", label: "Command", kind: "entity", detail: "Primary lookup target with fast access.", score: 96 },
  { id: "r2", label: "Palette", kind: "collection", detail: "Recently opened item with strong relevance.", score: 91 },
  { id: "r3", label: "Keyboard", kind: "wallet", detail: "Wallet-bound record with high confidence.", score: 88 },
  { id: "r4", label: "Driven", kind: "history", detail: "Cached item from recent activity.", score: 84 },
  { id: "r5", label: "Action", kind: "notification", detail: "Actionable alert with shortcuts.", score: 79 },
  { id: "r6", label: "Discovery", kind: "route", detail: "Related search path and navigation hit.", score: 74 },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function rankResult(query: string, result: CommandPaletteResult) {
  const q = normalize(query);
  if (!q) return result.score;

  let score = result.score;
  if (normalize(result.label).includes(q)) score += 20;
  if (normalize(result.kind).includes(q)) score += 8;
  if (normalize(result.detail).includes(q)) score += 4;
  return score;
}

function useDebouncedValue<T>(value: T, delay = 150) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function ShortcutChip({ value }: { value: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
      {value}
    </span>
  );
}

function ResultRow({
  item,
  active,
  onSelect,
}: {
  item: CommandPaletteResult;
  active: boolean;
  onSelect: (item: CommandPaletteResult) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={
        "grid w-full gap-1 rounded-2xl border p-4 text-left transition " +
        (active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm font-semibold">{item.label}</strong>
        <span className="text-xs opacity-80">{item.kind}</span>
      </div>
      <p className="text-sm opacity-90">{item.detail}</p>
    </button>
  );
}

export default function CommandPalette() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(["governance", "marketplace", "nft"]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounced = useDebouncedValue(query, 120);

  const results = useMemo(() => {
    return CommandPaletteCatalog
      .map((item) => ({ ...item, score: rankResult(debounced, item) }))
      .filter((item) => !debounced || item.score > 70)
      .sort((a, b) => b.score - a.score);
  }, [debounced]);

  const active = results.find((item) => item.id === selectedId) ?? results[0];

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentIndex = results.findIndex((item) => item.id === selectedId);
        const next = results[(currentIndex + 1 + results.length) % results.length];
        if (next) setSelectedId(next.id);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentIndex = results.findIndex((item) => item.id === selectedId);
        const next = results[(currentIndex - 1 + results.length) % results.length];
        if (next) setSelectedId(next.id);
      }

      if (event.key === "Enter" && active) {
        setRecent((value) => [active.label, ...value.filter((entry) => entry !== active.label)].slice(0, 5));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [results, selectedId, active]);

  return (
    <section className="mx-auto grid max-w-6xl gap-6 p-6">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Search console</p>
        <h2 className="text-2xl font-semibold text-slate-900">"Develop a Modern Command Palette Interface with Keyboard Driven Action Discovery and Search Suggestions"</h2>
        <p className="max-w-4xl text-sm text-slate-600">"Create a command palette that can be opened quickly, searched efficiently, and used to trigger actions from the keyboard. * Open and close with shortcut support * Filter actions with live search * Highlight matching command text * Support keyboard navigation through results * Keep the pattern reusable for global app actions"</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <ShortcutChip value="/" />
            <ShortcutChip value="↑ ↓" />
            <ShortcutChip value="Enter" />
          </div>

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search proposals, collections, wallets, history..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
          />

          <div className="grid gap-3">
            {results.length ? (
              results.map((item) => (
                <ResultRow
                  key={item.id}
                  item={item}
                  active={active?.id === item.id}
                  onSelect={(picked) => {
                    setSelectedId(picked.id);
                    setRecent((value) => [picked.label, ...value.filter((entry) => entry !== picked.label)].slice(0, 5));
                  }}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No matches found for "{query}".
              </div>
            )}
          </div>
        </section>

        <aside className="grid gap-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Focused result</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p>{active?.label ?? "None selected"}</p>
              <p>{active?.detail ?? "Search to inspect a result."}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{active?.kind ?? "Idle"}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Recent queries</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {recent.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {item}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Search modes</h3>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600">
              <li>Exact label matching</li>
              <li>Kind-aware prioritization</li>
              <li>Detail-level fallback ranking</li>
              <li>Keyboard-driven discovery</li>
              <li>Fast local result filtering</li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}
