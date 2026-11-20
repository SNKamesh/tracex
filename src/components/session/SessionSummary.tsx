"use client";

import { useState } from "react";
import { Award, CheckCircle2, Clock, EyeOff, Loader2, RefreshCcw, Save } from "lucide-react";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

interface Props {
  seconds: number;
  interruptions: number;
  worldId?: string;
  worldName?: string;
  onRestart: () => void;
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, "0")}m`
    : `${minutes}m ${String(remainder).padStart(2, "0")}s`;
}

export default function SessionSummary({ seconds, interruptions, worldId, worldName, onRestart }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function saveSession() {
    if (saving || saved || seconds <= 0) return;
    const user = auth.currentUser;
    if (!user) {
      setError("Your sign-in session expired. Sign in again before saving this session.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const token = await user.getIdToken();
      await api.post("/api/sessions", {
        durationSeconds: seconds,
        distractions: interruptions,
        worldId: worldId || null,
        worldName: worldName || null,
        endedAt: Date.now(),
      }, token);
      setSaved(true);
    } catch (saveError) {
      console.error("Could not save focus session", saveError);
      setError("The session could not be saved. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-[65vh] items-center justify-center py-6">
      <section className="tx-card w-full max-w-3xl p-6 sm:p-10">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--success), transparent 90%)", color: "var(--success)" }}><Award size={34} /></div>
          <p className="tx-eyebrow">Session summary</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Focus session complete</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{worldName || "Personal focus space"} · Your active timer has been recorded.</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border p-5" style={{ background: "var(--background-soft)", borderColor: "var(--border)" }}>
            <Clock size={18} style={{ color: "var(--primary)" }} />
            <p className="mt-3 text-3xl font-semibold tabular-nums">{formatTime(seconds)}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Active focus time</p>
          </div>
          <div className="rounded-2xl border p-5" style={{ background: "var(--background-soft)", borderColor: "var(--border)" }}>
            <EyeOff size={18} style={{ color: "var(--primary)" }} />
            <p className="mt-3 text-3xl font-semibold tabular-nums">{interruptions}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Tab-away interruptions detected</p>
          </div>
        </div>

        <p className="mt-5 rounded-xl border p-4 text-xs leading-relaxed" style={{ borderColor: "var(--border)", color: "var(--muted)", background: "var(--background-soft)" }}>
          TraceX records the time while your focus timer is running and counts when this tab becomes hidden. It does not claim to measure attention, productivity or camera-based focus scores.
        </p>

        {error && <p role="alert" className="mt-4 text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
        {seconds <= 0 && <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>No timer time was recorded, so there is nothing to save.</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => void saveSession()} disabled={saving || saved || seconds <= 0} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--primary)" }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? "Saved to your history" : saving ? "Saving session…" : "Save session"}
          </button>
          <button type="button" onClick={onRestart} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold" style={{ borderColor: "var(--border)" }}><RefreshCcw size={16} /> New session</button>
        </div>
      </section>
    </div>
  );
}
