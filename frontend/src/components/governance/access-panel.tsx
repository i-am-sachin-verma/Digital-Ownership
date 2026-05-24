
import { useMemo, useReducer, useState } from "react";

type AccessPanelRecord = {
  id: string;
  label: string;
  amount: number;
  status: "idle" | "valid" | "warning" | "error";
  selected: boolean;
  note: string;
};

type AccessPanelAction =
  | { type: "toggle"; id: string }
  | { type: "change"; id: string; amount: number }
  | { type: "selectAll"; selected: boolean }
  | { type: "status"; id: string; status: AccessPanelRecord["status"] }
  | { type: "note"; id: string; note: string };

const AccessPanelInitial: AccessPanelRecord[] = [
  { id: "a1", label: "Role", amount: 12, status: "valid", selected: false, note: "Stable" },
  { id: "a2", label: "Aware", amount: 24, status: "idle", selected: false, note: "Pending" },
  { id: "a3", label: "Governance", amount: 31, status: "warning", selected: false, note: "Watch" },
  { id: "a4", label: "Access", amount: 4, status: "valid", selected: false, note: "Safe" },
  { id: "a5", label: "Permission", amount: 19, status: "error", selected: false, note: "Fix" },
];

function reducer(state: AccessPanelRecord[], action: AccessPanelAction) {
  switch (action.type) {
    case "toggle":
      return state.map((row) =>
        row.id === action.id ? { ...row, selected: !row.selected } : row
      );
    case "change":
      return state.map((row) =>
        row.id === action.id ? { ...row, amount: action.amount, status: action.amount > 0 ? "valid" : "error" } : row
      );
    case "selectAll":
      return state.map((row) => ({ ...row, selected: action.selected }));
    case "status":
      return state.map((row) =>
        row.id === action.id ? { ...row, status: action.status } : row
      );
    case "note":
      return state.map((row) =>
        row.id === action.id ? { ...row, note: action.note } : row
      );
    default:
      return state;
  }
}

function StatusPill({ value }: { value: AccessPanelRecord["status"] }) {
  const tone =
    value === "valid" ? "bg-emerald-50 text-emerald-700" :
    value === "warning" ? "bg-amber-50 text-amber-700" :
    value === "error" ? "bg-rose-50 text-rose-700" :
    "bg-slate-100 text-slate-600";

  return <span className={"rounded-full px-3 py-1 text-xs font-medium " + tone}>{value}</span>;
}

function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
    />
  );
}

function RowEditor({
  row,
  onToggle,
  onAmount,
  onStatus,
  onNote,
}: {
  row: AccessPanelRecord;
  onToggle: () => void;
  onAmount: (amount: number) => void;
  onStatus: (status: AccessPanelRecord["status"]) => void;
  onNote: (note: string) => void;
}) {
  return (
    <tr className={row.selected ? "bg-slate-50" : ""}>
      <td className="px-4 py-3">
        <input type="checkbox" checked={row.selected} onChange={onToggle} />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.label}</td>
      <td className="px-4 py-3">
        <NumberInput value={row.amount} onChange={onAmount} />
      </td>
      <td className="px-4 py-3">
        <StatusPill value={row.status} />
      </td>
      <td className="px-4 py-3">
        <select
          value={row.status}
          onChange={(event) => onStatus(event.target.value as AccessPanelRecord["status"])}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="idle">idle</option>
          <option value="valid">valid</option>
          <option value="warning">warning</option>
          <option value="error">error</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          value={row.note}
          onChange={(event) => onNote(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </td>
    </tr>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-3 text-3xl font-semibold text-slate-900">{value}</div>
    </article>
  );
}

function NotesPanel({
  selected,
  onBulkNote,
}: {
  selected: AccessPanelRecord[];
  onBulkNote: (value: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <aside className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold text-slate-900">Bulk note editor</h3>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={5}
        placeholder="Apply a note to selected rows..."
        className="rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => onBulkNote(draft)}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Apply to {selected.length} rows
      </button>
    </aside>
  );
}

export default function AccessPanel() {
  const [rows, dispatch] = useReducer(reducer, AccessPanelInitial);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((row) => row.label.toLowerCase().includes(query.toLowerCase()));
  }, [rows, query]);

  const selectedRows = useMemo(() => rows.filter((row) => row.selected), [rows]);

  const totalAmount = useMemo(() => {
    return rows.reduce((sum, row) => sum + row.amount, 0);
  }, [rows]);

  const warningCount = useMemo(() => rows.filter((row) => row.status === "warning").length, [rows]);

  return (
    <section className="mx-auto grid max-w-7xl gap-6 p-6">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Management panel</p>
        <h2 className="text-2xl font-semibold text-slate-900">"Build a Role-Aware Governance Access Panel with Permission States and Policy Hints"</h2>
        <p className="max-w-4xl text-sm text-slate-600">"Create an interface that reflects role-based permissions for proposal creation, voting, and execution actions. * Show accessible actions based on user role * Explain locked actions with policy hints * Support connected and disconnected wallet states * Highlight special governance privileges clearly * Keep access logic presentation-focused and reusable"</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Selected" value={selectedRows.length} />
        <SummaryCard label="Total amount" value={totalAmount} />
        <SummaryCard label="Visible rows" value={filtered.length} />
        <SummaryCard label="Warnings" value={warningCount} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter rows..."
          className="min-w-[280px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
        />
        <button
          type="button"
          onClick={() => dispatch({ type: "selectAll", selected: true })}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "selectAll", selected: false })}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Select</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Override</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <RowEditor
                  key={row.id}
                  row={row}
                  onToggle={() => dispatch({ type: "toggle", id: row.id })}
                  onAmount={(amount) => dispatch({ type: "change", id: row.id, amount })}
                  onStatus={(status) => dispatch({ type: "status", id: row.id, status })}
                  onNote={(note) => dispatch({ type: "note", id: row.id, note })}
                />
              ))}
            </tbody>
          </table>
        </div>

        <NotesPanel
          selected={selectedRows}
          onBulkNote={(note) => {
            selectedRows.forEach((row) => {
              dispatch({ type: "note", id: row.id, note });
            });
          }}
        />
      </div>

      <footer className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Preset operations</h3>
        <p className="mt-2 text-sm text-slate-600">
          Multi-select rows, edit amounts, adjust states, and apply shared notes without leaving the table.
        </p>
      </footer>
    </section>
  );
}
