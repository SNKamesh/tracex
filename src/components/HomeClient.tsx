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

function generateTracexId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TRX-";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export default function HomeClient() {
  const [isPremium, setIsPremium] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingData>(() => {
    // Try to load instantly from localStorage on first render
    try {
      if (typeof window !== "undefined") {
        const keys = Object.keys(localStorage).filter(k => k.startsWith("tracex:onboarding:"));
        if (keys.length > 0) {
          const stored = localStorage.getItem(keys[0]);
          if (stored) return JSON.parse(stored);
        }
      }
    } catch { /* ignore */ }
    return {};
  });
  const [loaded, setLoaded] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { getAuth, onAuthStateChanged } = await import("firebase/auth");
      const auth = getAuth();

      onAuthStateChanged(auth, async (user) => {
        if (!user || cancelled) return;

        try {
          const {
            getFirestore,
            doc,
            getDoc,
            updateDoc,
            setDoc,
            collection,
            query,
            where,
            getDocs,
          } = await import("firebase/firestore");

          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);

          let data: Record<string, any> = {};

          if (snap.exists()) {
            data = snap.data() as Record<string, any>;
          } else {
            try {
              const stored = localStorage.getItem(`tracex:onboarding:${user.uid}`);
              if (stored) data = JSON.parse(stored);
            } catch {
              data = {};
            }
          }

          // Auto-generate TraceX ID if missing — works for NEW and EXISTING users
          if (!data.tracexId) {
            let tracexId = generateTracexId();

            // Collision check
            let isUnique = false;
            while (!isUnique) {
              const q = query(
                collection(db, "users"),
                where("tracexId", "==", tracexId)
              );
              const existing = await getDocs(q);
              if (existing.empty) {
                isUnique = true;
              } else {
                tracexId = generateTracexId();
              }
            }

            // Save to Firestore silently
            if (snap.exists()) {
              await updateDoc(userRef, { tracexId });
            } else {
              await setDoc(userRef, {
                name: data.name || "",
                studyType: data.studyType || "",
                email: user.email ?? "",
                tracexId,
                createdAt: Date.now(),
              });
            }

            data.tracexId = tracexId;

            try {
              localStorage.setItem(
                `tracex:onboarding:${user.uid}`,
                JSON.stringify({ ...data, tracexId })
              );
            } catch { /* ignore */ }
          }

          if (!cancelled) {
            setOnboarding({
              name: data.name,
              studyType: data.studyType,
              tracexId: data.tracexId,
            });
            setLoaded(true);
          }
        } catch (err) {
          console.error("HomeClient init error:", err);
          if (!cancelled) setLoaded(true);
        }
      });
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const greeting = useMemo(() => greetingByHour(new Date().getHours()), []);

  const title = loaded
    ? `${greeting}, ${onboarding.name || "Scholar"}`
    : greeting;

  const subtitle = onboarding.studyType
    ? `${onboarding.studyType} learner • TraceX dashboard is active.`
    : "TraceX dashboard is active.";

  function handleCopyId() {
    if (!onboarding.tracexId) return;
    navigator.clipboard.writeText(onboarding.tracexId).then(() => {
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    });
  }

  return (
    <AppShell>
      <PageHeader
        title={title}
        subtitle={subtitle}
        rightSlot={<Toggle checked={isPremium} onChange={setIsPremium} label="Premium" />}
      />

      {/* TraceX ID Badge */}
      <div className="flex items-center gap-2 -mt-2 mb-4">
        <span className="text-xs text-slate-500">TraceX ID:</span>
        {loaded ? (
          onboarding.tracexId ? (
            <>
              <span
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md"
                style={{
                  background: "rgba(0,216,255,0.08)",
                  color: "#00d8ff",
                  border: "1px solid rgba(0,216,255,0.2)",
                  letterSpacing: "0.06em",
                }}
              >
                {onboarding.tracexId}
              </span>
              <button
                onClick={handleCopyId}
                className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {idCopied ? "✓ Copied" : "Copy"}
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-600 italic">Generating…</span>
          )
        ) : (
          <span className="text-xs text-slate-700 italic">Loading…</span>
        )}
      </div>

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
