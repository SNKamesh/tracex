import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, DragEvent } from "react";
import AppShell from "@/components/AppShell";
import {
  ArrowLeft, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, CircleHelp,
  FileText, GraduationCap, Loader2, Maximize2, Minimize2, Mic, Monitor,
  Pause, Play, RefreshCw, Send, Settings2, Sparkles, Upload, Volume2,
  VolumeX, Wifi, WifiOff, X
} from "lucide-react";
import {
  answerLocalQuestion, checkChromeAIAvailability, createLessonPlan, createWaveformDoubtSteps, evaluateLocalAnswer, extractMaterial,
  listLocalModels
} from "@/lib/classroom";
import type { ExtractedMaterial, LessonPlan, LessonStep } from "@/lib/classroom";

type VoiceRecognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => VoiceRecognition;
  webkitSpeechRecognition?: new () => VoiceRecognition;
};

const WRITING_STYLES = [
  { id: "natural", name: "Natural handwriting", family: '"Segoe Print", "Bradley Hand", cursive' },
  { id: "neat", name: "Neat classroom notes", family: '"Comic Sans MS", "Segoe Print", cursive' },
  { id: "teacher", name: "Teacher board", family: '"Bradley Hand", "Segoe Print", cursive' },
  { id: "digital", name: "Clean digital", family: 'Inter, ui-sans-serif, system-ui, sans-serif' }
];

function Diagram({ nodes }: { nodes: string[] }) {
  const labels = nodes.slice(0, 5);
  if (labels.length < 2) return null;
  const boxHeight = 42;
  const gap = 28;
  const height = labels.length * boxHeight + (labels.length - 1) * gap + 10;
  return (
    <svg viewBox={"0 0 620 " + height} role="img" aria-label="Concept flow diagram" className="mx-auto w-full max-w-2xl">
      {labels.map((label, index) => {
        const y = index * (boxHeight + gap) + 5;
        return <g key={index}>
          {index > 0 && <path d={"M310 " + (y - gap) + " V" + (y - 7) + " M304 " + (y - 13) + " L310 " + (y - 6) + " L316 " + (y - 13)} fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>}
          <rect x="80" y={y} width="460" height={boxHeight} rx="12" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5"/>
          <text x="310" y={y + 26} fill="#1e3a8a" fontSize="16" textAnchor="middle">{label.length > 52 ? label.slice(0, 49) + "…" : label}</text>
        </g>;
      })}
    </svg>
  );
}


function WaveformDiagram({ waveform }: { waveform: NonNullable<LessonStep["waveform"]> }) {
  const { sequence, levels, samplesPerBit, label, convention } = waveform;
  const left = 42, right = 18, bitWidth = 48;
  const halfWidth = bitWidth / samplesPerBit;
  const width = left + right + sequence.length * bitWidth;
  const height = 188;
  const y = (level: number) => level === 1 ? 45 : level === 0 ? 92 : 139;
  const path = levels.reduce((d, level, index) => {
    const x0 = left + index * halfWidth;
    const x1 = x0 + halfWidth;
    return index === 0 ? "M " + x0 + " " + y(level) + " H " + x1 : d + " V " + y(level) + " H " + x1;
  }, "");
  const pathLength = levels.length * halfWidth * 1.5;
  return (
    <div className="my-6 rounded-xl border border-blue-200 bg-white p-3 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm text-slate-800">{label} waveform</strong>
        <span className="text-xs text-slate-500">Input: {sequence.join(" ")}</span>
      </div>
      <svg viewBox={"0 0 " + width + " " + height} role="img" aria-label={label + " waveform for bits " + sequence.join("")} className="w-full overflow-visible">
        {[45,92,139].map((yy,index)=><g key={yy}>
          <line x1={left} y1={yy} x2={width-right} y2={yy} stroke="#cbd5e1" strokeDasharray="4 4"/>
          <text x={left-8} y={yy+4} fontSize="11" fill="#475569" textAnchor="end">{["+V","0","−V"][index]}</text>
        </g>)}
        {sequence.map((bit,index)=><g key={index}>
          <rect x={left+index*bitWidth} y="15" width={bitWidth} height="143" fill={index%2===0?"#eff6ff":"#f8fafc"}/>
          <line x1={left+index*bitWidth} y1="15" x2={left+index*bitWidth} y2="158" stroke="#cbd5e1" strokeDasharray="3 4"/>
          <text x={left+index*bitWidth+bitWidth/2} y="11" fontSize="10" fill="#1e3a8a" textAnchor="middle">{bit}</text>
        </g>)}
        <line x1={width-right} y1="15" x2={width-right} y2="158" stroke="#cbd5e1" strokeDasharray="3 4"/>
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={pathLength} strokeDashoffset={pathLength}>
          <animate attributeName="stroke-dashoffset" from={pathLength} to="0" dur="2.4s" fill="freeze"/>
        </path>
        <text x={left} y="178" fontSize="10" fill="#64748b">Time →</text>
      </svg>
      <p className="mt-2 text-xs leading-5 text-slate-600">{convention}</p>
    </div>
  );
}

