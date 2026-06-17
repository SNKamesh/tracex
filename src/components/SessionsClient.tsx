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
      <div className="mb-6 bg-gradient-to-r from-slate-950 via-blue-950/20 to-slate-950 border border-blue-900/40 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Total Unified Session Focus Pool</h3>
          <p className="text-xs text-slate-400">Merged automatic metrics and virtual room blocks ready to sync to dashboard.</p>
        </div>
        <div className="bg-slate-900/80 px-6 py-3 rounded-xl border border-slate-800/80 font-mono text-2xl font-black text-blue-400 tracking-wide shadow-inner">
          🚀 {formatTotalTime(totalAccumulatedFocusSeconds)}
        </div>
      </div>

      {/* PART 1: THE CORE REAL-TIME AUTOMATED ANALYTICS HUB (TOP STACK) */}
      <div className="mb-8">
        <SectionCard
          title="1. Automated Real-Time Analytics Engine (MicroStrict AI)"
          description="Hardware validation matrix. Monitors seating alignment, motion profiles, and device interaction."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <MicroStrictTracker />
            </div>
            
            {/* BACKWARD COMPATIBLE CREATION CONTROLLER PANELS */}
            <div className="lg:col-span-2 bg-slate-900/20 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Co-Studying Room Control Pipeline</h4>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Session Name" />
                <Select>
                  <option>Max Participants: 200 (Supreme)</option>
                  <option>Max Participants: 40 (Pro)</option>
                  <option>Max Participants: 20 Free</option>
                </Select>
                <Input placeholder="Room Password (Optional)" />
                <Select>
                  <option>Ambient Master Channel: Balanced Lofi</option>
                  <option>Ambient Master Channel: Brainwaves</option>
                </Select>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Toggle checked={micAllowed} onChange={setMicAllowed} label="Allow Microphone Verification (18+ only)" />
                <Toggle checked={beastMode} onChange={setBeastMode} label="Enforce Absolute Beast Mode Blockers" />
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