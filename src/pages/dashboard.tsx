"use client";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatCard from "@/components/StatCard";

const weeklyStats = [
  { label: "Total Study Hours", value: "26h 40m" },
  { label: "Deep Focus Hours", value: "18h 15m" },
  { label: "Distraction Hours", value: "2h 10m" },
  { label: "Tasks Done", value: "42" },
  { label: "Beast Mode Time", value: "4h 25m" },
  { label: "Streak", value: "12 days" },
];

const achievements = [
  "7-Day Beast Streak",
  "100 Focus Sessions",
  "Zero Distraction Day",
  "Night Owl Master",
];

export default function Dashboard() {
  return (
    <AppShell>
      <PageHeader title="Dashboard" subtitle="Your study performance summary" />

      <SectionCard title="Weekly Stats" description="Your productivity overview">
        <div className="grid gap-3 md:grid-cols-2">
          {weeklyStats.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Achievements" description="Milestones you’ve unlocked">
        <ul className="list-disc pl-6 text-slate-300">
          {achievements.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </SectionCard>
    </AppShell>
  );
}