function StepBoard({ step, styleId }: { step: LessonStep; styleId: string }) {
  const style = WRITING_STYLES.find((item) => item.id === styleId) || WRITING_STYLES[0];
  return (
    <div className="classroom-board min-h-[520px] rounded-2xl border border-slate-200 bg-[#fffefa] p-6 text-slate-900 shadow-xl sm:p-10">
      <div className="mb-7 flex items-center justify-between gap-3 border-b border-blue-100 pb-4">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">TraceX lesson board</span>
        <span className="text-xs font-medium text-slate-400">TEACHING NOTES</span>
      </div>
      <div style={{ fontFamily: style.family } as CSSProperties}>
        <h2 className="classroom-write mb-6 text-3xl font-bold leading-tight text-blue-950 sm:text-4xl">{step.title}</h2>
        <p className="classroom-write whitespace-pre-wrap text-lg leading-9 text-slate-800">{step.explanation}</p>
        {step.boardPoints.length > 0 && <div className="my-7 space-y-3">
          {step.boardPoints.map((point, index) => <div className="classroom-write flex gap-3 text-lg leading-8" key={index}><span className="font-bold text-blue-700">✦</span><span>{point}</span></div>)}
        </div>}
        {step.waveform && <WaveformDiagram waveform={step.waveform}/>}
        {step.equation && <div className="my-7 rounded-xl border border-blue-200 bg-blue-50/70 px-5 py-6 text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Key equation</div>
          <div className="break-words font-mono text-xl font-semibold text-blue-950 sm:text-2xl">{step.equation}</div>
        </div>}
      </div>
      {step.diagramNodes && step.diagramNodes.length > 1 && <div className="my-7 rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Concept diagram</div>
        <Diagram nodes={step.diagramNodes}/>
      </div>}
      {step.example && <div className="my-7 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-800">Example</div>
        <p className="whitespace-pre-wrap leading-7 text-slate-800">{step.example}</p>
      </div>}
    </div>
  );
}

