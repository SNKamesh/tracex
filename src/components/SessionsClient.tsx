"use client";

import { useState } from "react";
import AppShell from "./AppShell";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import Toggle from "./Toggle";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";

export default function SessionsClient() {
  const [micAllowed, setMicAllowed] = useState(false);
  const [beastMode, setBeastMode] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Study Sessions"
        subtitle="Create, join, and manage focus rooms."
      />

      {/* CREATE SESSION */}
      <SectionCard
        title="Create Session"
        description="Set up a shared study room."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Session Name" />
          <Select>
            <option>Max Participants: 20 (Free)</option>
            <option>Max Participants: 40 (Pro)</option>
            <option>Max Participants: 200 (Supreme)</option>
          </Select>

          <Input placeholder="Optional Password" />
          <Select>
            <option>Wallpaper Pack: HD (Free)</option>
            <option>Wallpaper Pack: 4K (Premium)</option>
          </Select>

          <Toggle
            checked={micAllowed}
            onChange={setMicAllowed}
            label="Mic (18+ Only)"
          />
          <Toggle
            checked={beastMode}
            onChange={setBeastMode}
            label="Beast Mode Lock"
          />
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button>Create Session</Button>
          <Button variant="secondary">Request Location Permission</Button>
        </div>
      </SectionCard>

      {/* SOLO SESSION */}
      <SectionCard
        title="Solo Session"
        description="Deep work with customizable settings."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Select>
            <option>Wallpaper: HD (Free)</option>
            <option>Wallpaper: 4K (Premium)</option>
          </Select>

          <Select>
            <option>Focus Audio: White Noise</option>
            <option>Focus Audio: Rain</option>
            <option>Focus Audio: Cafe</option>
            <option>Focus Audio: Lofi</option>
            <option>Focus Audio: Piano</option>
            <option>Focus Audio: Brainwave (Supreme)</option>
            <option>Focus Audio: 8D</option>
          </Select>

          <Toggle
            checked={beastMode}
            onChange={setBeastMode}
            label="Deep Work Mode"
          />
          <Toggle
            checked={micAllowed}
            onChange={setMicAllowed}
            label="Mic (18+ Only)"
          />

          <Select>
            <option>Auto-breaks: 25/5</option>
            <option>Auto-breaks: 50/10</option>
            <option>Auto-breaks: 90/15</option>
          </Select>

          <Select>
            <option>Ambient AI Lighting: Focus</option>
            <option>Ambient AI Lighting: Calm</option>
            <option>Ambient AI Lighting: Night</option>
          </Select>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button>Start Solo Session</Button>
          <Button variant="secondary">Sync Desktop Wallpaper</Button>
          <Button variant="secondary">AI Snapshot Notes</Button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          Custom media URLs are disabled.
        </p>
      </SectionCard>

      {/* BEAST MODE */}
      <SectionCard
        title="Beast Mode"
        description="Unbreakable focus lock for Pro & Supreme."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Select>
            <option>Timer: 15 minutes</option>
            <option>Timer: 30 minutes</option>
            <option>Timer: 45 minutes</option>
            <option>Timer: 60 minutes</option>
            <option>Timer: 90 minutes</option>
          </Select>

          <Button>Long-Press to Activate</Button>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
            No exit, no disabling blocker, no uninstall, no tab/app switching.
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300">
            MicroStrict: seat/motion detection, penalties, multi-device lock.
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button variant="secondary">Beast Report</Button>
          <span className="chip">AI Distraction Logs</span>
        </div>
      </SectionCard>

      {/* JOIN SESSION */}
      <SectionCard
        title="Join Session"
        description="Enter a code or browse public rooms."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Session Code" />
          <Button>Join</Button>
          <Button variant="secondary">Browse Public Rooms</Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 mt-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            Public Room: Focus Lounge • 12 participants • HD Wallpaper
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            Public Room: Exam Sprint • 24 participants • HD Wallpaper
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}