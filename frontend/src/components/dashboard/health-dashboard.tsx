
import { useEffect, useMemo, useRef, useState } from "react";

type HealthDashboardMetric = {
  id: string;
  label: string;
  value: number;
  delta: number;
  color: "neutral" | "positive" | "negative";
  format: "number" | "currency" | "percent";
};

type HealthDashboardRange = "24h" | "7d" | "30d" | "90d";

const HealthDashboardSeries: HealthDashboardMetric[] = [
  { id: "m1", label: "Health", value: 90, delta: 1.5, color: "neutral", format: "number" },
  { id: "m2", label: "Status", value: 103, delta: 2.7, color: "positive", format: "currency" },
  { id: "m3", label: "Indicators", value: 116, delta: 3.9, color: "negative", format: "percent" },
  { id: "m4", label: "Source", value: 129, delta: 5.1, color: "neutral", format: "number" },
  { id: "m5", label: "Polling", value: 142, delta: 6.3, color: "neutral", format: "number" },
  { id: "m6", label: "Views", value: 155, delta: 7.5, color: "positive", format: "currency" },
  { id: "m7", label: "Latency", value: 168, delta: 8.7, color: "negative", format: "percent" },
  { id: "m8", label: "Volume", value: 181, delta: 9.9, color: "neutral", format: "number" },
];

function formatMetric(value: number, format: HealthDashboardMetric["format"]) {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (format === "percent") {
    return `${value.toFixed(1)}%`;
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function scalePoints(points: number[]) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = max - min || 1;

  return points.map((point) => 8 + ((point - min) / span) * 84);
}

function TrendBars({ values }: { values: number[] }) {
  const heights = useMemo(() => scalePoints(values), [values]);

  return (
    <div className="flex items-end gap-1 rounded-xl bg-slate-50 p-2">
      {heights.map((height, index) => (
        <span
          key={index}
          className="w-2 rounded-t bg-slate-900/70"
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

function MetricCard({
  metric,
  points,
}: {
  metric: HealthDashboardMetric;
  points: number[];
}) {
  return (
    <article className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {metric.label}
          </p>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {formatMetric(metric.value, metric.format)}
          </div>
        </div>

        <span
          className={
            "rounded-full px-3 py-1 text-xs font-semibold " +
            (metric.color === "positive"
              ? "bg-emerald-50 text-emerald-700"
              : metric.color === "negative"
              ? "bg-rose-50 text-rose-700"
              : "bg-slate-100 text-slate-600")
          }
        >
          {metric.delta >= 0 ? "+" : ""}
          {metric.delta.toFixed(1)}%
        </span>
      </div>

      <TrendBars values={points} />
    </article>
  );
}

function RangePill({
  value,
  active,
  onSelect,
}: {
  value: HealthDashboardRange;
  active: boolean;
  onSelect: (value: HealthDashboardRange) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={
        "rounded-full px-4 py-2 text-sm font-medium transition " +
        (active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")
      }
    >
      {value}
    </button>
  );
}

export default function HealthDashboard() {
  const [range, setRange] = useState<HealthDashboardRange>("30d");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, [range]);

  useEffect(() => {
    const node = anchorRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          node.dataset.visible = "true";
        }
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(() => {
    const factor = range === "24h" ? 1 : range === "7d" ? 1.15 : range === "30d" ? 1.35 : 1.6;
    return HealthDashboardSeries.map((metric, index) => ({
      ...metric,
      value: Math.round(metric.value * factor + index * 4),
      delta: Number((metric.delta * factor).toFixed(1)),
    }));
  }, [range]);

  const summary = useMemo(() => {
    const total = rows.reduce((acc, metric) => acc + metric.value, 0);
    const positive = rows.filter((metric) => metric.color === "positive").length;
    const negative = rows.filter((metric) => metric.color === "negative").length;

    return { total, positive, negative };
  }, [rows]);

  const peak = useMemo(() => {
    return rows.reduce((best, current) => (current.value > best.value ? current : best), rows[0]);
  }, [rows]);

  return (
    <section ref={anchorRef} className="mx-auto grid max-w-7xl gap-6 p-6">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Analytics console
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">"Create a Live System Health Dashboard with Status Indicators and Multi-Source Polling Views"</h2>
        <p className="max-w-3xl text-sm text-slate-600">
          "Build a health monitoring dashboard that reflects system status, sync health, and data freshness. * Show live status indicators * Visualize data freshness and sync state * Support refresh and polling feedback * Highlight degraded states clearly * Keep health cards reusable for admin screens"
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(["24h", "7d", "30d", "90d"] as const).map((option) => (
          <RangePill
            key={option}
            value={option}
            active={range === option}
            onSelect={setRange}
          />
        ))}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          {expanded ? "Compact" : "Expanded"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total coverage</p>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{summary.total}</div>
          <p className="mt-2 text-sm text-slate-500">
            {summary.positive} positive / {summary.negative} negative segments
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Leading metric</p>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {formatMetric(peak.value, peak.format)}
          </div>
          <p className="mt-2 text-sm text-slate-500">{peak.label} currently leads the panel</p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trend summary</p>
          <div className="mt-3">
            <TrendBars values={rows.map((row) => row.value)} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Aggregated view of the current range and distribution
          </p>
        </article>
      </div>

      <div className={expanded ? "grid gap-4 lg:grid-cols-2 xl:grid-cols-3" : "grid gap-4 lg:grid-cols-2"}>
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-3xl bg-slate-100" />
            ))
          : rows.map((metric, index) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                points={[
                  metric.value * 0.7,
                  metric.value * 0.9,
                  metric.value,
                  metric.value * 1.08,
                  metric.value * 1.03,
                  metric.value * 1.12,
                  metric.value * 1.05,
                ]}
              />
            ))}
      </div>
    </section>
  );
}
