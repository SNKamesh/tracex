"use client";

import { useState } from "react";
import AppShell from "./AppShell";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";
import Input from "./Input";
import Select from "./Select";
import Toggle from "./Toggle";
import Button from "./Button";
import MicroStrictTracker from "./session/MicroStrictTracker";
import ImmersiveVirtualRoom from "./ImmersiveVirtualRoom";

export default function SessionsClient() {
  const [micAllowed, setMicAllowed] = useState(false);
  const [beastMode, setBeastMode] = useState(false);

  // Unified Centralized Tracking State Fields
  const [totalAccumulatedFocusSeconds, setTotalAccumulatedFocusSeconds] = useState(0);

  // Callback interface injection to catch focus timestamps passing upward out of the virtual room layer
  const handleRoomTimeBubbly = (seconds: number) => {
    setTotalAccumulatedFocusSeconds((prev) => prev + seconds);
  };

  const formatTotalTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <AppShell>
      <PageHeader
        title="TraceX Multi-Track Study Core"
        subtitle="Combine hardcore automated AI tracking with immersive multimedia environments."
      />

      {/* CENTRAL CONSOLIDATED CORE PROGRESS METRIC */}
      <div className="tx-card mb-6 flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Focus time captured in this page</h3>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Time accumulated by the active focus room in this page. Dashboard syncing is not connected yet.</p>
        </div>
        <div className="rounded-xl border px-5 py-3 font-mono text-xl font-semibold tracking-tight" style={{ background: "var(--background-soft)", borderColor: "var(--border)", color: "var(--primary)" }}>
          {formatTotalTime(totalAccumulatedFocusSeconds)}
        </div>
      </div>

      {/* PART 1: THE CORE REAL-TIME AUTOMATED ANALYTICS HUB (TOP STACK) */}
      <div className="mb-8">
        <SectionCard
          title="Focus tracking"
          description="Optional on-device focus signals and session controls."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <MicroStrictTracker />
            </div>
            
            {/* BACKWARD COMPATIBLE CREATION CONTROLLER PANELS */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session setup</h4>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Session Name" />
                <Select>
                  <option>Participant limit (not configured)</option>
                  <option>Participant limit (not configured)</option>
                  <option>Participant limit (not configured)</option>
                </Select>
                <Input placeholder="Room Password (Optional)" />
                <Select>
                  <option>Ambient Master Channel: Balanced Lofi</option>
                  <option>Ambient Master Channel: Brainwaves</option>
                </Select>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Toggle checked={micAllowed} onChange={setMicAllowed} label="Microphone verification (experimental)" />
                <Toggle checked={beastMode} onChange={setBeastMode} label="Strict focus mode" />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* PART 2: THE IMMERSIVE VIRTUAL ROOM ROOMS (BOTTOM STACK) */}
      <div className="mb-6">
        <SectionCard
          title="2. Immersive Virtual Study Lounge Room"
          description="Premium fullscreen workspace environment. Fine-tune your atmosphere with mixed audio elements and custom design patterns."
        >
          <ImmersiveVirtualRoom onAddFocusTime={handleRoomTimeBubbly} />
        </SectionCard>
      </div>
    </AppShell>
  );
}