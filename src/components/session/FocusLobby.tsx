"use client";

import { useState } from "react";
import { ArrowRight, Focus } from "lucide-react";
import FocusWorldCard from "./FocusWorldCard";
import FocusBoot from "./FocusBoot";
import FocusRoom from "./FocusRoom";

const worlds = [
  { id: "orbit", name: "Orbit Station", description: "Quiet, spacious ambience for long stretches of deep work." },
  { id: "rain", name: "Neo Library", description: "A rainy reading-room atmosphere for calm, steady study." },
  { id: "exam", name: "Exam Arena", description: "A minimal, focused setting for timed practice and revision." },
  { id: "zen", name: "Zen Garden", description: "A softer environment for reflection and lighter tasks." },
];

export default function FocusLobby() {
  const [selected, setSelected] = useState(worlds[0]);
  const [phase, setPhase] = useState<"lobby" | "boot" | "room">("lobby");

  if (phase === "boot") return <FocusBoot onComplete={() => setPhase("room")} />;
  if (phase === "room") return <FocusRoom world={selected} />;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[20px] border p-6 sm:p-8" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="relative z-10 max-w-2xl">
          <p className="tx-eyebrow">Focus spaces</p>
          <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-.05em] sm:text-[40px]">Choose the atmosphere. Then get to work.</h1>
          <p className="mt-3 max-w-xl text-[13px] leading-6" style={{ color: "var(--muted)" }}>Pick a visual environment to make your study session feel intentional. These are personal ambience presets, not live public rooms.</p>
        </div>
        <div className="pointer-events-none absolute -right-12 -top-20 hidden h-64 w-64 rounded-full border opacity-25 sm:block" style={{ borderColor: "var(--accent)" }}>
          <div className="absolute inset-7 rounded-full border" style={{ borderColor: "var(--primary)" }} />
          <div className="absolute inset-14 rounded-full border" style={{ borderColor: "var(--accent)" }} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="text-[16px] font-semibold">Select a focus space</h2><p className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>Choose one of four environments.</p></div>
          <span className="tx-eyebrow">01 / 04</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {worlds.map((world) => (
            <FocusWorldCard key={world.id} {...world} active={selected.id === world.id} onClick={() => setSelected(world)} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[18px] border p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--border)", background: "var(--background-soft)" }}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ color: "var(--primary)", background: "var(--surface)" }}><Focus size={19} /></span>
          <div><p className="tx-eyebrow">Selected environment</p><h3 className="mt-1 text-[17px] font-semibold">{selected.name}</h3><p className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>{selected.description}</p></div>
        </div>
        <button type="button" onClick={() => setPhase("boot")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "var(--primary)" }}>Start focus session <ArrowRight size={16} /></button>
      </section>
    </div>
  );
}
