"use client"

import { useRef, useState } from "react"
import AppShell from "@/components/AppShell"
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  Download,
  FileArchive,
  FileAudio2,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  FileVideo2,
  RotateCcw,
  Search,
  Upload,
  X,
  Zap,
} from "lucide-react"

type Format = { ext: string; name: string; group: string }
type PickerSide = "from" | "to" | null
type Status = "idle" | "running" | "done" | "error"

const FORMAT_GROUPS = [
  { key: "Documents", icon: FileText, formats: [["pdf", "PDF"], ["doc", "Word 97–2003"], ["docx", "Word"], ["docm", "Word Macro"], ["rtf", "Rich Text"], ["odt", "OpenDocument"], ["txt", "Plain Text"], ["html", "HTML"], ["htm", "HTML"], ["md", "Markdown"], ["epub", "EPUB"], ["mobi", "MOBI"], ["azw3", "AZW3"]] },
  { key: "Presentations", icon: FileType2, formats: [["ppt", "PowerPoint 97–2003"], ["pptx", "PowerPoint"], ["pptm", "PowerPoint Macro"], ["odp", "OpenDocument"], ["ppsx", "PowerPoint Show"]] },
  { key: "Spreadsheets", icon: FileSpreadsheet, formats: [["xls", "Excel 97–2003"], ["xlsx", "Excel"], ["xlsm", "Excel Macro"], ["csv", "CSV"], ["tsv", "TSV"], ["ods", "OpenDocument"], ["numbers", "Apple Numbers"]] },
  { key: "Images", icon: FileImage, formats: [["jpg", "JPEG"], ["jpeg", "JPEG"], ["png", "PNG"], ["webp", "WebP"], ["avif", "AVIF"], ["gif", "GIF"], ["bmp", "Bitmap"], ["tif", "TIFF"], ["tiff", "TIFF"], ["svg", "SVG"], ["heic", "HEIC"], ["heif", "HEIF"]] },
  { key: "Audio", icon: FileAudio2, formats: [["mp3", "MP3"], ["wav", "WAV"], ["flac", "FLAC"], ["aac", "AAC"], ["m4a", "M4A"], ["ogg", "Ogg"], ["opus", "Opus"], ["wma", "WMA"], ["aiff", "AIFF"], ["amr", "AMR"]] },
  { key: "Video", icon: FileVideo2, formats: [["mp4", "MP4"], ["mov", "QuickTime MOV"], ["mkv", "Matroska"], ["avi", "AVI"], ["webm", "WebM"], ["mpeg", "MPEG"], ["mpg", "MPEG"], ["flv", "FLV"], ["ogv", "Ogg Video"], ["wmv", "Windows Media Video"], ["3gp", "3GP"]] },
  { key: "Archives", icon: FileArchive, formats: [["zip", "ZIP"], ["7z", "7-Zip"], ["tar", "TAR"], ["gz", "GZip"], ["bz2", "BZip2"], ["xz", "XZ"], ["rar", "RAR"]] },
  { key: "Data & Code", icon: FileCode2, formats: [["json", "JSON"], ["xml", "XML"], ["yaml", "YAML"], ["yml", "YAML"], ["sql", "SQL"], ["log", "Log"], ["ini", "INI"], ["toml", "TOML"]] },
] as const

