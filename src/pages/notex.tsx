"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/router";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import Select from "@/components/Select";

const OUTPUT_FORMATS = [
  "Mind Maps",
  "Summaries",
  "Paraphrasing",
  "Flashcards",
  "MCQs",
  "Q&A",
  "Explanations",
  "Translations",
  "PDF → Notes",
  "Image → Notes",
  "Audio → Notes",
  "Topic Revision Sheets",
] as const;

type OutputFormat = (typeof OUTPUT_FORMATS)[number];
type InputSource = "text" | "url" | "voice" | "pdf" | "image" | "audio";

type GenState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; format: OutputFormat; content: string }
  | { status: "error"; message: string };

const INPUT_SOURCES: { id: InputSource; label: string; icon: string }[] = [
  { id: "text", label: "Text", icon: "📝" },
  { id: "url", label: "URL", icon: "🔗" },
  { id: "voice", label: "Voice", icon: "🎙️" },
  { id: "pdf", label: "PDF", icon: "📄" },
  { id: "image", label: "Image", icon: "🖼️" },
  { id: "audio", label: "Audio", icon: "🔊" },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as ArrayBuffer);
    r.onerror = () => rej(r.error);
    r.readAsArrayBuffer(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";
  const ab = await readAsArrayBuffer(file);
  const pdf = await getDocument({ data: ab }).promise;
  let text = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc = await page.getTextContent();
    text +=
      tc.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n\n";
  }
  return text.trim();
}

