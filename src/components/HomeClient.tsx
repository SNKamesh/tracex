"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ArrowRight, BookOpen, CalendarDays, Clock3, Copy, Focus, GraduationCap, FileStack } from "lucide-react";
import AppShell from "./AppShell";
import Button from "./Button";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";
import StudyPlanList from "./StudyPlanList";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

type OnboardingData = { name?: string; studyType?: string; tracexId?: string };
type RecentPage = { path: string; title: string; visitedAt: number };
type RecentSession = { id: string; durationSeconds?: number; endedAt?: number | string; worldName?: string | null };

function greetingByHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function FocusIllustration() {
  return (
    <svg viewBox="0 0 360 250" role="img" aria-label="Illustration of a focused study desk" className="h-auto w-full max-w-[360px]">
      <defs>
        <linearGradient id="desk-paper" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#E6D9C5" />
          <stop offset="1" stopColor="#C7B59A" />
        </linearGradient>
      </defs>
      <circle cx="188" cy="120" r="100" fill="none" stroke="currentColor" opacity=".12" strokeWidth="1" />
      <circle cx="188" cy="120" r="78" fill="none" stroke="currentColor" opacity=".09" strokeDasharray="3 7" />
      <path d="M40 190H320" stroke="currentColor" strokeWidth="1.4" opacity=".24" />
      <path d="M78 190L92 218H264L280 190" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".35" />
      <path d="M116 65C116 52 128 42 141 42H223C236 42 248 52 248 65V173H116V65Z" fill="#242A22" stroke="#91A184" strokeWidth="1.5" />
      <path d="M128 72H236V160H128Z" fill="#343D31" />
      <path d="M141 91H215M141 103H203M141 115H220" stroke="#D5DCC9" strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
      <path d="M160 137L174 149L198 124" fill="none" stroke="#D17A55" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M99 175H265L282 190H82L99 175Z" fill="#A6AE94" stroke="#E2D8C7" strokeWidth="1.4" />
      <path d="M137 185H229" stroke="#475143" strokeWidth="2" strokeLinecap="round" />
      <path d="M42 69L57 55L72 69V102H42V69Z" fill="none" stroke="#D17A55" strokeWidth="2" />
      <path d="M49 83H65M49 91H62" stroke="#D17A55" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="290" cy="76" r="17" fill="#D17A55" opacity=".18" />
      <path d="M290 65V76L298 81" fill="none" stroke="#D17A55" strokeWidth="2" strokeLinecap="round" />
      <path d="M289 49V44M307 76H312M272 76H267" stroke="#D17A55" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M49 145C59 134 69 134 79 145M53 153C61 147 68 147 75 153" fill="none" stroke="#91A184" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function HomeClient() {
  const router = useRouter();
  const [onboarding, setOnboarding] = useState<OnboardingData>({});
  const [loaded, setLoaded] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [recentSessionsUnavailable, setRecentSessionsUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function init() {
      const { auth, db } = await import("@/lib/firebase");
      const { onAuthStateChanged } = await import("firebase/auth");
      const { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } = await import("firebase/firestore");

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user || cancelled) return;
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          let data: any = {};
          if (snap.exists()) data = snap.data();
          else {
            const stored = localStorage.getItem(`tracex:onboarding:${user.uid}`);
            if (stored) data = JSON.parse(stored);
          }

          if (!data.tracexId) {
            let tracexId = "";
            let unique = false;
            while (!unique) {
              tracexId = "TRX-" + Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
              const existing = await getDocs(query(collection(db, "users"), where("tracexId", "==", tracexId)));
              unique = existing.empty;
            }
            if (snap.exists()) await updateDoc(userRef, { tracexId });
            else await setDoc(userRef, { name: data.name || "", studyType: data.studyType || "", email: user.email ?? "", tracexId, createdAt: Date.now() });
            data.tracexId = tracexId;
            localStorage.setItem(`tracex:onboarding:${user.uid}`, JSON.stringify(data));
          }

          if (!cancelled) {
            setOnboarding({ name: data.name, studyType: data.studyType, tracexId: data.tracexId });
            setLoaded(true);
          }
        } catch (error) {
          console.error("Unable to load TraceX profile", error);
          if (!cancelled) setLoaded(true);
        }
      });
    }

    init().catch((error) => {
      console.error("Unable to initialize TraceX profile", error);
      if (!cancelled) setLoaded(true);
    });

    return () => { cancelled = true; unsubscribe?.(); };
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tracex:recently-opened") || "[]");
      if (Array.isArray(stored)) setRecentPages(stored.filter((item) => item && typeof item.path === "string" && typeof item.title === "string").slice(0, 6));
    } catch {
      localStorage.removeItem("tracex:recently-opened");
    }

    let active = true;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await api.get<{ sessions?: RecentSession[] }>("/api/sessions", token);
        if (active) setRecentSessions(Array.isArray(response.sessions) ? response.sessions.slice(0, 3) : []);
      } catch (requestError) {
        console.error("Unable to load recent focus sessions", requestError);
        if (active) setRecentSessionsUnavailable(true);
      }
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  function formatRecentDuration(seconds = 0) {
    const total = Math.max(0, Number(seconds) || 0);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  function formatRecentDate(value?: number | string) {
    const timestamp = typeof value === "number" ? value : typeof value === "string" ? Date.parse(value) : 0;
    return timestamp > 0 ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(timestamp)) : "Saved session";
  }

  const greeting = useMemo(() => greetingByHour(new Date().getHours()), []);
  const title = loaded ? `${greeting}, ${onboarding.name || "there"}` : greeting;

  async function handleCopyId() {
    if (!onboarding.tracexId) {
      setCopyError("Your TraceX ID is not available yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(onboarding.tracexId);
      setIdCopied(true);
      setCopyError("");
      window.setTimeout(() => setIdCopied(false), 1800);
    } catch {
      setCopyError("Clipboard access is unavailable in this browser.");
    }
  }

  return (
    <AppShell>
      <PageHeader title={title} subtitle={onboarding.studyType ? `${onboarding.studyType} · Your personal study workspace` : "Your personal space for focused learning."} />

      <section className="relative mb-6 overflow-hidden rounded-[20px] border p-5 sm:p-7 lg:p-9" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="grid items-center gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative z-10 max-w-xl">
            <p className="tx-eyebrow">A quieter way to make progress</p>
            <h2 className="mt-3 max-w-lg text-[30px] font-semibold leading-[1.08] tracking-[-.055em] sm:text-[42px]">Make time for the work that matters.</h2>
            <p className="mt-4 max-w-md text-[13px] leading-6 sm:text-sm" style={{ color: "var(--muted)" }}>Plan a study block, settle into a focus space, or learn a difficult topic with TraceX Classroom.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button onClick={() => router.push("/sessions")}>Start a focus session <ArrowRight size={15} /></Button>
              <Button variant="secondary" onClick={() => router.push("/classroom")}>Open Classroom <GraduationCap size={15} /></Button>
            </div>
            {onboarding.tracexId && <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "var(--muted)" }}>
              <span>TraceX ID</span><code className="rounded-md border px-2 py-1 font-mono" style={{ borderColor: "var(--border)", color: "var(--text)" }}>{onboarding.tracexId}</code>
              <button type="button" onClick={handleCopyId} className="inline-flex items-center gap-1.5 hover:underline"><Copy size={12} /> Copy</button>
              {idCopied && <span style={{ color: "var(--success)" }}>Copied</span>}
              {copyError && <span style={{ color: "var(--danger)" }}>{copyError}</span>}
            </div>}
          </div>
          <div className="flex justify-center lg:justify-end" style={{ color: "var(--accent)" }}><FocusIllustration /></div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.8fr)]">
        <SectionCard title="Today's study plan" description="Keep your next steps visible and manageable.">
          <StudyPlanList />
        </SectionCard>
        <div className="space-y-4">
          <SectionCard title="Recently opened" description="Pages you visited most recently on this device.">
            {recentPages.length ? <div className="space-y-2">
              {recentPages.map((page) => (
                <button key={page.path} type="button" onClick={() => router.push(page.path)} className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-[var(--surface-hover)]" style={{ borderColor: "var(--border)" }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: "var(--background-soft)", color: "var(--primary)" }}><ArrowRight size={16} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{page.title}</span><span className="mt-0.5 block text-[11px]" style={{ color: "var(--muted)" }}>Opened {formatRecentDate(page.visitedAt)}</span></span>
                  <ArrowRight size={15} style={{ color: "var(--muted)" }} />
                </button>
              ))}
            </div> : <p className="py-3 text-xs" style={{ color: "var(--muted)" }}>Your recently visited pages will appear here as you use TraceX.</p>}
          </SectionCard>
          <SectionCard title="Recent focus sessions" description="The latest sessions saved to your account.">
            {recentSessions.length ? <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="truncate text-xs font-semibold">{session.worldName || "Personal focus session"}</p><p className="mt-1 text-[10px]" style={{ color: "var(--muted)" }}>{formatRecentDate(session.endedAt)}</p></div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums">{formatRecentDuration(session.durationSeconds)}</span>
                </div>
              ))}
              <button type="button" onClick={() => router.push("/dashboard")} className="pt-3 text-[11px] font-semibold hover:underline" style={{ color: "var(--primary)" }}>View full progress</button>
            </div> : <p className="py-3 text-xs" style={{ color: "var(--muted)" }}>{recentSessionsUnavailable ? "Session history is currently unavailable." : "Saved sessions will appear here after you complete and save a focus timer."}</p>}
          </SectionCard>
          <div className="rounded-[18px] border p-5" style={{ borderColor: "var(--border)", background: "var(--background-soft)" }}>
            <div className="flex items-center gap-2 text-[13px] font-semibold"><Focus size={16} style={{ color: "var(--primary)" }} /> Start small</div>
            <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>Choose one task, set a realistic block of time, and begin. Your progress will become more useful as TraceX records real sessions.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
