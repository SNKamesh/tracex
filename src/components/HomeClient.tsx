"use client";

import { useEffect, useMemo, useState } from "react";
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
  { label: "Today's Hours", value: "3h 20m" },
  { label: "Focus Hours", value: "2h 45m" },
  { label: "Distraction Hours", value: "0h 35m" },
  { label: "Total Hours", value: "28h 10m" },
  { label: "Streak", value: "12 days" },
];

type OnboardingData = {
  name?: string;
  studyType?: string;
  tracexId?: string;
};

function greetingByHour(hour: number) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomeClient() {
  const [isPremium, setIsPremium] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingData>({});
  const [loaded, setLoaded] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  useEffect(() => {
    import("firebase/auth").then(({ getAuth, onAuthStateChanged }) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          import("firebase/firestore").then(({ getFirestore, doc, getDoc }) => {
            const db = getFirestore();
            getDoc(doc(db, "users", user.uid)).then((snap) => {
              if (snap.exists()) {
                const data = snap.data();
                setOnboarding({
                  name: data.name,
                  studyType: data.studyType,
                  tracexId: data.tracexId,
                });
              } else {
                // Fallback to localStorage for old users
                const stored = localStorage.getItem(`tracex:onboarding:${user.uid}`);
                if (stored) {
                  try { setOnboarding(JSON.parse(stored)); } catch { setOnboarding({}); }
                }
              }
              setLoaded(true);
            });
          });
        }
      });
    });
  }, []);

  const greeting = useMemo(() => greetingByHour(new Date().getHours()), []);

  const title = loaded
    ? `${greeting}, ${onboarding.name || "Scholar"}`
    : greeting;

  const subtitle = onboarding.studyType
    ? `${onboarding.studyType} learner • TraceX dashboard is active.`
    : "TraceX dashboard is active.";

  function handleCopyId() {
    if (onboarding.tracexId) {
      navigator.clipboard.writeText(onboarding.tracexId);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title={title}
        subtitle={subtitle}
        rightSlot={<Toggle checked={isPremium} onChange={setIsPremium} label="Premium" />}
      />

      {/* ── TraceX ID Badge ──────────────────────────────────────────────────── */}
      {loaded && onboarding.tracexId && (
        <div className="flex items-center gap-2 -mt-2 mb-2">
          <span className="text-xs text-slate-500">TraceX ID:</span>
          <span
            className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md"
            style={{
              background: "rgba(0,216,255,0.08)",
              color: "#00d8ff",
              border: "1px solid rgba(0,216,255,0.2)",
              letterSpacing: "0.05em",
            }}
          >
            {onboarding.tracexId}
          </span>
          <button
            onClick={handleCopyId}
            className="text-xs text-slate-500 hover:text-cyan-400 transition"
            title="Copy TraceX ID"
          >
            {idCopied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <AdsBanner visible={!isPremium} />

      <SectionCard title="Today's Study Plan" description="Add, edit, delete, reorder — syncs instantly.">
        <StudyPlanList />
      </SectionCard>

      <SectionCard title="Quick Actions" description="Open focus tools instantly.">
        <div className="flex flex-wrap gap-3">
          <Button>Solo Session</Button>
          <Button variant="secondary">Create Session</Button>
          <Button variant="secondary">Join Session</Button>
          <Button variant="secondary">NoteX Bot</Button>
        </div>
      </SectionCard>

      <SectionCard title="Recently Opened" description="Resume your recent work fast.">
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