function truncate(text: string, max = 120) {
  const t = text.trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

function buildPreview(format: OutputFormat, source: string): string {
  const snippet = truncate(source, 80) || "your content";

  switch (format) {
    case "Mind Maps":
      return [
        `# Mind Map — ${snippet}`,
        "",
        "Central topic",
        "├── Key concept A",
        "│   ├── Detail 1",
        "│   └── Detail 2",
        "├── Key concept B",
        "└── Key concept C",
      ].join("\n");
    case "Summaries":
      return `Summary\n\n• Main idea drawn from: "${snippet}"\n• Supporting points are grouped by theme.\n• Review the full source for nuance and examples.`;
    case "Paraphrasing":
      return `Paraphrased version:\n\n"${snippet}" rephrased in clearer, student-friendly language while keeping the original meaning.`;
    case "Flashcards":
      return [
        "Flashcard 1",
        "Q: What is the core idea?",
        "A: Derived from your input.",
        "",
        "Flashcard 2",
        "Q: Name one supporting detail.",
        "A: See your source material.",
      ].join("\n");
    case "MCQs":
      return [
        "1. Which best describes the main topic?",
        "   A) Option one  B) Option two  C) Option three  D) Option four",
        "",
        "2. Which statement is supported by the source?",
        "   A) …  B) …  C) …  D) …",
      ].join("\n");
    case "Q&A":
      return "Q: What should I focus on first?\nA: Start with the central concept, then drill into definitions and examples.\n\nQ: How do I test myself?\nA: Use the flashcards or MCQs generated from this material.";
    case "Explanations":
      return `Explanation\n\nThe material covers "${snippet}". Break it into definitions, cause-and-effect, and one real-world example to solidify understanding.`;
    case "Translations":
      return `[Translation preview]\n\nSource (${snippet}) → target language output will appear here when the translation service is connected.`;
    case "PDF → Notes":
    case "Image → Notes":
    case "Audio → Notes":
      return `Structured notes from imported content:\n\n• Overview\n• Key terms\n• Important points\n• Quick review checklist\n\nSource excerpt: "${snippet}"`;
    case "Topic Revision Sheets":
      return [
        "Revision Sheet",
        "─────────────",
        "Must-know facts:",
        "• …",
        "Common mistakes:",
        "• …",
        "Exam-style prompts:",
        "• …",
      ].join("\n");
    default:
      return snippet;
  }
}

function FileDropZone({
  accept,
  file,
  onFile,
  label,
}: {
  accept: string;
  file: File | null;
  onFile: (f: File) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/50 px-4 py-4 text-center transition-colors hover:border-blue-500 hover:bg-slate-900"
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />
      {file ? (
        <>
          <span className="text-xl">📎</span>
          <span className="max-w-full truncate text-sm font-medium text-blue-400">
            {file.name}
          </span>
          <span className="text-xs text-slate-500">
            {(file.size / 1024).toFixed(1)} KB — click to change
          </span>
        </>
      ) : (
        <>
          <span className="text-2xl text-slate-500">⬆️</span>
          <span className="text-sm text-slate-400">{label}</span>
          <span className="text-xs text-slate-600">click or drag & drop</span>
        </>
      )}
    </div>
  );
}

export default function NoteX() {
  const router = useRouter();
  const [inputSource, setInputSource] = useState<InputSource>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("Summaries");
  const [genState, setGenState] = useState<GenState>({ status: "idle" });
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const hasInput = useCallback(() => {
    switch (inputSource) {
      case "text":
        return text.trim().length > 0;
      case "url":
        return url.trim().length > 0;
      case "voice":
        return voiceTranscript.trim().length > 0;
      case "pdf":
        return pdfFile !== null;
      case "image":
        return imageFile !== null;
      case "audio":
        return audioFile !== null;
      default:
        return false;
    }
  }, [inputSource, text, url, voiceTranscript, pdfFile, imageFile, audioFile]);

  const resolveSourceContent = async (): Promise<string> => {
    switch (inputSource) {
      case "text":
        return text.trim();
      case "url":
        return url.trim();
      case "voice":
        return voiceTranscript.trim();
      case "pdf":
        if (!pdfFile) throw new Error("Upload a PDF first.");
        return extractPdfText(pdfFile);
      case "image":
        if (!imageFile) throw new Error("Upload an image first.");
        return `[Image: ${imageFile.name}] OCR content will be extracted when the vision service is connected.`;
      case "audio":
        if (!audioFile) throw new Error("Upload an audio file first.");
        return `[Audio: ${audioFile.name}] Transcript will be generated when the speech service is connected.`;
      default:
        return "";
    }
  };

  const startVoiceTyping = () => {
    setVoiceError("");
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice typing is not supported in this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: {
      results: Iterable<{ 0: { transcript: string } }>;
    }) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setVoiceTranscript(transcript);
    };

    recognition.onerror = () => {
      setVoiceError("Could not capture voice. Check microphone permissions.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleGenerate = async () => {
    if (!hasInput()) return;

    setGenState({ status: "loading" });

    try {
      const sourceContent = await resolveSourceContent();
      if (!sourceContent.trim()) {
        throw new Error("No readable content found in your input.");
      }

      await sleep(600);

      try {
        await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            format: outputFormat,
            source: inputSource,
            content: truncate(sourceContent, 500),
          }),
        });
      } catch {
        // API is optional for now; preview is generated client-side.
      }

      setGenState({
        status: "done",
        format: outputFormat,
        content: buildPreview(outputFormat, sourceContent),
      });
    } catch (e: unknown) {
      setGenState({
        status: "error",
        message: (e as Error).message ?? "Generation failed.",
      });
    }
  };

  const copyOutput = async () => {
    if (genState.status !== "done") return;
    try {
      await navigator.clipboard.writeText(genState.content);
    } catch {
      // clipboard may be unavailable
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="NoteX AI Bot"
        subtitle="AI notes, flashcards, summaries, and more."
        rightSlot={
          genState.status === "done" ? (
            <span className="chip">{genState.format}</span>
          ) : null
        }
      />

      <SectionCard
        title="Input"
        description="Paste text, speak, or import from web, PDF, image, or audio."
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {INPUT_SOURCES.map((src) => (
            <button
              key={src.id}
              type="button"
              onClick={() => setInputSource(src.id)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                inputSource === src.id
                  ? "border-blue-500 bg-blue-500/15 text-blue-200"
                  : "border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {src.icon} {src.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {inputSource === "text" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste lecture notes, textbook excerpts, or any study material…"
              rows={5}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
            />
          )}

          {inputSource === "url" && (
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
          )}

          {inputSource === "voice" && (
            <div className="space-y-3">
              <textarea
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                placeholder="Transcript appears here as you speak…"
                rows={4}
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={isListening ? "secondary" : "primary"}
                  onClick={startVoiceTyping}
                >
                  {isListening ? "Stop Voice Typing" : "Start Voice Typing"}
                </Button>
                {isListening && (
                  <span className="text-xs text-blue-400 animate-pulse">
                    Listening…
                  </span>
                )}
                {voiceError && (
                  <span className="text-xs text-rose-400">{voiceError}</span>
                )}
              </div>
            </div>
          )}

          {inputSource === "pdf" && (
            <FileDropZone
              accept=".pdf"
              file={pdfFile}
              onFile={setPdfFile}
              label="Upload a PDF to convert to notes"
            />
          )}

          {inputSource === "image" && (
            <FileDropZone
              accept=".jpg,.jpeg,.png,.webp"
              file={imageFile}
              onFile={setImageFile}
              label="Upload an image for OCR → notes"
            />
          )}

          {inputSource === "audio" && (
            <FileDropZone
              accept=".mp3,.wav,.m4a,.aac"
              file={audioFile}
              onFile={setAudioFile}
              label="Upload audio for transcription → notes"
            />
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Output Format"
        description="Choose how NoteX should respond."
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <Select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
          >
            <optgroup label="Study outputs">
              {OUTPUT_FORMATS.slice(0, 8).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </optgroup>
            <optgroup label="Import → notes">
              {OUTPUT_FORMATS.slice(8).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </optgroup>
          </Select>

          <Button
            onClick={handleGenerate}
            disabled={!hasInput() || genState.status === "loading"}
            className="md:min-w-[140px]"
          >
            {genState.status === "loading" ? "Generating…" : "Generate"}
          </Button>
        </div>
      </SectionCard>

      {genState.status === "error" && (
        <SectionCard title="Something went wrong">
          <p className="text-sm text-rose-400">{genState.message}</p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setGenState({ status: "idle" })}
          >
            Dismiss
          </Button>
        </SectionCard>
      )}

      {genState.status === "done" && (
        <SectionCard
          title="Output"
          description={`Generated as ${genState.format}. Connect a live AI backend to replace this preview.`}
        >
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
            {genState.content}
          </pre>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={copyOutput}>
              Copy to Clipboard
            </Button>
            <Button variant="ghost" onClick={() => setGenState({ status: "idle" })}>
              Clear
            </Button>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Session Access"
        description="NoteX is available in the sidebar and active study sessions."
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => router.push("/sessions")}>
            Launch in Active Session
          </Button>
          <Button variant="ghost" onClick={() => router.push("/home")}>
            Back to Home
          </Button>
        </div>
      </SectionCard>
    </AppShell>
  );
}

type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: { results: Iterable<{ 0: { transcript: string } }> }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}
