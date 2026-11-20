import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, BarChart3, CalendarDays, Clock3, Flame, Target } from "lucide-react";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";

type SavedSession = {
  id: string;
  durationSeconds?: number;
  distractions?: number;
  worldName?: string | null;
  endedAt?: number | string | { _seconds?: number; seconds?: number };
  createdAt?: number | string | { _seconds?: number; seconds?: number };
};

function timestampOf(value: SavedSession["endedAt"]): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value && typeof value === "object") {
    const seconds = value._seconds ?? value.seconds;
    return typeof seconds === "number" ? seconds * 1000 : 0;
  }
  return 0;
}

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(timestamp));
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        if (active) {
          setSessions([]);
          setError("Sign in to see your saved study history.");
          setLoading(false);
        }
        return;
      }
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await api.get<{ sessions?: SavedSession[] }>("/api/sessions", token);
        if (active) {
          const safeSessions = Array.isArray(response.sessions) ? response.sessions : [];
          setSessions(safeSessions.filter((session) => Number(session.durationSeconds) > 0));
          setError("");
        }
      } catch (requestError) {
        console.error("Unable to load dashboard session history", requestError);
        if (active) setError("Could not load saved sessions. Check the TraceX session service and try again.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const analytics = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { key: dateKey(date), label: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date), seconds: 0 };
    });
    const todayKey = dateKey(now);
    const totalsByDay = new Map<string, number>();
    let totalSeconds = 0;
    let interruptions = 0;
    const activeDays = new Set<string>();

    sessions.forEach((session) => {
      const duration = Math.max(0, Number(session.durationSeconds) || 0);
      const timestamp = timestampOf(session.endedAt) || timestampOf(session.createdAt);
      totalSeconds += duration;
      interruptions += Math.max(0, Number(session.distractions) || 0);
      if (timestamp > 0) {
        const key = dateKey(new Date(timestamp));
        activeDays.add(key);
        totalsByDay.set(key, (totalsByDay.get(key) || 0) + duration);
      }
    });
    days.forEach((day) => { day.seconds = totalsByDay.get(day.key) || 0; });

    let streak = 0;
    const cursor = new Date(now);
    if (!activeDays.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
    while (streak < 365 && activeDays.has(dateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    const weeklySeconds = days.reduce((sum, day) => sum + day.seconds, 0);
    const peak = Math.max(1, ...days.map((day) => day.seconds));
    return { days, totalSeconds, weeklySeconds, interruptions, streak, peak, activeDayCount: days.filter((day) => day.seconds > 0).length, latest: [...sessions].sort((a, b) => timestampOf(b.endedAt) - timestampOf(a.endedAt)).slice(0, 8) };
  }, [sessions]);

  const achievements = [
    { title: "First saved session", detail: "Complete and save a focus session.", unlocked: sessions.length >= 1 },
    { title: "Five focus blocks", detail: "Save five completed sessions.", unlocked: sessions.length >= 5 },
    { title: "Five focused hours", detail: "Accumulate five hours of saved focus time.", unlocked: analytics.totalSeconds >= 5 * 3600 },
    { title: "Seven-day consistency", detail: "Record focus on seven different days.", unlocked: analytics.streak >= 7 },
  ];

  return (
    <AppShell>
      <PageHeader title="Your progress" subtitle="Your saved focus sessions, measured from actual session records." />
      {error && <p role="alert" className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "var(--border)", color: "var(--danger)", background: "var(--surface)" }}>{error}</p>}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Saved focus time", value: formatDuration(analytics.totalSeconds), detail: "Across the 30 most recent saved sessions", icon: Clock3 },
          { title: "Last 7 days", value: formatDuration(analytics.weeklySeconds), detail: `${analytics.activeDayCount} active study days`, icon: BarChart3 },
          { title: "Current streak", value: `${analytics.streak} days`, detail: "Consecutive days with a saved session", icon: Flame },
          { title: "Detected interruptions", value: String(analytics.interruptions), detail: "Tab-away events recorded in sessions", icon: Target },
        ].map(({ title, value, detail, icon: Icon }) => (
          <div key={title} className="tx-card flex items-start gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary), transparent 90%)" }}><Icon size={18} /></span>
            <span className="min-w-0"><span className="block text-[11px]" style={{ color: "var(--muted)" }}>{title}</span><strong className="mt-1 block text-xl tracking-tight">{loading ? "—" : value}</strong><span className="mt-1 block text-[10px] leading-relaxed" style={{ color: "var(--muted)" }}>{detail}</span></span>
          </div>
        ))}
      </div>

      <SectionCard title="Last 7 days" description="Daily active timer time from sessions saved to your account.">
        {loading ? <p className="py-12 text-center text-sm" style={{ color: "var(--muted)" }}>Loading your saved sessions…</p> : sessions.length === 0 ? (
          <div className="py-10 text-center">
            <Clock3 className="mx-auto" style={{ color: "var(--muted)" }} size={28} />
            <p className="mt-3 text-sm font-semibold">No saved sessions yet</p>
            <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Start a focus session and save its summary to see real analytics here.</p>
            <Button className="mt-4" onClick={() => window.location.assign("/sessions")}>Start a focus session <ArrowRight size={15} /></Button>
          </div>
        ) : (
          <div className="grid grid-cols-7 items-end gap-2 pt-3">
            {analytics.days.map((day) => (
              <div key={day.key} className="flex min-w-0 flex-col items-center gap-2">
                <span className="text-[9px] tabular-nums" style={{ color: "var(--muted)" }}>{day.seconds ? formatDuration(day.seconds) : "—"}</span>
                <div className="flex h-36 w-full items-end rounded-t-lg" style={{ background: "var(--background-soft)" }}>
                  <div className="w-full rounded-t-lg transition-all" style={{ height: day.seconds ? `${Math.max(6, day.seconds / analytics.peak * 100)}%` : "2px", background: "var(--primary)", opacity: day.seconds ? 1 : .2 }} />
                </div>
                <span className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>{day.label}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-[10px]" style={{ color: "var(--muted)" }}>Analytics are based on the 30 most recent sessions returned by your account's session history.</p>
      </SectionCard>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <SectionCard title="Recent sessions" description="Your latest saved focus blocks.">
          {loading ? <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p> : analytics.latest.length === 0 ? <p className="text-sm" style={{ color: "var(--muted)" }}>Your saved sessions will appear here.</p> : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {analytics.latest.map((session) => {
                const timestamp = timestampOf(session.endedAt) || timestampOf(session.createdAt);
                return <div key={session.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{session.worldName || "Personal focus session"}</p><p className="mt-1 text-[10px]" style={{ color: "var(--muted)" }}>{timestamp ? formatDate(timestamp) : "Saved session"}</p></div>
                  <span className="text-sm font-semibold tabular-nums">{formatDuration(Math.max(0, Number(session.durationSeconds) || 0))}</span>
                </div>;
              })}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Milestones" description="Achievements unlock from your saved session history.">
          <div className="space-y-3">
            {achievements.map((achievement) => <div key={achievement.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ color: achievement.unlocked ? "var(--primary)" : "var(--muted)", background: "var(--background-soft)" }}><Award size={16} /></span>
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{achievement.title}</p><p className="mt-0.5 text-[10px]" style={{ color: "var(--muted)" }}>{achievement.detail}</p></div>
              <span className="text-[10px] font-semibold" style={{ color: achievement.unlocked ? "var(--success)" : "var(--muted)" }}>{achievement.unlocked ? "Unlocked" : "Locked"}</span>
            </div>)}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