export default function ClassroomPage() {
  const [material, setMaterial] = useState<ExtractedMaterial | null>(null);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [model, setModel] = useState("qwen2.5:3b");
  const [provider, setProvider] = useState<"ollama" | "chrome-ai">("ollama");
  const [chromeAIStatus, setChromeAIStatus] = useState("unknown");
  const [models, setModels] = useState<string[]>([]);
  const [connection, setConnection] = useState<"unknown" | "connected" | "offline">("unknown");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [writingStyle, setWritingStyle] = useState("natural");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceRate, setVoiceRate] = useState(0.95);
  const [voiceName, setVoiceName] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [boardOpen, setBoardOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [recognizing, setRecognizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const currentStep = plan?.steps[stepIndex] || null;
  const progress = plan ? Math.round(((stepIndex + 1) / plan.steps.length) * 100) : 0;

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
      recognitionRef.current?.stop();
    };
  }, []);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.name === voiceName) || voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) || voices[0],
    [voices, voiceName]
  );

  async function testChromeAI() {
    setBusy(true);
    const result = await checkChromeAIAvailability().catch(() => "unsupported");
    setChromeAIStatus(result);
    setStatus(result === "available" ? "Chrome on-device AI is ready." : result === "downloadable" ? "Chrome on-device AI can be downloaded on this device. Choose it and create a lesson to start the download." : result === "downloading" ? "Chrome on-device AI is currently downloading." : "Chrome on-device AI is not supported or is unavailable on this device.");
    setBusy(false);
  }

  async function connectLocalAI() {
    setBusy(true);
    setStatus("Checking the local Ollama service…");
    try {
      const found = await listLocalModels();
      setModels(found);
      setConnection("connected");
      if (found.length && !found.includes(model)) setModel(found[0]);
      setStatus(found.length ? "Connected to Ollama. " + found.length + " local model(s) found." : "Ollama is running, but no models are installed. Run: ollama pull qwen2.5:3b");
    } catch (error) {
      setConnection("offline");
      setStatus("Cannot reach Ollama on this device. Start Ollama and allow this TraceX origin in OLLAMA_ORIGINS. " + (error instanceof Error ? error.message : ""));
    } finally { setBusy(false); }
  }

  async function loadSelectedFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setStatus("Reading " + file.name + " locally…");
    setPlan(null);
    setAnswer("");
    setFeedback("");
    try {
      const extracted = await extractMaterial(file);
      setMaterial(extracted);
      setStatus("Imported " + extracted.kind + ". Extracted " + extracted.text.length.toLocaleString() + " characters. The file was processed in this browser, not uploaded to TraceX servers.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not read this file.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void loadSelectedFile(event.dataTransfer.files?.[0]);
  }

  async function generateLesson() {
    if (!material) return;
    setBusy(true);
    setStatus(provider === "ollama" ? "Asking local Ollama to prepare the lesson…" : "Asking Chrome on-device AI to prepare the lesson…");
    setFeedback("");
    try {
      const newPlan = await createLessonPlan(model, material, provider);
      setPlan(newPlan);
      setStepIndex(0);
      setBoardOpen(true);
      setStatus(provider === "ollama" ? "Lesson prepared by local Ollama using the extracted upload." : "Lesson prepared by Chrome on-device AI.");
      if (provider === "ollama") setConnection("connected");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Lesson generation failed. Check the selected on-device AI provider.");
    } finally { setBusy(false); }
  }

  function speakStep(index: number) {
    if (!plan || !voiceEnabled || !("speechSynthesis" in window)) return;
    const step = plan.steps[index];
    if (!step) return;
    window.speechSynthesis.cancel();
    const text = [step.title, step.explanation, step.boardPoints.join(". "), step.equation ? "The key equation is " + step.equation : "", step.example ? "For example. " + step.example : ""].filter(Boolean).join(". ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceRate;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onend = () => {
      if (autoAdvance && index < plan.steps.length - 1) {
        const next = index + 1;
        setStepIndex(next);
        window.setTimeout(() => speakStep(next), 450);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopVoice() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  async function askTeacher() {
    if (!material || !currentStep || !question.trim()) return;
    setBusy(true);
    setAnswer("");
    const asked = question.trim();
    try {
      const doubtNumber = plan ? plan.steps.filter((step) => step.title.startsWith("Doubt ")).length + 1 : 1;
      const waveformSteps = createWaveformDoubtSteps(material, asked, doubtNumber);
      if (waveformSteps) {
        setPlan((existing) => existing ? { ...existing, steps: [...existing.steps, ...waveformSteps] } : existing);
        setStepIndex(plan ? plan.steps.length : 0);
        setAnswer("Added a new doubt section to the lesson board: " + asked);
        setQuestion("");
      } else {
        const explanation = await answerLocalQuestion(model, material, currentStep, asked, provider);
        const doubtNumber = plan ? plan.steps.filter((step) => step.title.startsWith("Doubt ")).length + 1 : 1;
        const doubtIntro: LessonStep = {
          title: "Doubt " + String(doubtNumber).padStart(2, "0") + " — " + asked.slice(0, 80),
          explanation: "Your question has been added to the lesson. The following page contains the teacher's answer.",
          boardPoints: ["Question: " + asked, "Original lesson pages remain unchanged."]
        };
        const doubtAnswer: LessonStep = {
          title: "Answer " + String(doubtNumber).padStart(2, "0") + " — Explanation",
          explanation,
          boardPoints: ["This answer was appended as a new page. Your earlier lesson pages have been preserved."]
        };
        setPlan((existing) => existing ? { ...existing, steps: [...existing.steps, doubtIntro, doubtAnswer] } : existing);
        setStepIndex(plan ? plan.steps.length : 0);
        setAnswer("Added your doubt and its explanation as a new lesson-board page.");
        setQuestion("");
      }
    } catch (error) { setAnswer("Local AI is unavailable: " + (error instanceof Error ? error.message : "connection failed")); }
    finally { setBusy(false); }
  }

  async function checkStudentAnswer() {
    if (!material || !currentStep || !studentAnswer.trim()) return;
    const prompt = currentStep.checkQuestion || "Explain the main idea in this lesson step.";
    setBusy(true);
    setFeedback("");
    try { setFeedback(await evaluateLocalAnswer(model, material, currentStep, prompt, studentAnswer.trim(), provider)); }
    catch (error) { setFeedback("Could not evaluate the answer locally: " + (error instanceof Error ? error.message : "connection failed")); }
    finally { setBusy(false); }
  }

  function startVoiceInput() {
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) { setStatus("Speech recognition is not supported in this browser. Type your doubt instead."); return; }
    const recognition = new Recognition();
    recognition.lang = selectedVoice?.lang || "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (event) => setQuestion(event.results?.[0]?.[0]?.transcript || "");
    recognition.onerror = () => setStatus("Speech input stopped. Type your doubt or try again.");
    recognition.onend = () => setRecognizing(false);
    recognitionRef.current = recognition;
    setRecognizing(true);
    recognition.start();
  }

  function nextStep() {
    if (!plan) return;
    stopVoice();
    setStepIndex((index) => Math.min(plan.steps.length - 1, index + 1));
  }

  function previousStep() {
    stopVoice();
    setStepIndex((index) => Math.max(0, index - 1));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-7 pb-12">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600"><GraduationCap size={18}/> TRACE X LEARNING STUDIO</div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Classroom</h1>
            <p className="mt-2 max-w-2xl text-sm opacity-70">A local-first AI teacher that turns your study material into narrated lessons and an interactive board.</p>
          </div>
          <div className={"flex items-center gap-2 self-start rounded-full border px-3 py-2 text-xs font-semibold " + (connection === "connected" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-amber-500/30 bg-amber-500/10 text-amber-600")}>
            {connection === "connected" ? <Wifi size={14}/> : <WifiOff size={14}/>}
            {provider === "ollama" ? (connection === "connected" ? "Ollama connected" : "Ollama not connected") : (chromeAIStatus === "available" || chromeAIStatus === "downloadable" ? "Chrome AI available" : "Chrome AI not checked") }
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="space-y-5 rounded-3xl border p-5 sm:p-7" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600"><BookOpen size={23}/></div>
              <div><h2 className="text-lg font-bold">1. Upload learning material</h2><p className="text-xs opacity-60">PDF, PPTX, DOCX, TXT, MD or CSV · Maximum 20 MB</p></div>
            </div>
            <div onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => fileInput.current?.click()} className={"cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition " + (dragging ? "border-blue-500 bg-blue-500/10" : "border-slate-400/40 hover:border-blue-500/70 hover:bg-blue-500/5")}>
              <Upload className="mx-auto mb-3 text-blue-500" size={30}/>
              <p className="font-semibold">{material ? "Replace uploaded material" : "Drop your material here"}</p>
              <p className="mt-1 text-xs opacity-60">or browse files from your device</p>
              <input ref={fileInput} type="file" accept=".pdf,.pptx,.docx,.txt,.md,.csv" className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => void loadSelectedFile(event.target.files?.[0])}/>
            </div>
            {material && <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start gap-3">
                <FileText className="mt-1 shrink-0 text-blue-500" size={20}/>
                <div className="min-w-0 flex-1"><p className="break-all text-sm font-bold">{material.name}</p><p className="mt-1 text-xs opacity-60">{material.kind} · {material.pagesOrSlides} page(s)/slide(s) · {material.text.length.toLocaleString()} characters</p></div>
                <button onClick={() => { setMaterial(null); setPlan(null); stopVoice(); }} className="rounded-lg p-2 opacity-60 hover:bg-red-500/10 hover:text-red-500" aria-label="Remove material"><X size={16}/></button>
              </div>
              <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-blue-600">Preview extracted text</summary><pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs opacity-75">{material.text.slice(0, 5000)}</pre></details>
            </div>}
            <div className="rounded-2xl bg-blue-500/5 p-4 text-xs leading-6 opacity-80">
              <div className="mb-1 flex items-center gap-2 font-bold"><Monitor size={15}/> Private, on-device document reading</div>
              Files are parsed in this browser. Extracted text is sent only to Ollama running on this same computer when you generate a lesson.
            </div>
          </section>

          <section className="space-y-5 rounded-3xl border p-5 sm:p-7" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600"><BrainCircuit size={23}/></div>
              <div><h2 className="text-lg font-bold">2. Connect your local AI</h2><p className="text-xs opacity-60">Classroom does not call Groq or OpenAI.</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-500/5 p-1">
              <button onClick={() => setProvider("ollama")} className={"rounded-lg px-3 py-2 text-xs font-bold " + (provider === "ollama" ? "bg-blue-600 text-white" : "opacity-70")}>Local Ollama</button>
              <button onClick={() => setProvider("chrome-ai")} className={"rounded-lg px-3 py-2 text-xs font-bold " + (provider === "chrome-ai" ? "bg-blue-600 text-white" : "opacity-70")}>Chrome on-device AI</button>
            </div>
            {provider === "ollama" && <>
              <label className="block text-xs font-semibold opacity-70">Ollama model</label>
              <div className="flex gap-2">
                {models.length ? <select className="min-w-0 flex-1 rounded-xl px-3 py-3 text-sm" value={model} onChange={(event) => setModel(event.target.value)}>{models.map((name) => <option key={name} value={name}>{name}</option>)}</select> : <input className="min-w-0 flex-1 rounded-xl px-3 py-3 text-sm" value={model} onChange={(event) => setModel(event.target.value)} placeholder="qwen2.5:3b"/>}
                <button onClick={() => void connectLocalAI()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900">
                  {busy ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>} Test Ollama
                </button>
              </div>
            </>}
            {provider === "ollama" ? <div className="rounded-xl border p-4 text-xs leading-6" style={{ borderColor: "var(--border)" }}>
              <p className="mb-2 font-bold">First-time setup on Windows</p>
              <ol className="list-decimal space-y-1 pl-4 opacity-75">
                <li>Install Ollama from ollama.com and open it.</li>
                <li>In PowerShell, run <code>ollama pull qwen2.5:3b</code>.</li>
                <li>Allow your TraceX origin in Ollama's OLLAMA_ORIGINS setting, then restart Ollama.</li>
                <li>Return here and press Test.</li>
              </ol>
              <p className="mt-2 opacity-60">For local development allow http://localhost:3000. For the deployed app allow https://tracex-gdbl.vercel.app. Do not use wildcard origins on a public computer.</p>
            </div> : <div className="rounded-xl border p-4 text-xs leading-6" style={{ borderColor: "var(--border)" }}>
              <p className="mb-2 font-bold">Chrome built-in AI requirements</p>
              <p className="opacity-75">Available only on supported desktop Chrome versions and eligible devices. Chrome documents 16 GB RAM or more with 4+ CPU cores, or a GPU with more than 4 GB VRAM, plus about 22 GB free profile-drive space for its model download. First use may download the model.</p>
              <button onClick={() => void testChromeAI()} disabled={busy} className="mt-3 rounded-lg border border-blue-500/30 px-3 py-2 font-bold text-blue-600 disabled:opacity-50">Check Chrome AI · {chromeAIStatus}</button>
            </div>}
            <button onClick={() => void generateLesson()} disabled={!material || busy || (provider === "ollama" && !model.trim())} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? <Loader2 className="animate-spin" size={17}/> : <Sparkles size={17}/>} Create lesson with local AI
            </button>
            {status && <p role="status" className="rounded-xl bg-slate-500/5 p-3 text-xs leading-5 opacity-75">{status}</p>}
            <div className="flex items-start gap-2 text-xs opacity-60"><CircleHelp size={15} className="mt-0.5 shrink-0"/> The 3B model is a starting point for your RTX 4050 6 GB laptop. Larger models may need more RAM/VRAM and run slower.</div>
          </section>
        </div>

        {plan && <section className="rounded-3xl border p-5 sm:p-7" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600"><CheckCircle2 size={15}/> Lesson ready · {plan.source === "ollama" ? "Generated by local Ollama" : "Generated by Chrome on-device AI"}</div><h2 className="text-xl font-black">{plan.title}</h2><p className="mt-1 text-sm opacity-60">{plan.subject} · {plan.steps.length} teaching steps</p></div>
            <button onClick={() => setBoardOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"><Maximize2 size={16}/> Open full-screen board</button>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {plan.steps.map((step, index) => <button key={index} onClick={() => { setStepIndex(index); setBoardOpen(true); }} className={"rounded-xl border p-3 text-left transition hover:border-blue-500 " + (index === stepIndex ? "border-blue-500 bg-blue-500/5" : "")} style={{ borderColor: index === stepIndex ? undefined : "var(--border)" }}><span className="text-xs font-bold text-blue-600">STEP {index + 1}</span><p className="mt-1 text-sm font-semibold">{step.title}</p></button>)}
          </div>
        </section>}
      </div>

      {boardOpen && plan && currentStep && <div className="fixed inset-0 z-[100] flex flex-col bg-[#0b1220] text-white">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-blue-500/20 p-2 text-blue-300"><GraduationCap size={21}/></div><div><p className="text-sm font-bold">{plan.title}</p><p className="text-xs text-slate-400">TraceX Classroom · {stepIndex + 1} of {plan.steps.length}</p></div></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings((value) => !value)} className="rounded-lg border border-white/15 p-2 text-slate-200 hover:bg-white/10" aria-label="Board settings"><Settings2 size={18}/></button>
            <button onClick={() => { stopVoice(); setBoardOpen(false); }} className="rounded-lg border border-white/15 p-2 text-slate-200 hover:bg-white/10" aria-label="Close classroom"><Minimize2 size={18}/></button>
          </div>
        </header>
        {showSettings && <div className="flex flex-wrap items-center gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs">
          <label className="flex items-center gap-2">Writing style <select className="rounded-lg border-0 bg-slate-800 px-2 py-2 text-white" value={writingStyle} onChange={(event) => setWritingStyle(event.target.value)}>{WRITING_STYLES.map((style) => <option key={style.id} value={style.id}>{style.name}</option>)}</select></label>
          <label className="flex items-center gap-2">Voice <select className="max-w-56 rounded-lg border-0 bg-slate-800 px-2 py-2 text-white" value={voiceName} onChange={(event) => setVoiceName(event.target.value)}><option value="">System default</option>{voices.map((voice) => <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>)}</select></label>
          <label className="flex items-center gap-2">Speed <input type="range" min="0.7" max="1.25" step="0.05" value={voiceRate} onChange={(event) => setVoiceRate(Number(event.target.value))}/>{voiceRate.toFixed(2)}×</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={autoAdvance} onChange={(event) => setAutoAdvance(event.target.checked)}/> Auto-advance</label>
        </div>}
        <main className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-h-0 overflow-y-auto bg-[#e9edf3] p-3 sm:p-7"><div className="mx-auto max-w-5xl"><StepBoard step={currentStep} styleId={writingStyle}/></div></section>
          <aside className="flex min-h-0 flex-col border-l border-white/10 bg-[#101a2b]">
            <div className="border-b border-white/10 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Lesson progress</p>
              <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: progress + "%" }}/></div>
              <p className="mt-2 text-xs text-slate-400">{progress}% complete</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {plan.steps.map((step, index) => <button key={index} onClick={() => { stopVoice(); setStepIndex(index); }} className={"w-full rounded-xl p-3 text-left " + (index === stepIndex ? "bg-blue-500/20 ring-1 ring-blue-400/50" : "hover:bg-white/5")}><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Step {index + 1}</p><p className="mt-1 text-sm font-semibold text-slate-100">{step.title}</p></button>)}
            </div>
            <div className="space-y-3 border-t border-white/10 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setVoiceEnabled((value) => { if (value) stopVoice(); return !value; })} className="rounded-lg border border-white/15 p-2 text-slate-200" title={voiceEnabled ? "Mute voice" : "Enable voice"}>{voiceEnabled ? <Volume2 size={17}/> : <VolumeX size={17}/>}</button>
                <button onClick={() => speakStep(stepIndex)} disabled={!voiceEnabled} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-bold disabled:opacity-50"><Play size={15}/> Teach this step</button>
                <button onClick={stopVoice} className="rounded-lg border border-white/15 p-2 text-slate-200" title="Stop voice"><Pause size={17}/></button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={previousStep} disabled={stepIndex === 0} className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold disabled:opacity-40"><ArrowLeft className="mr-1 inline" size={14}/> Previous</button>
                <button onClick={nextStep} disabled={stepIndex === plan.steps.length - 1} className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold disabled:opacity-40">Next <ArrowRight className="ml-1 inline" size={14}/></button>
              </div>
            </div>
            <div className="max-h-[38%] overflow-y-auto border-t border-white/10 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Ask your teacher</p>
              <div className="flex gap-2">
                <input className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500" placeholder="Ask a doubt…" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void askTeacher(); }}/>
                <button onClick={startVoiceInput} className="rounded-lg border border-white/15 p-2 text-slate-200" title="Speak your doubt"><Mic size={15}/></button>
                <button onClick={() => void askTeacher()} disabled={busy || !question.trim()} className="rounded-lg bg-blue-600 p-2 text-white disabled:opacity-40"><Send size={15}/></button>
              </div>
              {answer && <div role="status" className="mt-3 whitespace-pre-wrap rounded-lg bg-emerald-400/10 p-3 text-xs leading-5 text-emerald-100">{answer}</div>}
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Check understanding</p>
                <p className="mb-2 text-xs leading-5 text-slate-300">{currentStep.checkQuestion || "Explain the key idea in your own words."}</p>
                <textarea value={studentAnswer} onChange={(event) => setStudentAnswer(event.target.value)} rows={3} placeholder="Write your answer…" className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white placeholder:text-slate-500"/>
                <button onClick={() => void checkStudentAnswer()} disabled={busy || !studentAnswer.trim()} className="mt-2 w-full rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 disabled:opacity-40"><CheckCircle2 className="mr-1 inline" size={14}/> Evaluate my answer</button>
                {feedback && <div className="mt-3 whitespace-pre-wrap rounded-lg bg-emerald-400/10 p-3 text-xs leading-5 text-emerald-100">{feedback}</div>}
              </div>
              {recognizing && <p className="mt-2 animate-pulse text-xs text-blue-300">Listening for your question…</p>}
            </div>
          </aside>
        </main>
      </div>}
    </AppShell>
  );
}
