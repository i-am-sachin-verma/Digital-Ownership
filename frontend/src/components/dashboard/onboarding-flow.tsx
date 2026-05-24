import { useMemo, useReducer, useCallback, useEffect, useState } from "react";

export type OnboardingFlowStep = "draft" | "review" | "final";

export interface OnboardingFlowField {
  key: string;
  label: string;
  value: string;
  required?: boolean;
  helper?: string;
}

export interface OnboardingFlowState {
  step: OnboardingFlowStep;
  title: string;
  fields: Record<string, string>;
  touched: Record<string, boolean>;
  errors: Record<string, string>;
  draftSavedAt?: string;
  isSubmitting: boolean;
  submitted: boolean;
}

type OnboardingFlowAction =
  | { type: "edit"; key: string; value: string }
  | { type: "touch"; key: string }
  | { type: "next" }
  | { type: "prev" }
  | { type: "saving" }
  | { type: "saved"; at: string }
  | { type: "submit" }
  | { type: "submitted" }
  | { type: "reset" };

const OnboardingFlowSections: OnboardingFlowField[] = [
  { key: "name", label: "Personalized Name", value: "", required: true, helper: "A short label for the proposal." },
  { key: "scope", label: "Onboarding Scope", value: "", required: true, helper: "Explain the affected module or users." },
  { key: "notes", label: "Flow Notes", value: "", helper: "Include assumptions, constraints, and rollout details." },
  { key: "references", label: "References", value: "", helper: "Add links to related contracts, docs, or discussions." },
  { key: "risks", label: "Risks", value: "", helper: "Call out security, UX, or implementation risks." },
];

function createInitialState(componentName: string): OnboardingFlowState {
  return {
    step: "draft",
    title: componentName,
    fields: Object.fromEntries(
      OnboardingFlowSections.map((field) => [field.key, field.value])
    ),
    touched: {},
    errors: {},
    isSubmitting: false,
    submitted: false,
  };
}

function validateFields(fields: Record<string, string>) {
  const errors: Record<string, string> = {};
  if (!fields.name.trim()) errors.name = "Title is required.";
  if (!fields.scope.trim()) errors.scope = "Scope is required.";
  if (fields.notes.trim().length < 24) errors.notes = "Add more context for reviewers.";
  if (fields.risks.trim().length > 240 && fields.risks.trim().length < 8) errors.risks = "Describe the risk more clearly.";
  return errors;
}

function reducer(state: OnboardingFlowState, action: OnboardingFlowAction): OnboardingFlowState {
  switch (action.type) {
    case "edit": {
      const fields = { ...state.fields, [action.key]: action.value };
      return {
        ...state,
        fields,
        errors: validateFields(fields),
      };
    }
    case "touch":
      return { ...state, touched: { ...state.touched, [action.key]: true } };
    case "next":
      return { ...state, step: state.step === "draft" ? "review" : "final" };
    case "prev":
      return { ...state, step: state.step === "final" ? "review" : "draft" };
    case "saving":
      return { ...state, isSubmitting: true };
    case "saved":
      return { ...state, isSubmitting: false, draftSavedAt: action.at };
    case "submit":
      return { ...state, isSubmitting: true };
    case "submitted":
      return { ...state, isSubmitting: false, submitted: true, step: "final" };
    case "reset":
      return createInitialState(state.title);
    default:
      return state;
  }
}

function useDraftAutosave(fields: Record<string, string>, enabled: boolean, onSaved: (at: string) => void) {
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => {
      const stamp = new Date().toISOString();
      onSaved(stamp);
      window.localStorage.setItem("draft:last", JSON.stringify({ fields, stamp }));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [enabled, fields, onSaved]);
}

function StepBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={
        "rounded-full px-3 py-1 text-xs font-medium " +
        (active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600")
      }
    >
      {label}
    </span>
  );
}

