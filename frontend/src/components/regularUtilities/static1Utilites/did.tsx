import React, { useState } from "react";

export default function IdentityProfile() {
  const [name, setName] = useState("Aniket");
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400");
  const [bio, setBio] = useState("Building a decentralized identity layer.");
  const [visible, setVisible] = useState(true);
  const [proofs, setProofs] = useState([
    "ENS ownership verified",
    "GitHub credential linked",
    "DAO membership badge",
  ]);

  function addProof() {
    setProofs((items) => [`New proof #${items.length + 1}`, ...items].slice(0, 5));
  }

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Decentralized Identity Profile</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Manage identity metadata, linked wallets, credentials, and privacy settings from a reusable profile interface.
          </p>
        </div>
        <button onClick={addProof} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">
          Add proof
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[160px_1fr]">
        <img src={avatar} alt={name} className="h-40 w-40 rounded-3xl object-cover" />
        <div className="space-y-3">
          <Input label="Display name" value={name} onChange={setName} />
          <Input label="Avatar URL" value={avatar} onChange={setAvatar} />
          <Input label="Bio" value={bio} onChange={setBio} />
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
            Public profile visibility
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Badge label="Status" value={visible ? "public" : "private"} />
        <Badge label="Linked wallets" value="2" />
        <Badge label="Identity proofs" value={`${proofs.length} proofs`} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        <div className="text-sm font-medium text-slate-900 dark:text-white">Verified proofs</div>
        <div className="mt-3 grid gap-2">
          {proofs.map((proof, index) => (
            <div key={index} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              {proof}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
      />
    </label>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
