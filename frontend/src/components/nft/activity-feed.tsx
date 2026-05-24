
import { useMemo, useState } from "react";

type ActivityFeedEvent = {
  id: string;
  title: string;
  kind: "proposal" | "vote" | "execution" | "delegate" | "alert";
  time: string;
  unread: boolean;
  archived: boolean;
  detail: string;
};

const ActivityFeedEvents: ActivityFeedEvent[] = [
  {
    id: "e1",
    title: "Nft ready for review",
    kind: "proposal",
    time: "2m ago",
    unread: true,
    archived: false,
    detail: "The latest draft is waiting for attention and can be reviewed inline.",
  },
  {
    id: "e2",
    title: "Activity action completed",
    kind: "vote",
    time: "15m ago",
    unread: true,
    archived: false,
    detail: "A wallet action changed the current status and updated the receipt feed.",
  },
  {
    id: "e3",
    title: "Feed triggered a sync",
    kind: "execution",
    time: "1h ago",
    unread: false,
    archived: false,
    detail: "The execution layer returned a confirmed result with audit metadata.",
  },
  {
    id: "e4",
    title: "Event changed",
    kind: "delegate",
    time: "3h ago",
    unread: false,
    archived: true,
    detail: "Delegation activity was grouped into the latest timeline segment.",
  },
  {
    id: "e5",
    title: "Grouping warning surfaced",
    kind: "alert",
    time: "5h ago",
    unread: true,
    archived: false,
    detail: "A policy flag or state change requires explicit attention from the user.",
  },
  {
    id: "e6",
    title: "Labels updated",
    kind: "proposal",
    time: "8h ago",
    unread: false,
    archived: true,
    detail: "The activity record was archived with structured information and tags.",
  },
];

function kindTone(kind: ActivityFeedEvent["kind"]) {
  switch (kind) {
    case "proposal":
      return "bg-sky-50 text-sky-700";
    case "vote":
      return "bg-emerald-50 text-emerald-700";
    case "execution":
      return "bg-violet-50 text-violet-700";
    case "delegate":
      return "bg-amber-50 text-amber-700";
    case "alert":
      return "bg-rose-50 text-rose-700";
  }
}

function EventBadge({ kind }: { kind: ActivityFeedEvent["kind"] }) {
  return (
    <span className={"rounded-full px-3 py-1 text-xs font-medium " + kindTone(kind)}>
      {kind}
    </span>
  );
}

function EventRow({
  event,
  onToggle,
}: {
  event: ActivityFeedEvent;
  onToggle: (id: string) => void;
}) {
  return (
    <article
      className={
        "grid gap-3 rounded-3xl border p-5 shadow-sm transition " +
        (event.unread ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50")
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{event.title}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{event.time}</div>
        </div>
        <EventBadge kind={event.kind} />
      </div>

      <p className="text-sm leading-6 text-slate-600">{event.detail}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onToggle(event.id)}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
        >
          {event.unread ? "Mark read" : "Mark unread"}
        </button>
        <span className="text-xs text-slate-500">{event.unread ? "Unread" : "Read"}</span>
      </div>
    </article>
  );
}

function SummaryRail({
  unreadCount,
  archivedCount,
  visibleCount,
}: {
  unreadCount: number;
  archivedCount: number;
  visibleCount: number;
}) {
  return (
    <aside className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Feed summary</h3>
      <div className="grid gap-2 text-sm text-slate-600">
        <p>Total items: {visibleCount}</p>
        <p>Unread: {unreadCount}</p>
        <p>Archived: {archivedCount}</p>
      </div>
    </aside>
  );
}

export default function ActivityFeed() {
  const [filter, setFilter] = useState<ActivityFeedEvent["kind"] | "all">("all");
  const [showArchived, setShowArchived] = useState(true);
  const [items, setItems] = useState(ActivityFeedEvents);

  const visible = useMemo(() => {
    return items.filter((event) => {
      if (!showArchived && event.archived) return false;
      return filter === "all" ? true : event.kind === filter;
    });
  }, [filter, items, showArchived]);

  const unreadCount = useMemo(() => items.filter((event) => event.unread).length, [items]);
  const archivedCount = useMemo(() => items.filter((event) => event.archived).length, [items]);

  function toggleUnread(id: string) {
    setItems((current) =>
      current.map((event) =>
        event.id === id ? { ...event, unread: !event.unread } : event
      )
    );
  }

  function restoreArchived() {
    setItems((current) =>
      current.map((event) =>
        event.archived ? { ...event, archived: false } : event
      )
    );
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 p-6">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Activity feed</p>
        <h2 className="text-2xl font-semibold text-slate-900">"Implement an NFT Activity Feed with Event Grouping, Time Labels, and Context Actions"</h2>
        <p className="max-w-3xl text-sm text-slate-600">"Create an activity feed that groups NFT-related events such as minting, listing, sale, and transfer. * Group feed entries by event type * Show time-ago labels and exact timestamps * Support quick action links per event * Handle dense feeds with clean spacing * Keep feed items reusable across product areas"</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "proposal", "vote", "execution", "delegate", "alert"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={
              "rounded-full px-4 py-2 text-sm font-medium transition " +
              (filter === option ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")
            }
          >
            {option}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowArchived((value) => !value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          {showArchived ? "Hide archived" : "Show archived"}
        </button>
        <button
          type="button"
          onClick={restoreArchived}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        >
          Restore archived
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4">
          {visible.length ? (
            visible.map((event) => (
              <EventRow key={event.id} event={event} onToggle={toggleUnread} />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
              No visible items match the current filter state.
            </div>
          )}
        </div>

        <aside className="grid gap-4">
          <SummaryRail unreadCount={unreadCount} archivedCount={archivedCount} visibleCount={visible.length} />
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900">Filter notes</h3>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600">
              <li>Group items by semantic kind.</li>
              <li>Respect read state changes.</li>
              <li>Keep the feed compact on mobile.</li>
              <li>Reuse the event row for any stream.</li>
              <li>Archive state remains opt-in and reversible.</li>
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Legend</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["proposal", "vote", "execution", "delegate", "alert"] as const).map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {item}
                </span>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
