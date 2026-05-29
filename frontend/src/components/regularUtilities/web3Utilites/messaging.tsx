import React, { useMemo, useState } from "react";

type Thread = {
  id: string;
  subject: string;
  sender: string;
  unread: boolean;
  network: string;
  timestamp: string;
  preview: string;
  tags: string[];
};

const threads: Thread[] = [
  { id: "t1", subject: "Governance follow-up", sender: "0xA1B2", unread: true, network: "Ethereum", timestamp: "2m ago", preview: "Can you review the latest proposal changes?", tags: ["dao", "urgent"] },
  { id: "t2", subject: "Bridge confirmation", sender: "0xC3D4", unread: false, network: "Arbitrum", timestamp: "14m ago", preview: "Your transfer completed successfully.", tags: ["bridge", "receipt"] },
  { id: "t3", subject: "Marketplace negotiation", sender: "0xE5F6", unread: true, network: "Base", timestamp: "1h ago", preview: "Would you accept 0.42 ETH for the listing?", tags: ["market", "offer"] },
  { id: "t4", subject: "Credential update", sender: "did:pkh:eip155:1", unread: false, network: "Polygon", timestamp: "3h ago", preview: "Your verifiable credential has been refreshed.", tags: ["did", "proof"] },
];

const quickReplies = [
  "Acknowledged, reviewing now.",
  "Received, will respond shortly.",
  "Looks good from my side.",
  "Please share the transaction hash.",
];

function badgeClass(unread: boolean) {
  return unread
    ? "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30"
    : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60";
}

export default function MessagingInbox() {
  const [query, setQuery] = useState("");
  const [network, setNetwork] = useState("All");
  const [selectedId, setSelectedId] = useState<string>(threads[0].id);
  const [reply, setReply] = useState(quickReplies[0]);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const networks = ["All", ...new Set(threads.map((thread) => thread.network))];

  const filtered = useMemo(() => {
    return threads.filter((thread) => {
      const matchesQuery = `${thread.subject} ${thread.sender} ${thread.preview} ${thread.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      const matchesNetwork = network === "All" || thread.network === network;
      const matchesUnread = onlyUnread ? thread.unread : true;
      return matchesQuery && matchesNetwork && matchesUnread;
    });
  }, [query, network, onlyUnread]);

  const selected = filtered.find((thread) => thread.id === selectedId) ?? filtered[0] ?? threads[0];

  return (
    <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Decentralized Messaging Inbox</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Browse wallet-linked messages with searchable threads, network context, unread states, and compact reply actions.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Threads" value={filtered.length.toString()} />
          <Stat label="Unread" value={filtered.filter((thread) => thread.unread).length.toString()} />
          <Stat label="Selected" value={selected?.subject ?? "—"} />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search thread, sender, or tag"
          className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none lg:flex-1 dark:border-slate-700"
        />
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
        >
          {networks.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          onClick={() => setOnlyUnread((value) => !value)}
          className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700"
        >
          {onlyUnread ? "Show all" : "Unread only"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          {filtered.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setSelectedId(thread.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selected?.id === thread.id ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : badgeClass(thread.unread)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{thread.subject}</div>
                  <div className="text-xs opacity-75">{thread.sender}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75">{thread.timestamp}</div>
                  <div className="text-xs opacity-75">{thread.network}</div>
                </div>
              </div>
              <div className="mt-2 text-xs opacity-80">{thread.preview}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {thread.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Conversation</div>
            <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{selected.subject}</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selected.sender} • {selected.network} • {selected.timestamp}</div>
          </div>

          <div className="mt-4 space-y-3">
            <MessageBubble tone="incoming" text={selected.preview} />
            <MessageBubble tone="outgoing" text="I will confirm the details and reply with the next step." />
            <MessageBubble tone="incoming" text="Please include the transaction hash and any relevant notes." />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="text-sm font-medium text-slate-900 dark:text-white">Quick reply</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickReplies.map((item) => (
                <button
                  key={item}
                  onClick={() => setReply(item)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${reply === item ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="mt-3 min-h-24 w-full rounded-2xl border border-slate-300 bg-transparent p-3 text-sm outline-none dark:border-slate-700"
            />
            <div className="mt-3 flex gap-3">
              <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Send reply</button>
              <button className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700">Archive</button>
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
      <div className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function MessageBubble({ tone, text }: { tone: "incoming" | "outgoing"; text: string }) {
  return (
    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${tone === "incoming" ? "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200" : "ml-auto bg-slate-900 text-white dark:bg-white dark:text-slate-900"}`}>
      {text}
    </div>
  );
}
