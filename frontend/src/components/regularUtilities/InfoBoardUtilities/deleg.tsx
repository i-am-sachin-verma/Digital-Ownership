import React, { useMemo, useState } from "react";

type Delegate = {
  id: string;
  name: string;
  protocol: string;
  votingPower: number;
  participation: number;
  specialization: string;
  stance: "Progressive" | "Balanced" | "Conservative";
  votesCast: number;
  delegators: number;
  about: string;
};

const delegates: Delegate[] = [
  { id: "del_1", name: "Ada Ledger", protocol: "Astra DAO", votingPower: 8.2, participation: 97, specialization: "Treasury & grants", stance: "Balanced", votesCast: 214, delegators: 1580, about: "Focuses on treasury safety, grant allocation, and operational transparency." },
  { id: "del_2", name: "Mika Flow", protocol: "Orbit DAO", votingPower: 6.5, participation: 91, specialization: "Product strategy", stance: "Progressive", votesCast: 186, delegators: 1120, about: "Supports growth-oriented proposals and active ecosystem tooling." },
  { id: "del_3", name: "Rin Node", protocol: "Astra DAO", votingPower: 9.1, participation: 99, specialization: "Governance process", stance: "Conservative", votesCast: 248, delegators: 2420, about: "Prioritizes robust review, quorum health, and policy consistency." },
  { id: "del_4", name: "Nova Trail", protocol: "Halo Guild", votingPower: 5.3, participation: 84, specialization: "Community programs", stance: "Progressive", votesCast: 143, delegators: 860, about: "Advocates for community incentives and contributor recognition." },
  { id: "del_5", name: "Quinn Arc", protocol: "Orbit DAO", votingPower: 7.7, participation: 95, specialization: "Risk analysis", stance: "Balanced", votesCast: 203, delegators: 1760, about: "Adds risk framing to proposals and checks dependency assumptions." },
  { id: "del_6", name: "Sora Chain", protocol: "Halo Guild", votingPower: 4.8, participation: 89, specialization: "Developer relations", stance: "Balanced", votesCast: 128, delegators: 740, about: "Liaises with builders and ensures proposal clarity for implementers." }
];

function formatPower(v: number) {
  return `${v.toFixed(1)}%`;
}

function stanceStyle(v: Delegate["stance"]) {
  if (v === "Progressive") return "bg-emerald-50 text-emerald-700";
  if (v === "Conservative") return "bg-slate-100 text-slate-700";
  return "bg-amber-50 text-amber-700";
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

export default function GovernanceDelegationMarketplace() {
  const [protocol, setProtocol] = useState("All");
  const [stance, setStance] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Delegate | null>(delegates[0]);

  const filtered = useMemo(() => {
    return delegates.filter((d) => {
      const protocolMatch = protocol === "All" || d.protocol === protocol;
      const stanceMatch = stance === "All" || d.stance === stance;
      const textMatch = d.name.toLowerCase().includes(query.toLowerCase()) || d.specialization.toLowerCase().includes(query.toLowerCase());
      return protocolMatch && stanceMatch && textMatch;
    });
  }, [protocol, stance, query]);

  const avgParticipation = filtered.length
    ? filtered.reduce((sum, d) => sum + d.participation, 0) / filtered.length
    : 0;
  const totalVotingPower = filtered.reduce((sum, d) => sum + d.votingPower, 0);
  const totalDelegators = filtered.reduce((sum, d) => sum + d.delegators, 0);
  const topDelegate = [...filtered].sort((a, b) => b.votingPower - a.votingPower)[0];

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
          <p className="text-sm text-slate-300">Issue 44</p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Governance Delegation Marketplace</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Browse delegates by specialization, voting record, and alignment to make governance delegation easier to trust.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-sm text-slate-300">Top delegate</p>
              <p className="text-xl font-semibold">{topDelegate?.name ?? "—"}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Stat label="Delegates found" value={`${filtered.length}`} note="After filters" />
          <Stat label="Voting power" value={formatPower(totalVotingPower)} note="Combined delegate weight" />
          <Stat label="Participation" value={`${avgParticipation.toFixed(1)}%`} note="Average governance activity" />
          <Stat label="Delegators represented" value={totalDelegators.toLocaleString()} note="Across visible profiles" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Filters</h3>
            <div className="mt-4 space-y-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search delegate or skill..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option>All</option>
                <option>Astra DAO</option>
                <option>Orbit DAO</option>
                <option>Halo Guild</option>
              </select>
              <select value={stance} onChange={(e) => setStance(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3">
                <option>All</option>
                <option>Progressive</option>
                <option>Balanced</option>
                <option>Conservative</option>
              </select>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Delegate profiles mix voting history, participation rate, and specialization to support informed delegation.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Delegate cards</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={`rounded-2xl border p-4 text-left transition ${selected?.id === d.id ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{d.name}</h4>
                      <p className="text-sm text-slate-500">{d.protocol}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${stanceStyle(d.stance)}`}>{d.stance}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Voting power</p>
                      <p className="mt-1 font-semibold">{formatPower(d.votingPower)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Participation</p>
                      <p className="mt-1 font-semibold">{d.participation}%</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Delegate profile</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${selected ? stanceStyle(selected.stance) : "bg-slate-100 text-slate-700"}`}>
                {selected?.stance ?? "—"}
              </span>
            </div>
            {selected && (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">About</p>
                  <p className="mt-2 text-slate-800">{selected.about}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Votes cast</p>
                    <p className="mt-1 text-2xl font-bold">{selected.votesCast}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Delegators</p>
                    <p className="mt-1 text-2xl font-bold">{selected.delegators.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Specialization</p>
                    <p className="mt-1 text-base font-semibold">{selected.specialization}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Governance alignment</span>
                    <span>{selected.participation}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: `${selected.participation}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Voting history</h3>
            <div className="mt-4 space-y-3">
              {[
                { title: "Treasury diversification vote", status: "Supported", when: "2 days ago" },
                { title: "Grant program expansion", status: "Supported", when: "5 days ago" },
                { title: "Protocol fee change", status: "Abstained", when: "9 days ago" },
                { title: "Delegate compensation update", status: "Rejected", when: "12 days ago" }
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.when}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Delegation action</p>
              <p className="mt-1 text-sm text-slate-600">
                Use a delegate profile to open a delegation flow, compare alignment, and assign voting power safely.
              </p>
              <button className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                Delegate to {selected?.name ?? "selected delegate"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