const FORMATS: Format[] = FORMAT_GROUPS.flatMap((group) => group.formats.map(([ext, name]) => ({ ext, name, group: group.key }))).filter((f, i, a) => a.findIndex((x) => x.ext === f.ext) === i)
const POPULAR = ["pdf", "docx", "xlsx", "pptx", "jpg", "png", "webp", "mp4", "mp3", "zip"]
const HINTS: Record<string, string[]> = {
  pdf: ["docx", "txt", "png", "jpg", "html"],
  docx: ["pdf", "txt", "html"],
  xlsx: ["pdf", "csv", "tsv"],
  pptx: ["pdf", "jpg", "png"],
  jpg: ["png", "webp", "pdf"],
  png: ["jpg", "webp", "pdf"],
  webp: ["jpg", "png", "pdf"],
  mp4: ["mp3", "wav", "mov", "webm"],
  mp3: ["wav", "flac", "m4a"],
  csv: ["json", "tsv", "xlsx"],
  json: ["csv", "tsv"],
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

function formatOf(ext: string): Format {
  return FORMATS.find((f) => f.ext === ext) || { ext, name: ext.toUpperCase(), group: "Other" }
}

function extensionOf(name: string) {
  return name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || ""
}

function Selector({ label, value, onClick }: { label: string; value: Format; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-left transition hover:border-white/20 hover:bg-white/[0.065] focus:outline-none focus:ring-2 focus:ring-cyan-400/40">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold text-white">{value.ext.toUpperCase()}</div>
          <div className="truncate text-xs text-slate-500">{value.name}</div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      </div>
    </button>
  )
}

function FormatPicker({ side, value, onClose, onSelect }: { side: "from" | "to"; value: Format; onClose: () => void; onSelect: (format: Format) => void }) {
  const [query, setQuery] = useState("")
  const lower = query.trim().toLowerCase()
  const filtered = lower ? FORMATS.filter((f) => `${f.ext} ${f.name} ${f.group}`.toLowerCase().includes(lower)) : FORMATS
  const hints = side === "to" ? HINTS[value.ext] || [] : []

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-10 backdrop-blur-sm">
      <button aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f14] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search className="h-4 w-4 text-slate-500" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={side === "from" ? "Search an input format" : "Search a destination format"} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto px-5 py-5">
          {!lower && (
            <div className="mb-6">
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Popular</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {POPULAR.map((ext) => {
                  const f = formatOf(ext)
                  return <button key={ext} onClick={() => onSelect(f)} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-left hover:border-cyan-400/30"><div className="text-xs font-semibold text-white">{ext.toUpperCase()}</div><div className="mt-0.5 text-[11px] text-slate-600">{f.group}</div></button>
                })}
              </div>
              {side === "to" && hints.length > 0 && (
                <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-4">
                  <div className="text-xs font-medium text-cyan-300">Common destinations for {value.ext.toUpperCase()}</div>
                  <div className="mt-2 flex flex-wrap gap-2">{hints.map((ext) => <button key={ext} onClick={() => onSelect(formatOf(ext))} className="rounded-lg border border-cyan-400/15 px-2.5 py-1.5 text-xs font-medium text-slate-200">{ext.toUpperCase()}</button>)}</div>
                </div>
              )}
            </div>
          )}
          <div className="space-y-6">
            {(lower ? [{ key: "Matches", icon: Search, formats: filtered.map((f) => [f.ext, f.name] as [string, string]) }] : FORMAT_GROUPS).map((group) => {
              const Icon = group.icon
              const entries = group.formats as readonly [string, string][]
              return (
                <section key={group.key}>
                  <div className="mb-3 flex items-center gap-2"><Icon className="h-4 w-4 text-slate-500" /><h3 className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{group.key}</h3></div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {entries.map(([ext, name]) => <button key={ext} onClick={() => onSelect(formatOf(ext))} className={`rounded-xl border px-3 py-2.5 text-left transition ${value.ext === ext ? "border-cyan-400/30 bg-cyan-400/[0.06]" : "border-white/8 bg-white/[0.025] hover:border-white/15"}`}><div className="text-xs font-semibold text-white">{ext.toUpperCase()}</div><div className="mt-0.5 truncate text-[11px] text-slate-600">{name}</div></button>)}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function DropZone({ files, onFiles, onRemove }: { files: File[]; onFiles: (files: File[]) => void; onRemove: (name: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const addFiles = (items: FileList | File[]) => onFiles([...files, ...Array.from(items)])

  if (!files.length) {
    return (
      <div>
        <input ref={input} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = "" }} />
        <button type="button" onClick={() => input.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }} className="group flex min-h-[210px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/12 bg-white/[0.018] px-6 text-center transition hover:border-cyan-400/25">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 group-hover:text-cyan-300"><Upload className="h-5 w-5" /></div>
          <div className="text-sm font-semibold text-slate-200">Drop files here</div>
          <div className="mt-1 text-xs text-slate-600">or click to browse from your computer</div>
          <div className="mt-4 text-[11px] text-slate-700">Multiple files supported</div>
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-4">
        <div><div className="text-sm font-semibold text-white">{files.length} file{files.length > 1 ? "s" : ""} ready</div><div className="mt-0.5 text-xs text-slate-600">Add more files or remove anything you do not need.</div></div>
        <button onClick={() => input.current?.click()} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5">Add files</button>
      </div>
      <input ref={input} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = "" }} />
      <div className="mt-4 divide-y divide-white/6 rounded-2xl border border-white/8 bg-black/10">
        {files.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 px-4 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/[0.035] text-[10px] font-semibold text-slate-400">{extensionOf(file.name).slice(0, 4).toUpperCase() || "FILE"}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-200">{file.name}</div><div className="text-[11px] text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MB</div></div><button onClick={() => onRemove(file.name)} className="rounded-lg p-2 text-slate-600 hover:bg-white/5 hover:text-slate-200"><X className="h-4 w-4" /></button></div>)}
      </div>
    </div>
  )
}

export default function Converter() {
  const [from, setFrom] = useState(formatOf("pdf"))
  const [to, setTo] = useState(formatOf("docx"))
  const [picker, setPicker] = useState<PickerSide>(null)
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")

  const detected = files[0] ? extensionOf(files[0].name) : ""

  const setFilesAndDetect = (next: File[]) => {
    setFiles(next)
    setStatus("idle")
    setMessage("")
    const ext = next[0] ? extensionOf(next[0].name) : ""
    if (ext && FORMATS.some((f) => f.ext === ext)) {
      const detectedFormat = formatOf(ext)
      setFrom(detectedFormat)
      const preferred = HINTS[ext]?.[0]
      if (preferred) setTo(formatOf(preferred))
    }
  }

  const swap = () => {
    const current = from
    setFrom(to)
    setTo(current)
    setStatus("idle")
    setMessage("")
  }

  async function convert() {
    if (!files.length || status === "running") return
    setStatus("running")
    setMessage(`Uploading ${files.length} file${files.length > 1 ? "s" : ""} to TraceX…`)

    try {
      const form = new FormData()
      form.append("from", from.ext)
      form.append("to", to.ext)
      files.forEach((file) => form.append("files", file))

      const response = await fetch(`${API_URL}/api/convert`, { method: "POST", body: form })
      if (!response.ok) {
        let errorMessage = "Conversion failed."
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch {}
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      const header = response.headers.get("Content-Disposition") || ""
      const match = header.match(/filename="?([^";]+)"?/) 
      const fallback = files.length > 1 ? `${files[0].name.replace(/\.[^.]+$/, "")}-${to.ext}-files.zip` : files[0].name.replace(/\.[^.]+$/, `.${to.ext}`)
      const filename = match?.[1] || fallback
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 3000)
      setStatus("done")
      setMessage(`${files.length} file${files.length > 1 ? "s" : ""} converted successfully.`)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Conversion failed.")
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-300/70">TraceX File Converter</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Change format</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Choose an input and an output format, add your files, and convert without leaving the page.</p>
          </div>
          <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/[0.04] px-3 py-1.5 text-[11px] text-emerald-300 sm:block">Server conversion</div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b0f14] p-4 shadow-2xl shadow-black/20 sm:p-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <Selector label="From" value={from} onClick={() => setPicker("from")} />
            <button onClick={swap} aria-label="Swap formats" className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500 hover:border-cyan-400/20 hover:text-cyan-300 lg:mt-4"><ArrowLeftRight className="h-4 w-4" /></button>
            <Selector label="To" value={to} onClick={() => setPicker("to")} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_340px]">
          <section className="rounded-[28px] border border-white/10 bg-[#0b0f14] p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-sm font-semibold text-white">Files</h2><p className="mt-1 text-xs text-slate-600">Drop one file or a batch. The first file sets the input format automatically.</p></div>
              {detected && <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.035] px-3 py-2 text-xs text-cyan-200">Detected {detected.toUpperCase()}</div>}
            </div>
            <div className="mt-5"><DropZone files={files} onFiles={setFilesAndDetect} onRemove={(name) => setFilesAndDetect(files.filter((f) => f.name !== name))} /></div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-[#0b0f14] p-5 sm:p-6">
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-cyan-300" /><h2 className="text-sm font-semibold text-white">Quick formats</h2></div>
            <p className="mt-2 text-xs leading-5 text-slate-600">Popular destinations for the selected file type.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">{(HINTS[from.ext] || POPULAR).slice(0, 10).map((ext) => <button key={ext} onClick={() => setTo(formatOf(ext))} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${to.ext === ext ? "border-cyan-400/25 bg-cyan-400/[0.05] text-cyan-200" : "border-white/8 bg-white/[0.025] text-slate-300 hover:border-white/15"}`}>{ext.toUpperCase()}</button>)}</div>
          </aside>
        </div>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-[#0b0f14] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600">Current selection</div>
              <div className="mt-2 flex items-center gap-2 text-base font-semibold text-white"><span>{from.ext.toUpperCase()}</span><ArrowLeftRight className="h-4 w-4 text-slate-600" /><span>{to.ext.toUpperCase()}</span></div>
              <div className="mt-1 text-xs text-slate-600">{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Add a file to continue"}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setFiles([]); setFrom(formatOf("pdf")); setTo(formatOf("docx")); setStatus("idle"); setMessage("") }} className="rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-500 hover:bg-white/5 hover:text-slate-300"><RotateCcw className="mr-2 inline h-3.5 w-3.5" />Reset</button>
              <button disabled={!files.length || status === "running"} onClick={convert} className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-600">{status === "running" ? "Converting…" : "Convert"}</button>
            </div>
          </div>

          {status !== "idle" && <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${status === "done" ? "border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300" : status === "error" ? "border-rose-400/15 bg-rose-400/[0.04] text-rose-300" : "border-cyan-400/15 bg-cyan-400/[0.04] text-cyan-200"}`}>{status === "done" && <Check className="mr-2 inline h-4 w-4" />}{message}</div>}
        </section>

        <div className="mt-6 pb-8 text-center text-[11px] text-slate-700">Render conversion engine • Batch-ready • Context-aware format selection</div>
      </div>
      {picker === "from" && <FormatPicker side="from" value={from} onClose={() => setPicker(null)} onSelect={(format) => { setFrom(format); setPicker(null); const preferred = HINTS[format.ext]?.[0]; if (preferred) setTo(formatOf(preferred)) }} />}
      {picker === "to" && <FormatPicker side="to" value={to} onClose={() => setPicker(null)} onSelect={(format) => { setTo(format); setPicker(null) }} />}
    </AppShell>
  )
}
