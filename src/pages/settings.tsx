import AppShell from "@/components/AppShell"
import Button from "@/components/Button"
import Input from "@/components/Input"
import PageHeader from "@/components/PageHeader"
import SectionCard from "@/components/SectionCard"
import Select from "@/components/Select"
import Toggle from "@/components/Toggle"

export default function Settings() {
  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Account, privacy, sync, and device controls." />
      <SectionCard title="Account" description="Manage account and profile details.">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Display name" />
          <Select>
            <option>Profile Type: School</option>
            <option>Profile Type: University</option>
            <option>Profile Type: Competitive</option>
            <option>Profile Type: Self-learner</option>
            <option>Profile Type: Coaching</option>
            <option>Profile Type: Other</option>
          </Select>
          <Toggle checked={false} onChange={() => {}} label="Age Verification (18+)" />
          <Button variant="secondary">Upload Photo</Button>
        </div>
      </SectionCard>
      <SectionCard title="Theme" description="AMOLED, Dark, Light.">
        <div className="flex flex-wrap gap-3">
          <Button>AMOLED</Button>
          <Button variant="secondary">Dark</Button>
          <Button variant="secondary">Light</Button>
        </div>
      </SectionCard>
      <SectionCard title="Study Plan Sync" description="Live sync, backup, and export.">
        <div className="flex flex-wrap gap-3">
          <Toggle checked={true} onChange={() => {}} label="Live Sync" />
          <Button variant="secondary">Backup Now</Button>
          <Button variant="secondary">Export Plan</Button>
        </div>
      </SectionCard>
      <SectionCard title="Subscription" description="Premium / Freemium status.">
        <div className="flex items-center gap-3">
          <span className="chip">Freemium</span>
          <Button>Upgrade</Button>
        </div>
      </SectionCard>
      <SectionCard title="Premium Tiers" description="Freemium, Pro, and Supreme.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Freemium</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              <li>Ads ON</li>
              <li>HD wallpapers</li>
              <li>20 participants</li>
              <li>Basic analytics</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Pro</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              <li>Ads OFF</li>
              <li>Beast Mode</li>
              <li>40–100 participants</li>
              <li>Premium wallpapers</li>
              <li>30-day analytics</li>
              <li>Extension Pro</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Supreme</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              <li>Ads OFF</li>
              <li>Beast + MicroStrict</li>
              <li>200 participants</li>
              <li>4K wallpapers</li>
              <li>Brainwave audio</li>
              <li>Full analytics</li>
              <li>Timelapse</li>
              <li>Breakout rooms</li>
            </ul>
          </div>
        </div>
      </SectionCard>
      <SectionCard
        title="Blocker Settings"
        description="Website/app/category lists and Beast/MicroStrict."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Blocked website" />
          <Input placeholder="Blocked app" />
          <Toggle checked={false} onChange={() => {}} label="Beast Mode" />
          <Toggle checked={false} onChange={() => {}} label="MicroStrict" />
          <Toggle checked={true} onChange={() => {}} label="Incognito Detect" />
          <Toggle checked={true} onChange={() => {}} label="Tab Detect" />
        </div>
      </SectionCard>
      <SectionCard
        title="Session Settings"
        description="Solo/group defaults and safety filters."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Select>
            <option>Solo Default: HD Wallpapers</option>
            <option>Solo Default: 4K Wallpapers</option>
          </Select>
          <Toggle checked={true} onChange={() => {}} label="AI Safety Filters" />
        </div>
      </SectionCard>
      <SectionCard title="Privacy" description="Blocked users, hidden ID, mic 18+.">
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle checked={false} onChange={() => {}} label="Hide TraceX ID" />
          <Toggle checked={false} onChange={() => {}} label="Mic (18+ Only)" />
        </div>
      </SectionCard>
      <SectionCard
        title="Device Permissions"
        description="Camera, mic, notifications, usage access, accessibility."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle checked={false} onChange={() => {}} label="Camera" />
          <Toggle checked={false} onChange={() => {}} label="Microphone" />
          <Toggle checked={false} onChange={() => {}} label="Notifications" />
          <Toggle checked={false} onChange={() => {}} label="Usage Access" />
          <Toggle checked={false} onChange={() => {}} label="Accessibility" />
          <Toggle checked={false} onChange={() => {}} label="Extension Permissions" />
        </div>
      </SectionCard>
      <SectionCard title="Notifications" description="Study/break/task/daily/weekly.">
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle checked={true} onChange={() => {}} label="Study Reminders" />
          <Toggle checked={true} onChange={() => {}} label="Break Reminders" />
          <Toggle checked={true} onChange={() => {}} label="Task Alerts" />
          <Toggle checked={false} onChange={() => {}} label="Daily Summary" />
          <Toggle checked={false} onChange={() => {}} label="Weekly Summary" />
        </div>
      </SectionCard>
      <SectionCard title="Data" description="Backup, restore, clear cache.">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Backup</Button>
          <Button variant="secondary">Restore</Button>
          <Button variant="ghost">Clear Cache</Button>
        </div>
      </SectionCard>
      <SectionCard title="About" description="Version, terms, privacy.">
        <div className="flex flex-wrap gap-3">
          <span className="chip">Version 0.1.0</span>
          <Button variant="secondary">Terms</Button>
          <Button variant="secondary">Privacy</Button>
        </div>
      </SectionCard>
    </AppShell>
  )
}
