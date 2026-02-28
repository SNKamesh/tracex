"use client";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import StatCard from "@/components/StatCard";

const totals = [
  { label: "Total Hours Studied", value: "26h 40m" },
  { label: "Total Hours Distracted", value: "2h 10m" },
  { label: "Deep Focus Hours", value: "18h 15m" },
  { label: "Streak", value: "12 days" },
];

const weeklyProgress = [
  { day: "Mon", study: 3.2, distract: 0.4 },
  { day: "Tue", study: 4.0, distract: 0.3 },
  { day: "Wed", study: 2.8, distract: 0.5 },
  { day: "Thu", study: 3.9, distract: 0.2 },
  { day: "Fri", study: 4.3, distract: 0.4 },
  { day: "Sat", study: 5.1, distract: 0.2 },
  { day: "Sun", study: 3.4, distract: 0.2 },
];

const maxHours = 6;

export default function Dashboard() {
  return (
    <AppShell>
      <PageHeader title="Dashboard" subtitle="Track study focus, distraction, and weekly progress" />

      <SectionCard title="Progress Overview" description="Your learning stats this week">
        <div className="grid gap-3 md:grid-cols-2">
          {totals.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Weekly Progress Graph" description="Study vs distraction hours">
        <div className="grid grid-cols-7 gap-3 items-end h-64">
          {weeklyProgress.map((row) => {
            const studyHeight = `${(row.study / maxHours) * 100}%`;
            const distractHeight = `${(row.distract / maxHours) * 100}%`;

            return (
              <div key={row.day} className="flex flex-col items-center gap-2">
                <div className="w-full h-48 rounded-lg bg-slate-900 border border-slate-800 p-1 flex items-end gap-1 justify-center">
                  <div className="w-4 rounded bg-cyan-400" style={{ height: studyHeight }} title={`Study: ${row.study}h`} />
                  <div className="w-4 rounded bg-rose-400" style={{ height: distractHeight }} title={`Distract: ${row.distract}h`} />
                </div>
                <span className="text-xs text-slate-300">{row.day}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-cyan-400" /> Study Hours</span>
          <span className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded bg-rose-400" /> Distraction Hours</span>
        </div>
      </SectionCard>
    </AppShell>
  );
}