function FieldEditor({
  field,
  value,
  error,
  onChange,
  onBlur,
}: {
  field: OnboardingFlowField;
  value: string;
  error?: string;
  onChange: (next: string) => void;
  onBlur: () => void;
}) {
  return (
    <label className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="text-sm font-semibold text-slate-900">
        {field.label}
        {field.required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        rows={4}
        className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
        placeholder={field.helper}
      />
      <span className="text-xs text-slate-500">{field.helper}</span>
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

function ReviewPanel({ fields }: { fields: Record<string, string> }) {
  const entries = Object.entries(fields);
  return (
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Live review</h3>
      <div className="grid gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="grid gap-1 rounded-xl bg-white p-3 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{key}</div>
            <div className="text-sm text-slate-900">{value || "—"}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionRow({
  step,
  disabled,
  onBack,
  onNext,
  onSave,
  onSubmit,
}: {
  step: OnboardingFlowStep;
  disabled: boolean;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
      <button type="button" onClick={onBack} className="rounded-xl border px-4 py-2 text-sm font-medium">Back</button>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onSave} className="rounded-xl border px-4 py-2 text-sm font-medium">Save draft</button>
        {step !== "final" ? (
          <button type="button" onClick={onNext} disabled={disabled} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            Continue
          </button>
        ) : (
          <button type="button" onClick={onSubmit} disabled={disabled} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

export default function OnboardingFlow() {
  const [state, dispatch] = useReducer(reducer, createInitialState("Implement a Personalized Dashboard Onboarding Flow with Step Completion and Default Layout Setup"));
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const hasErrors = useMemo(() => Object.keys(state.errors).length > 0, [state.errors]);

  const canAdvance = useMemo(() => {
    if (state.step === "draft") {
      return !state.errors.name && !state.errors.scope && !state.errors.notes;
    }
    return !hasErrors;
  }, [state.errors, state.step, hasErrors]);

  const saveDraft = useCallback(() => {
    dispatch({ type: "saving" });
    const stamp = new Date().toISOString();
    window.localStorage.setItem("saved:draft", JSON.stringify({ title: state.title, fields: state.fields, stamp }));
    dispatch({ type: "saved", at: stamp });
  }, [state.fields, state.title]);

  const submit = useCallback(() => {
    dispatch({ type: "submit" });
    window.setTimeout(() => dispatch({ type: "submitted" }), 650);
  }, []);

  useDraftAutosave(state.fields, autoSaveEnabled, (at) => dispatch({ type: "saved", at }));

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-6">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Governance workflow</p>
        <h2 className="text-2xl font-semibold text-slate-900">{"Implement a Personalized Dashboard Onboarding Flow with Step Completion and Default Layout Setup"}</h2>
        <p className="max-w-3xl text-sm text-slate-600">
          {"Create an onboarding experience that helps users set up their preferred dashboard structure and default widgets. * Guide users through setup steps * Offer preset layout options * Track completion state across steps * Support skipping and resuming onboarding * Keep the onboarding components reusable"}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <StepBadge label="Draft" active={state.step === "draft"} />
        <StepBadge label="Review" active={state.step === "review"} />
        <StepBadge label="Final" active={state.step === "final"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Details</h3>
              <p className="text-sm text-slate-500">Compose, review, and finalize the proposal.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={autoSaveEnabled} onChange={(event) => setAutoSaveEnabled(event.target.checked)} />
              Auto-save
            </label>
          </div>

          <div className="grid gap-4">
            OnboardingFlowSections.map((field) => (
              <FieldEditor
                key={field.key}
                field={field}
                value={state.fields[field.key]}
                error={state.touched[field.key] ? state.errors[field.key] : undefined}
                onChange={(next) => dispatch({ type: "edit", key: field.key, value: next })}
                onBlur={() => dispatch({ type: "touch", key: field.key })}
              />
            ))}
          </div>

          <ActionRow
            step={state.step}
            disabled={!canAdvance || state.isSubmitting}
            onBack={() => dispatch({ type: "prev" })}
            onNext={() => dispatch({ type: "next" })}
            onSave={saveDraft}
            onSubmit={submit}
          />
        </section>

        <aside className="grid gap-4">
          <ReviewPanel fields={state.fields} />
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Status</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p>Step: {state.step}</p>
              <p>Submitting: {state.isSubmitting ? "Yes" : "No"}</p>
              <p>Submitted: {state.submitted ? "Completed" : "Pending"}</p>
              <p>Draft saved: {state.draftSavedAt ?? "Not yet"}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}