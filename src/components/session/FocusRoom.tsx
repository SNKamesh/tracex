"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Square, Timer, EyeOff } from "lucide-react";
import CameraEngine from "./CameraEngine";
import MicroStrictTracker from "./MicroStrictTracker";
import AmbientEngine from "./AmbientEngine";
import ImmersiveVirtualRoom from "./ImmersiveVirtualRoom";
import SessionSummary from "./SessionSummary";

interface Props {
  world?: { id: string; name: string; description: string };
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [hours, minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function FocusRoom({ world }: Props) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const handleVisibility = () => {
      if (running && document.visibilityState === "hidden") {
        setInterruptions((value) => value + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [running]);

  function endSession() {
    setRunning(false);
    setFinished(true);
  }

  function restartSession() {
    setSeconds(0);
    setInterruptions(0);
    setRunning(false);
    setFinished(false);
  }

  if (finished) {
    return <SessionSummary seconds={seconds} interruptions={interruptions} worldId={world?.id} worldName={world?.name} onRestart={restartSession} />;
  }

  return (
    <div className="space-y-6">
      <ImmersiveVirtualRoom world={world} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <CameraEngine />
          <section className="tx-card p-6 text-center sm:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
              <Timer size={15} /> Personal focus timer
            </div>
            <h1 className="text-5xl font-semibold tracking-tight tabular-nums sm:text-7xl">{formatTime(seconds)}</h1>
            <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed sm:text-sm" style={{ color: "var(--muted)" }}>
              Active time counts only while the timer is running. TraceX records tab-away events while this session is active.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => setRunning((value) => !value)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "var(--primary)" }}>
                {running ? <Pause size={17} /> : <Play size={17} />}{running ? "Pause timer" : seconds > 0 ? "Resume timer" : "Start timer"}
              </button>
              <button type="button" onClick={endSession} disabled={seconds === 0} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40" style={{ borderColor: "var(--border)" }}>
                <Square size={16} /> End session
              </button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
              <EyeOff size={14} /> {interruptions} tab-away {interruptions === 1 ? "interruption" : "interruptions"} detected
            </div>
          </section>
        </div>
        <div className="space-y-5">
          <MicroStrictTracker />
          <AmbientEngine />
        </div>
      </div>
    </div>
  );
}
