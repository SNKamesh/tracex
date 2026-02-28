"use client";
import { useState } from "react"
import AppShell from "@/components/AppShell"
import AdsBanner from "@/components/AdsBanner"
import Button from "@/components/Button"
import PageHeader from "@/components/PageHeader"
import SectionCard from "@/components/SectionCard"
import StatCard from "@/components/StatCard"
import StudyPlanList from "@/components/StudyPlanList"
import Toggle from "@/components/Toggle"

const recentItems = [
  "Calculus Notes.pdf",
  "Organic Chemistry Session",
  "Week 6 Study Plan",
  "NoteX: Biology Mind Map"
]

const stats = [
  { label: "Today’s Hours", value: "3h 20m" },
  { label: "Focus Hours", value: "2h 45m" },
  { label: "Distraction Hours", value: "0h 35m" },
  { label: "Total Hours", value: "28h 10m" },
  { label: "Streak", value: "12 days" }
]

export default function Home() {
  const [isPremium, setIsPremium] = useState(false)

  return (
    <AppShell>
      <PageHeader
        title="Good Evening, Scholar"
        subtitle="Your TraceX focus dashboard is live across all sessions."
        rightSlot={<Toggle checked={isPremium} onChange={setIsPremium} label="Premium" />}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
      <AdsBanner visible={!isPremium} />
      <div id="study-plans">
        <SectionCard
          title="Today’s Study Plan"
          description="Add, edit, delete, and reorder tasks. Syncs everywhere instantly."
        >
          <StudyPlanList />
        </SectionCard>
      </div>
      <SectionCard title="Quick Actions" description="Launch focus tools fast.">
        <div className="flex flex-wrap gap-3">
          <Button>Solo Session</Button>
          <Button variant="secondary">Create Session</Button>
          <Button variant="secondary">Join Session</Button>
          <Button variant="secondary">NoteX Bot</Button>
        </div>
      </SectionCard>
      <SectionCard title="Recently Opened" description="Jump back into your last items.">
        <div className="grid gap-3 md:grid-cols-2">
          {recentItems.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
            >
              <span className="text-sm text-slate-200">{item}</span>
              <span className="chip">Open</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <div id="activity">
        <SectionCard title="Activity" description="Recent system activity and alerts.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              Beast Mode locked 2 distractions • 20 minutes ago
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              Study plan synced to 3 devices • 1 hour ago
            </div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Subscription Status" description="Premium shows no ads.">
        <div className="flex items-center gap-3">
          <span className="chip">{isPremium ? "Premium" : "Freemium"}</span>
          <p className="text-sm text-slate-400">
            Ads display only for Freemium users. Upgrade to unlock Pro/Supreme.
          </p>
        </div>
      </SectionCard>
      <div id="trash">
        <SectionCard title="Trash" description="Deleted items pending removal.">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
            <span>Deleted Session: Late Night Focus</span>
            <span className="chip">Restore</span>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}
