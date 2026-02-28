"use client";

import { useState } from "react";
import AdsBanner from "./AdsBanner";
import AppShell from "./AppShell";
import Button from "./Button";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";
import StatCard from "./StatCard";
import StudyPlanList from "./StudyPlanList";
import Toggle from "./Toggle";

const recentItems = [
  "Calculus Notes.pdf",
  "Organic Chemistry Session",
  "Week 6 Study Plan",
  "NoteX: Biology Mind Map",
];

const stats = [
  { label: "Today’s Hours", value: "3h 20m" },
  { label: "Focus Hours", value: "2h 45m" },
  { label: "Distraction Hours", value: "0h 35m" },
  { label: "Total Hours", value: "28h 10m" },
  { label: "Streak", value: "12 days" },
];

export default function HomeClient() {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Good Evening, Scholar"
        subtitle="Your TraceX dashboard is active."
        rightSlot={
          <Toggle
            checked={isPremium}
            onChange={setIsPremium}
            label="Premium"
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <AdsBanner visible={!isPremium} />

      <SectionCard
        title="Today’s Study Plan"
        description="Add, edit, delete, reorder — syncs instantly."
      >
        <StudyPlanList />
      </SectionCard>

      <SectionCard
        title="Quick Actions"
        description="Open focus tools instantly."
      >
        <div className="flex flex-wrap gap-3">
          <Button>Solo Session</Button>
          <Button variant="secondary">Create Session</Button>
          <Button variant="secondary">Join Session</Button>
          <Button variant="secondary">NoteX Bot</Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Recently Opened"
        description="Resume your recent work fast."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {recentItems.map((item) => (
            <div
              key={item}
              className="flex justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
            >
              <span className="text-sm text-slate-200">{item}</span>
              <span className="chip">Open</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}