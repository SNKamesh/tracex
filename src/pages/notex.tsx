"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";

import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";
import { askNoteXAI, NoteXMode } from "@/lib/notexAi";

const modes: NoteXMode[] = [
  "summarize",
  "explain",
  "improve",
  "ask",
  "brainstorm",
];

export default function NoteX() {
  const router = useRouter();

  const [note, setNote] = useState("");
  const [mode, setMode] = useState<NoteXMode>("summarize");

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  
  // NEW: Cooldown state for rate limiting
  const [cooldown, setCooldown] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);

  // NEW: The Live Countdown Timer
  useEffect(() => {
    if (cooldown <= 0) return;
    
    // Decrease the cooldown by 1 every second
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    
    // Clean up the timer
    return () => clearInterval(timer);
  }, [cooldown]);

  async function generate() {
    // Prevent clicking if loading or if we are in a timeout penalty
    if (!note.trim() || loading || cooldown > 0) return;

    setLoading(true);

    try {
      const result = await askNoteXAI({
        message: `Run ${mode} on this note`,
        context: note,
        mode,
      });

      if (result.success) {
        setAnswer(result.data);
      } else {
        const errStr = result.error || "";
        
        // Smart Regex: Look for Groq's exact "try again in X.Xs" message
        const match = errStr.match(/try again in ([0-9.]+)s/i);

        if (match) {
          // Round up to the nearest second
          const secs = Math.ceil(parseFloat(match[1]));
          setCooldown(secs);
          setAnswer(`🚦 Whoa there, speedster!\n\nYou've hit the free-tier rate limit. The AI is taking a quick breather to process your previous notes.\n\nPlease wait ${secs} seconds before generating again.`);
        } else if (errStr.toLowerCase().includes("rate limit") || errStr.includes("429")) {
          // Fallback if it doesn't give us exact seconds
          setCooldown(60);
          setAnswer(`🚦 Rate limit reached!\n\nYou are processing a lot of text very quickly. Please give the AI 60 seconds to reset its memory before trying again.`);
        } else {
          // If it's a normal error, just show it
          setAnswer(`Error: ${errStr}`);
        }
      }
    } catch {
      setAnswer("AI unavailable. Please try again later.");
    }

    setLoading(false);
  }

  async function loadFile(file: File) {
    const text = await file.text();
    setNote(text);
  }

  return (
    <AppShell>
      <div className="space-y-6">

        <div className="rounded-3xl border p-8 bg-black/5 dark:bg-white/5 backdrop-blur">
          <h1 className="text-4xl font-bold">
            ✨ NoteX AI
          </h1>
          <p className="opacity-70 mt-2">
            Your premium AI study and writing workspace.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          <SectionCard
            title="Your Notes"
            description="Paste, write, or import notes."
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Start writing or paste notes..."
              className="
                min-h-80 w-full rounded-2xl
                bg-transparent border p-4
                outline-none
              "
            />

            <input
              ref={fileRef}
              hidden
              type="file"
              accept=".txt,.md"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFile(f);
              }}
            />

            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => fileRef.current?.click()}
              >
                Upload Notes
              </Button>

              <Button
                variant="ghost"
                onClick={() => setNote("")}
              >
                Clear
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            title="AI Assistant"
            description="Powered by TraceX intelligence."
          >
            <div className="grid grid-cols-2 gap-3 mb-5">
              {modes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`
                    rounded-xl p-3 border
                    capitalize transition
                    ${
                      mode === m
                        ? "scale-105 bg-blue-500/20"
                        : "opacity-70"
                    }
                  `}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* UPDATED BUTTON: Changes based on loading and cooldown state */}
            <Button
              onClick={generate}
              disabled={loading || cooldown > 0}
            >
              {loading
                ? "Thinking..."
                : cooldown > 0
                ? `Wait ${cooldown}s...`
                : "✨ Generate"}
            </Button>

            <div
              className="
                mt-5 rounded-2xl border p-4
                min-h-40 whitespace-pre-wrap
              "
            >
              {loading
                ? "AI is thinking..."
                : answer || "AI responses appear here."}
            </div>

            {answer && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(answer)}
                >
                  Copy
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setNote(note + "\n\n" + answer)}
                >
                  Insert
                </Button>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Navigation"
          description="Continue your study flow."
        >
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/sessions")}
            >
              Sessions
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push("/home")}
            >
              Home
            </Button>
          </div>
        </SectionCard>

      </div>
    </AppShell>
  );
}