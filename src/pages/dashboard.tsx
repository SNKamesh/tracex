import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"
import SectionCard from "@/components/SectionCard"
import StatCard from "@/components/StatCard"

const weeklyStats = [
  { label: "Total Study Hours", value: "26h 40m" },
  { label: "Deep Focus Hours", value: "18h 15m" },
  { label: "Distraction Hours", value: "2h 10m" },
  { label: "Tasks Done", value: "42" },
  { label: "Beast Mode Time", value: "4h 25m" },
  { label: "Streak", value: "12 days" }
]

const achievements = [
  "7-Day Beast Streak",
  "100 Focus Sessions",
  "Zero Distraction Day",
  "Night Owl Master"
]

export default function Dashboard() {
  return (
    <AppShell>
      <PageHeader
        title="Dashboard Analytics"
        subtitle="Weekly insights, focus breakdowns, and achievements."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {weeklyStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
      <SectionCard title="Charts" description="Daily and weekly focus analytics.">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-sm text-slate-400">
            Daily Chart Placeholder
          </div>
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-sm text-slate-400">
            Weekly Chart Placeholder
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Achievements" description="Unlockables and badges.">
        <div className="grid gap-3 md:grid-cols-2">
          {achievements.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  )
}
