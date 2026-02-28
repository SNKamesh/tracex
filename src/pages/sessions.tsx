import { useState } from "react"
import AppShell from "@/components/AppShell"
import Button from "@/components/Button"
import Input from "@/components/Input"
import PageHeader from "@/components/PageHeader"
import SectionCard from "@/components/SectionCard"
import Select from "@/components/Select"
import Toggle from "@/components/Toggle"

export default function Sessions() {
  const [micAllowed, setMicAllowed] = useState(false)
  const [beastMode, setBeastMode] = useState(false)

  return (
    <AppShell>
      <PageHeader
        title="Study Sessions"
        subtitle="Create, join, or run a solo session with full focus protection."
      />
      <SectionCard title="Create Session" description="Set up a room for your group.">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Session name" />
          <Select>
            <option>Max Participants: 20 (Free)</option>
            <option>Max Participants: 40 (Pro)</option>
            <option>Max Participants: 200 (Supreme)</option>
          </Select>
          <Input placeholder="Optional password" />
          <Select>
            <option>Wallpaper Pack: HD (Free)</option>
            <option>Wallpaper Pack: 4K (Premium)</option>
          </Select>
          <Toggle checked={micAllowed} onChange={setMicAllowed} label="Mic (18+ Only)" />
          <Toggle checked={beastMode} onChange={setBeastMode} label="Beast Mode Lock" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button>Create Session</Button>
          <Button variant="secondary">Request Location Permission</Button>
        </div>
      </SectionCard>
      <SectionCard title="Solo Session" description="Personal deep work experience.">
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
          <Toggle checked={beastMode} onChange={setBeastMode} label="Deep Work Mode" />
          <Toggle checked={micAllowed} onChange={setMicAllowed} label="Mic (18+ Only)" />
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
        <div className="flex flex-wrap gap-3">
          <Button>Start Solo Session</Button>
          <Button variant="secondary">Sync Desktop Wallpaper</Button>
          <Button variant="secondary">Enable AI Snapshot Notes</Button>
        </div>
        <p className="text-xs text-slate-400">Custom media URLs are disabled.</p>
      </SectionCard>
      <SectionCard title="Beast Mode" description="Unbreakable focus lock for Pro and Supreme.">
        <div className="grid gap-3 md:grid-cols-2">
          <Select>
            <option>Timer: 15 minutes</option>
            <option>Timer: 30 minutes</option>
            <option>Timer: 45 minutes</option>
            <option>Timer: 60 minutes</option>
            <option>Timer: 90 minutes</option>
          </Select>
          <Button>Long-Press to Activate</Button>
          <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            No exit, no disabling blocker, no uninstalling extension, no tab/app switching, full
            screen lock overlay.
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            MicroStrict (Supreme): seat/motion detection, tab penalties, multi-device lock.
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Beast Report</Button>
          <span className="chip">AI distraction attempt logs</span>
        </div>
      </SectionCard>
      <SectionCard title="Join Session" description="Enter code or browse public rooms.">
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Enter session code" />
          <Button>Join</Button>
          <Button variant="secondary">Browse Public Rooms</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            Public Room: Focus Lounge • 12 participants • HD Wallpaper
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            Public Room: Exam Sprint • 24 participants • HD Wallpaper
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Group Session UI" description="Live controls for active rooms.">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            Top-left: Timer + Date
            <br />
            Top-right: Add/Block User, Lock Room, Change Wallpaper (HD), Mic (18+), Video Toggle,
            AI Safety Filter
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            Right Sidebar: Participants, Wallpapers, Study Plan (self-edit only, synced)
            <br />
            Features: Motivation Cards, Shared Goals, Host Pomodoro Sync, Attendance, Distraction
            Detection, Leaderboard, Silent Camera Mode, Breakout Rooms (Supreme)
          </div>
        </div>
        <p className="text-xs text-slate-400">Custom URLs are disabled for wallpaper, audio, and video.</p>
      </SectionCard>
    </AppShell>
  )
}
