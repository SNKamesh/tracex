import { useRouter } from "next/router";
import { ArrowRight, BarChart3, Clock3, TimerReset } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";

function EmptyAnalyticsGraphic() {
  return (
    <svg viewBox="0 0 520 210" role="img" aria-label="Empty weekly study chart awaiting real session data" className="h-auto w-full">
      <path d="M34 25V174H492" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".22" />
      {[55,95,135,174].map((y) => <line key={y} x1="34" y1={y} x2="492" y2={y} stroke="currentColor" opacity=".12" strokeDasharray="4 6" />)}
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => <text key={day} x={65 + i * 65} y="196" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".55">{day}</text>)}
      <path d="M65 149C100 149 114 149 130 149S175 149 195 149 240 149 260 149 305 149 325 149 370 149 390 149 435 149 455 149" fill="none" stroke="#D17A55" strokeWidth="2" strokeDasharray="5 7" opacity=".65" />
      <circle cx="260" cy="149" r="5" fill="#D17A55" opacity=".85" />
    </svg>
  );
}

export default function Dashboard() {
  const router = useRouter();
  return (
    <AppShell>
      <PageHeader title="Your progress" subtitle="A clear view of your study rhythm, built from completed sessions." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { title: "Focus time", desc: "Total time in completed sessions", icon: Clock3 },
          { title: "Study consistency", desc: "Days with a completed session", icon: TimerReset },
          { title: "Session history", desc: "Your recent focus blocks", icon: BarChart3 },
        ].map(({ title, desc, icon: Icon }) => (
          <div key={title} className="tx-card flex items-start gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary), transparent 90%)" }}><Icon size={18} /></span>
            <span><span className="block text-[13px] font-semibold">{title}</span><span className="mt-1 block text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</span></span>
          </div>
        ))}
      </div>
      <SectionCard title="Weekly overview" description="Study hours will appear here once session history is connected to the dashboard.">
        <div className="rounded-xl border p-3 sm:p-5" style={{ borderColor: "var(--border)", background: "var(--background-soft)", color: "var(--muted)" }}>
          <EmptyAnalyticsGraphic />
          <div className="mx-auto mt-2 max-w-md text-center">
            <p className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>Your chart is waiting for real data.</p>
            <p className="mt-1 text-[12px] leading-relaxed">The current dashboard does not yet read persisted session analytics. I have removed the sample hours instead of presenting them as your actual progress.</p>
            <Button className="mt-4" onClick={() => router.push("/sessions")}>Start your first session <ArrowRight size={15} /></Button>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
