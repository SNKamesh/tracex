"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, ArrowRight, Brain, Check, Clipboard, FileUp, NotebookPen, Sparkles } from "lucide-react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";
import { askNoteXAI, NoteXMode } from "@/lib/notexAi";

const modes: NoteXMode[] = ["summarize", "explain", "improve", "ask", "brainstorm"];

export default function NoteX() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<NoteXMode>("summarize");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [copyDone, setCopyDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function generate() {
    if (!note.trim() || loading || cooldown > 0) return;
    setLoading(true);
    try {
      const result = await askNoteXAI({ message: `Run ${mode} on this note`, context: note, mode });
      if (result.success) {
        setAnswer(result.data);
      } else {
        const errStr = result.error || "";
        const match = errStr.match(/try again in ([0-9.]+)s/i);
        if (match) {
          const seconds = Math.ceil(parseFloat(match[1]));
          setCooldown(seconds);
          setAnswer(`The free AI service has reached its request limit. Please retry in about ${seconds} seconds.`);
        } else if (errStr.toLowerCase().includes("rate limit") || errStr.includes("429")) {
          setCooldown(60);
          setAnswer("The free AI service is temporarily rate-limited. Please wait about 60 seconds before trying again.");
        } else {
          setAnswer(`Unable to complete this request: ${errStr}`);
        }
      }
    } catch {
      setAnswer("The AI service is unavailable right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function loadFile(file: File) {
    try {
      const text = await file.text();
      setNote(text);
    } catch {
      setAnswer("This file could not be read as text. Please try a .txt or .md file.");
    }
  }

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(answer);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 1500);
    } catch {
      setCopyDone(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-7 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="tx-eyebrow">Your thinking workspace</p>
          <h1 className="mt-2 flex items-center gap-2 text-[30px] font-semibold tracking-[-.05em]"><NotebookPen size={25} style={{ color: "var(--primary)" }} /> NoteX</h1>
          <p className="mt-2 text-[13px]" style={{ color: "var(--muted)" }}>Work with your notes. Choose an approach and let the assistant help you think.</p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/home")}><ArrowLeft size={15} /> Back to home</Button>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
        <SectionCard title="Your material" description="Write, paste, or import text to work with.">
          <div className="mb-3 flex items-center justify-between gap-3 text-[11px]" style={{ color: "var(--muted)" }}>
            <span>{note.trim() ? `${note.trim().split(/\\s+/).length} words` : "No text added yet"}</span>
            <span>TXT · Markdown</span>
          </div>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Start with a paragraph, lecture notes, or a concept you want to understand..." className="min-h-[340px] w-full resize-y rounded-xl border p-4 text-[13px] leading-7 outline-none sm:min-h-[470px]" style={{ background: "var(--background-soft)", color: "var(--text)", borderColor: "var(--border)" }} />
          <input ref={fileRef} hidden type="file" accept=".txt,.md,text/plain,text/markdown" onChange={(event) => { const file = event.target.files?.[0]; if (file) void loadFile(file); event.currentTarget.value = ""; }} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <Button variant="secondary" onClick={() => fileRef.current?.click()}><FileUp size={15} /> Import text</Button>
            <button type="button" onClick={() => setNote("")} className="px-3 py-2 text-[12px]" style={{ color: "var(--muted)" }}>Clear notes</button>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Choose what you need" description="Select one clear action for the material on the left.">
            <div className="grid grid-cols-2 gap-2">
              {modes.map((item) => {
                const active = mode === item;
                return <button key={item} type="button" onClick={() => setMode(item)} aria-pressed={active} className="rounded-[10px] border px-3 py-3 text-left text-[12px] font-medium capitalize transition-colors" style={{ borderColor: active ? "var(--primary)" : "var(--border)", background: active ? "color-mix(in srgb, var(--primary), transparent 91%)" : "var(--surface)", color: active ? "var(--text)" : "var(--muted)" }}>{item}</button>;
              })}
            </div>
            <Button className="mt-4 w-full" onClick={generate} disabled={loading || cooldown > 0 || !note.trim()}>
              {loading ? <><Sparkles size={15} /> Working…</> : cooldown > 0 ? `Retry in ${cooldown}s` : <><Brain size={15} /> Generate response <ArrowRight size={15} /></>}
            </Button>
          </SectionCard>

          <SectionCard title="Response" description="Your result will appear here.">
            <div className="min-h-[220px] whitespace-pre-wrap rounded-xl border p-4 text-[13px] leading-7" style={{ background: "var(--background-soft)", color: answer ? "var(--text)" : "var(--muted)", borderColor: "var(--border)" }} aria-live="polite">
              {loading ? "Working through your material…" : answer || "Add your material, choose an action, and generate a response."}
            </div>
            {answer && <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={copyAnswer}>{copyDone ? <Check size={15} /> : <Clipboard size={15} />}{copyDone ? "Copied" : "Copy response"}</Button>
              <Button variant="secondary" onClick={() => setNote((current) => current ? `${current}\\n\\n${answer}` : answer)}>Insert into notes</Button>
            </div>}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
