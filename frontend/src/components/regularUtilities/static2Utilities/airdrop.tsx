import React, { useMemo, useState } from "react";

type EligibilityRule = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  detail: string;
};

type Campaign = {
  name: string;
  token: string;
  deadline: string;
  claimWindow: string;
  minScore: number;
  reward: string;
};

const rules: EligibilityRule[] = [
  { id: "tx", label: "Historic transaction activity", passed: true, weight: 28, detail: "Wallet has interacted with supported protocols." },
  { id: "age", label: "Wallet age threshold", passed: true, weight: 18, detail: "Address has been active for longer than the minimum period." },
  { id: "bridge", label: "Cross-chain bridge usage", passed: false, weight: 14, detail: "Bridge interaction is not yet detected." },
  { id: "dao", label: "DAO participation", passed: true, weight: 16, detail: "Governance votes were found in the wallet history." },
  { id: "nft", label: "NFT ownership", passed: false, weight: 10, detail: "No qualifying NFT holdings were detected." },
  { id: "defi", label: "DeFi depth", passed: true, weight: 14, detail: "Liquidity and lending activity increase the score." },
];

const campaigns: Campaign[] = [
  { name: "Protocol Genesis", token: "GEN", deadline: "2026-07-01", claimWindow: "14 days", minScore: 62, reward: "Tiered token allocation" },
  { name: "Community Builders", token: "BUILD", deadline: "2026-06-18", claimWindow: "30 days", minScore: 48, reward: "Contribution badge + tokens" },
  { name: "Liquidity Season", token: "LIQ", deadline: "2026-06-30", claimWindow: "7 days", minScore: 70, reward: "Liquidity incentives" },
];

function pct(p: number) {
  return `${p.toFixed(1)}%`;
}

function scoreFromRules(items: EligibilityRule[]) {
  return items.reduce((sum, item) => sum + (item.passed ? item.weight : 0), 0);
}

export default function AirdropEligibilityChecker() {
  const [query, setQuery] = useState("");
  const [campaignIndex, setCampaignIndex] = useState(0);
  const [showOnlyPassed, setShowOnlyPassed] = useState(false);

  const campaign = campaigns[campaignIndex];
  const eligibleScore = useMemo(() => scoreFromRules(rules), []);
  const rows = useMemo(() => {
    return rules.filter((rule) => {
      const matchesText = `${rule.label} ${rule.detail}`.toLowerCase().includes(query.toLowerCase());
      const matchesPass = showOnlyPassed ? rule.passed : true;
      return matchesText && matchesPass;
    });
  }, [query, showOnlyPassed]);

  const progress = Math.min(100, (eligibleScore / campaign.minScore) * 100);
  const likelyEligible = eligibleScore >= campaign.minScore;

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Automated Airdrop Eligibility Checker</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Analyze wallet activity against campaign rules, display a clear eligibility score, and track claim windows for multiple token drops.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Score" value={eligibleScore.toString()} />
          <Metric label="Threshold" value={campaign.minScore.toString()} />
          <Metric label="Likelihood" value={likelyEligible ? "Eligible" : "Below threshold"} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rule or explanation"
              className="w-full rounded-2xl border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700"
            />
            <button
              onClick={() => setShowOnlyPassed((value) => !value)}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              {showOnlyPassed ? "Show all" : "Passed only"}
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {rows.map((rule) => (
              <article
                key={rule.id}
                className={`rounded-2xl border px-4 py-3 ${
                  rule.passed
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{rule.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{rule.detail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {rule.passed ? `+${rule.weight}` : 0}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{rule.passed ? "counted" : "missing"}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="grid gap-3 sm:grid-cols-2">
            {campaigns.map((item, index) => (
              <button
                key={item.name}
                onClick={() => setCampaignIndex(index)}
                className={`rounded-2xl border px-4 py-3 text-left ${
                  index === campaignIndex
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="font-medium">{item.name}</div>
                <div className="text-xs opacity-75">{item.token}</div>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Campaign summary</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{campaign.reward}</div>
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                Deadline {campaign.deadline}
                <br />
                Claim window {campaign.claimWindow}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Line label="Eligibility score" value={`${eligibleScore} / ${campaign.minScore}`} />
              <Line label="Progress" value={pct(progress)} />
              <Line label="Status" value={likelyEligible ? "Likely claimable" : "Not yet claimable"} />
            </div>

            <div className="mt-4 h-3 rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-3 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
