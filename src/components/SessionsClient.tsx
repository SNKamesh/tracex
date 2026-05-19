"use client";

import { useState } from "react";
import AppShell from "./AppShell";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import Toggle from "./Toggle";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";
import MicroStrictTracker from "./MicroStrictTracker";

export default function SessionsClient() {
  const [micAllowed, setMicAllowed] = useState(false);
  const [beastMode, setBeastMode] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Study Sessions"
        subtitle="Create, join, and manage focus rooms."
      />

      {/* THE MICROSTRICT AI TRACKER (Supreme Tier Feature) */}
      <div className="mb-6">
        <SectionCard
          title="MicroStrict Protocol (Supreme)"
          description="Local AI face-detection. No video is ever sent to the cloud. Stay in the frame to accumulate Focus Time."
        >
          <MicroStrictTracker />
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
              label="Allow Mic (18+ only)"
            />
            <Select>
              <option>Ambient Audio: Lofi</option>
              <option>Ambient Audio: White Noise</option>
              <option>Ambient Audio: Brainwaves</option>
            </Select>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Toggle
              checked={beastMode}
              onChange={setBeastMode}
              label="Enable Beast Mode"
            />
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
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 flex items-center justify-between">
              Organic Chem Grind • 4 participants
              <span className="text-xs font-bold text-red-500">Beast Active</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}