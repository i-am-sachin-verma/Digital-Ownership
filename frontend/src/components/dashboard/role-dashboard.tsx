
import { createContext, useEffect, useMemo, useState, useContext, type ReactNode } from "react";

type RoleDashboardPanel = {
  id: string;
  title: string;
  tone: "neutral" | "positive" | "warning";
  span: "sm" | "md" | "lg";
};

type RoleDashboardLayoutState = {
  panels: RoleDashboardPanel[];
  selected: string | null;
  compact: boolean;
};

type RoleDashboardContextValue = {
  state: RoleDashboardLayoutState;
  movePanel: (id: string, direction: "left" | "right") => void;
  toggleCompact: () => void;
  selectPanel: (id: string | null) => void;
  resetLayout: () => void;
};

const RoleDashboardPanels: RoleDashboardPanel[] = [
  { id: "p1", title: "Role", tone: "neutral", span: "lg" },
  { id: "p2", title: "Based", tone: "positive", span: "md" },
  { id: "p3", title: "Overview", tone: "warning", span: "sm" },
  { id: "p4", title: "Contextual", tone: "neutral", span: "md" },
  { id: "p5", title: "Widgets", tone: "positive", span: "sm" },
  { id: "p6", title: "Permission", tone: "warning", span: "lg" },
];

const RoleDashboardContext = createContext<RoleDashboardContextValue | null>(null);

function useRoleDashboardLayout() {
  const context = useContext(RoleDashboardContext);
  if (!context) {
    throw new Error("RoleDashboard must be used inside its provider.");
  }
  return context;
}

function scoreSpan(span: RoleDashboardPanel["span"]) {
  if (span === "lg") return "col-span-2";
  if (span === "md") return "col-span-1";
  return "col-span-1";
}

function toneStyles(tone: RoleDashboardPanel["tone"]) {
  if (tone === "positive") return "bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

function PanelCard({ panel }: { panel: RoleDashboardPanel }) {
  const { state, movePanel, selectPanel } = useRoleDashboardLayout();
  const active = state.selected === panel.id;

  return (
    <article
      className={
        "rounded-3xl border p-5 shadow-sm transition " +
        (active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white")
      }
      onClick={() => selectPanel(panel.id)}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{panel.title}</h3>
        <span className={"rounded-full px-3 py-1 text-xs font-medium " + toneStyles(panel.tone)}>
          {panel.tone}
        </span>
      </div>
      <p className="mt-3 text-sm opacity-90">
        This panel is part of a responsive dashboard grid and can be shifted around with lightweight controls.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            movePanel(panel.id, "left");
          }}
          className="rounded-full border border-current px-3 py-1 text-xs font-medium"
        >
          Move left
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            movePanel(panel.id, "right");
          }}
          className="rounded-full border border-current px-3 py-1 text-xs font-medium"
        >
          Move right
        </button>
      </div>
    </article>
  );
}

function Toolbar() {
  const { state, toggleCompact, resetLayout } = useRoleDashboardLayout();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Layout controls</p>
        <p className="text-sm font-medium text-slate-900">
          Selected panel: {state.selected ?? "none"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={toggleCompact}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          {state.compact ? "Expanded grid" : "Compact grid"}
        </button>
        <button
          type="button"
          onClick={resetLayout}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function PanelLegend() {
  return (
    <aside className="grid gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-sm font-semibold text-slate-900">Legend</h3>
      <ul className="grid gap-2 text-sm text-slate-600">
        <li>Neutral panels hold core data.</li>
        <li>Positive panels can represent growth or success.</li>
        <li>Warning panels are intended for alerts and exceptional states.</li>
        <li>Selection is local to the dashboard shell.</li>
      </ul>
    </aside>
  );
}

function Provider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<RoleDashboardLayoutState>({
    panels: RoleDashboardPanels,
    selected: null,
    compact: false,
  });

  useEffect(() => {
    const raw = window.localStorage.getItem("RoleDashboard:layout");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<RoleDashboardLayoutState>;
      setState((current) => ({
        ...current,
        panels: parsed.panels ?? current.panels,
        selected: parsed.selected ?? current.selected,
        compact: parsed.compact ?? current.compact,
      }));
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("RoleDashboard:layout", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setState((current) => ({ ...current, selected: null }));
      }
      if (event.key === "c" && event.metaKey) {
        event.preventDefault();
        setState((current) => ({ ...current, compact: !current.compact }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const api = useMemo<RoleDashboardContextValue>(() => {
    return {
      state,
      movePanel(id, direction) {
        setState((current) => {
          const index = current.panels.findIndex((panel) => panel.id === id);
          if (index < 0) return current;
          const nextIndex = direction === "left" ? index - 1 : index + 1;
          if (nextIndex < 0 || nextIndex >= current.panels.length) return current;

          const panels = [...current.panels];
          const [item] = panels.splice(index, 1);
          panels.splice(nextIndex, 0, item);

          return { ...current, panels };
        });
      },
      toggleCompact() {
        setState((current) => ({ ...current, compact: !current.compact }));
      },
      selectPanel(id) {
        setState((current) => ({ ...current, selected: id }));
      },
      resetLayout() {
        setState({
          panels: RoleDashboardPanels,
          selected: null,
          compact: false,
        });
      },
    };
  }, [state]);

  return <RoleDashboardContext.Provider value={api}>{children}</RoleDashboardContext.Provider>;
}

export default function RoleDashboard() {
  return (
    <Provider>
      <section className="mx-auto grid max-w-7xl gap-6 p-6">
        <header className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Dashboard layout</p>
          <h2 className="text-2xl font-semibold text-slate-900">"Create a Role-Based Dashboard Overview with Contextual Widgets and Permission-Aware Rendering"</h2>
          <p className="max-w-4xl text-sm text-slate-600">"Build a dashboard home screen that changes visible widgets based on user role and access permissions. * Render widgets conditionally by role * Show context-aware quick actions * Preserve layout consistency across roles * Handle empty or restricted widget areas * Keep each widget block modular"</p>
        </header>

        <Toolbar />

        <div className="grid gap-4 lg:grid-cols-3">
          {RoleDashboardPanels.map((panel) => (
            <div key={panel.id} className={scoreSpan(panel.span)}>
              <PanelCard panel={panel} />
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Layout notes</h3>
            <p className="mt-2 text-sm text-slate-600">
              The provider keeps the panel order, selected panel, and compact mode isolated from the presentation tree.
            </p>
          </section>
          <PanelLegend />
        </div>
      </section>
    </Provider>
  );
}
