"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";
import { askNoteXAI, NoteXMode } from "@/lib/notexAi";

const modes: NoteXMode[] = ["summarize", "explain", "improve", "ask", "brainstorm"];

export default function NoteX() {
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<NoteXMode>("summarize");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!note || loading) return;
    setLoading(true);
    try {
      const result = await askNoteXAI({
        message: `Run ${mode} on this note`,
        context: note,
        mode,
      });
      setAnswer(result);
    } catch (e) {
      setAnswer("AI unavailable. Try again later.");
    }
    setLoading(false);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border p-8 bg-black/5 dark:bg-white/5 backdrop-blur">
          <h1 className="text-4xl font-bold">✨ NoteX AI</h1>
          <p className="opacity-70 mt-2">Your premium AI study and writing workspace.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Your Notes" description="Paste content and let AI transform it.">
            <textarea
              value={note}
              onChange={(e)=>setNote(e.target.value)}
              placeholder="Start writing or paste notes..."
              className="min-h-80 w-full rounded-2xl bg-transparent border p-4 outline-none"
            />
          </SectionCard>

          <SectionCard title="AI Assistant" description="Powered by TraceX intelligence.">
            <div className="grid grid-cols-2 gap-3 mb-5">
              {modes.map((m)=>(
                <button
                  key={m}
                  onClick={()=>setMode(m)}
                  className={`rounded-xl p-3 border capitalize transition ${mode===m?'scale-105':'opacity-70'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <Button onClick={generate}>{loading ? "Thinking..." : "✨ Generate"}</Button>

            <div className="mt-5 rounded-2xl border p-4 min-h-40 whitespace-pre-wrap">
              {loading ? "AI is thinking..." : answer || "AI responses appear here."}
            </div>

            {answer && (
              <div className="flex gap-2 mt-3">
                <Button variant="secondary" onClick={()=>navigator.clipboard.writeText(answer)}>Copy</Button>
                <Button variant="secondary" onClick={()=>setNote(note+'\n\n'+answer)}>Insert</Button>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
