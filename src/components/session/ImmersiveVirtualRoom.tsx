"use client";

import { useEffect, useState } from "react";
import { Quote, Users } from "lucide-react";

interface Props {
  world?: { id: string; name: string };
}

const quotes = [
  "Deep work beats long work.",
  "Small focus today. Massive results tomorrow.",
  "Discipline creates freedom.",
  "Your future self is watching.",
];

function RoomScene({ id }: { id?: string }) {
  const scene = id || "orbit";
  const accent = scene === "zen" ? "#A5B38D" : scene === "rain" ? "#9CB8B4" : scene === "exam" ? "#D17A55" : "#A8A6C9";
  return (
    <svg viewBox="0 0 900 360" aria-hidden="true" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="room-fade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={accent} stopOpacity=".22" /><stop offset="1" stopColor="#11150F" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="900" height="360" fill="url(#room-fade)" />
      {scene === "rain" ? <>
        <rect x="255" y="40" width="390" height="220" rx="12" fill="none" stroke={accent} strokeOpacity=".5" strokeWidth="2" />
        <path d="M450 40V260M255 150H645" stroke={accent} strokeOpacity=".35" strokeWidth="2" />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={\`M\${280 + i * 24} 62l-8 18m\${26 + i * 24} 66l-8 18m\${10 + i * 24} 100l-8 18\`} stroke={accent} strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />)}
      </> : scene === "zen" ? <>
        <path d="M100 280C230 240 310 320 450 280S690 250 800 282" fill="none" stroke={accent} strokeOpacity=".55" strokeWidth="3" />
        <path d="M450 275V115M450 188C380 95 320 120 345 182C382 213 417 210 450 188ZM450 210C516 110 576 134 551 194C516 225 481 230 450 210Z" fill={accent} fillOpacity=".22" stroke={accent} strokeOpacity=".6" strokeWidth="2" />
        <circle cx="190" cy="90" r="34" fill={accent} fillOpacity=".12" stroke={accent} strokeOpacity=".3" />
      </> : scene === "exam" ? <>
        <path d="M285 85H615V275H285Z" fill="none" stroke={accent} strokeOpacity=".5" strokeWidth="2" />
        <path d="M325 130H575M325 162H545M325 194H563M325 226H510" stroke={accent} strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
        <circle cx="690" cy="100" r="42" fill="none" stroke={accent} strokeOpacity=".55" strokeWidth="2" />
        <path d="M690 75V100L708 114" stroke={accent} strokeOpacity=".7" strokeWidth="3" fill="none" strokeLinecap="round" />
      </> : <>
        <ellipse cx="450" cy="180" rx="210" ry="76" fill="none" stroke={accent} strokeOpacity=".3" strokeWidth="2" transform="rotate(-16 450 180)" />
        <ellipse cx="450" cy="180" rx="265" ry="112" fill="none" stroke={accent} strokeOpacity=".2" strokeWidth="1.5" />
        <circle cx="450" cy="180" r="42" fill={accent} fillOpacity=".2" stroke={accent} strokeOpacity=".65" strokeWidth="2" />
        <circle cx="265" cy="125" r="7" fill={accent} /><circle cx="668" cy="218" r="5" fill={accent} />
      </>}
    </svg>
  );
}

export default function ImmersiveVirtualRoom({ world }: Props) {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    const interval = window.setInterval(() => setQuote(quotes[Math.floor(Math.random() * quotes.length)]), 8000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[300px] overflow-hidden rounded-[20px] border p-6 sm:h-[360px] sm:p-8" style={{ background: "var(--background-soft)", borderColor: "var(--border)" }}>
      <RoomScene id={world?.id} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--background), transparent 20%), color-mix(in srgb, var(--background), transparent 15%))" }} />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <p className="tx-eyebrow">Focus environment</p>
          <h2 className="mt-3 text-[32px] font-semibold tracking-[-.05em] sm:text-[42px]">{world?.name || "Focus space"}</h2>
        </div>
        <div className="max-w-xl">
          <div className="flex items-start gap-3 text-[16px] font-medium leading-relaxed sm:text-[19px]"><Quote size={18} className="mt-1 shrink-0" style={{ color: "var(--primary)" }} />{quote}</div>
          <div className="mt-5 flex items-center gap-2 text-[11px]" style={{ color: "var(--muted)" }}><Users size={14} /> Your personal focus environment</div>
        </div>
      </div>
    </div>
  );
}
