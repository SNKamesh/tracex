"use client";

import { useMemo, useRef, useState } from "react"
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
type Result = { name: string; blob: Blob }
type Status = { kind: "idle" | "running" | "done" | "error"; message?: string }

const FORMAT_GROUPS = [
  { key: "Documents", icon: FileText, formats: [["pdf", "PDF"], ["doc", "Word 97–2003"], ["docx", "Word"], ["docm", "Word Macro"], ["rtf", "Rich Text"], ["odt", "OpenDocument"], ["txt", "Plain Text"], ["html", "HTML"], ["htm", "HTML"], ["md", "Markdown"], ["epub", "EPUB eBook"], ["mobi", "MOBI"], ["azw3", "AZW3"]] },
  { key: "Presentations", icon: FileType2, formats: [["ppt", "PowerPoint 97–2003"], ["pptx", "PowerPoint"], ["pptm", "PowerPoint Macro"], ["odp", "OpenDocument Presentation"], ["ppsx", "PowerPoint Show"]] },
  { key: "Spreadsheets", icon: FileSpreadsheet, formats: [["xls", "Excel 97–2003"], ["xlsx", "Excel"], ["xlsm", "Excel Macro"], ["csv", "CSV"], ["tsv", "TSV"], ["ods", "OpenDocument Spreadsheet"], ["numbers", "Apple Numbers"]] },
  { key: "Images", icon: FileImage, formats: [["jpg", "JPEG"], ["jpeg", "JPEG"], ["png", "PNG"], ["webp", "WebP"], ["avif", "AVIF"], ["gif", "GIF"], ["bmp", "Bitmap"], ["tif", "TIFF"], ["tiff", "TIFF"], ["svg", "SVG"], ["heic", "HEIC"], ["heif", "HEIF"]] },
  { key: "Audio", icon: FileAudio2, formats: [["mp3", "MP3"], ["wav", "WAV"], ["flac", "FLAC"], ["aac", "AAC"], ["m4a", "M4A"], ["ogg", "Ogg"], ["opus", "Opus"], ["wma", "WMA"], ["aiff", "AIFF"], ["amr", "AMR"]] },
  { key: "Video", icon: FileVideo2, formats: [["mp4", "MP4"], ["mov", "QuickTime MOV"], ["mkv", "Matroska"], ["avi", "AVI"], ["webm", "WebM"], ["mpeg", "MPEG"], ["mpg", "MPEG"], ["flv", "FLV"], ["ogv", "Ogg Video"], ["wmv", "Windows Media Video"], ["3gp", "3GP"]] },
  { key: "Archives", icon: FileArchive, formats: [["zip", "ZIP"], ["7z", "7-Zip"], ["tar", "TAR"], ["gz", "GZip"], ["bz2", "BZip2"], ["xz", "XZ"], ["rar", "RAR"]] },
  { key: "Data & Code", icon: FileCode2, formats: [["json", "JSON"], ["xml", "XML"], ["yaml", "YAML"], ["yml", "YAML"], ["sql", "SQL"], ["log", "Log"], ["ini", "INI"], ["toml", "TOML"]] },
] as const

const FORMATS: Format[] = FORMAT_GROUPS.flatMap((group) =>
  group.formats.map(([ext, name]) => ({ ext, name, group: group.key })),
).filter((f, i, a) => a.findIndex((x) => x.ext === f.ext) === i)

const POPULAR = ["pdf", "docx", "xlsx", "pptx", "jpg", "png", "webp", "mp4", "mp3", "zip"]

const SOURCE_HINTS: Record<string, string[]> = {
  pdf: ["docx", "txt", "jpg", "png", "webp", "html"],
  docx: ["pdf", "txt", "html"],
  txt: ["pdf", "docx", "html", "md"],
  html: ["txt", "pdf", "md"],
  md: ["txt", "html", "pdf"],
  jpg: ["png", "webp", "pdf"],
  jpeg: ["png", "webp", "pdf"],
  png: ["jpg", "webp", "pdf"],
  webp: ["jpg", "png", "pdf"],
  csv: ["json", "tsv"],
  tsv: ["csv", "json"],
  json: ["csv", "tsv"],
}

const SUPPORTED_PAIRS = new Set([
  "pdf:docx", "pdf:txt", "pdf:png", "pdf:jpg",
  "docx:pdf", "docx:txt", "docx:html",
  "txt:pdf", "txt:docx", "txt:html", "txt:md",
  "html:txt", "html:md", "md:txt", "md:html", "md:pdf",
  "jpg:png", "jpg:webp", "jpg:pdf", "jpeg:png", "jpeg:webp", "jpeg:pdf",
  "png:jpg", "png:webp", "png:pdf", "webp:jpg", "webp:png", "webp:pdf",
  "csv:json", "csv:tsv", "tsv:csv", "tsv:json", "json:csv", "json:tsv",
])

function formatOf(ext: string): Format {
  return FORMATS.find((f) => f.ext === ext) ?? { ext, name: ext.toUpperCase(), group: "Other" }
}

function extensionOf(name: string) {
  return name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? ""
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i]
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function zipStore(files: { name: string; data: Uint8Array }[]) {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []
  const central: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.name)
    const data = file.data
    const crc = crc32(data)
    const local = new Uint8Array(30 + name.length + data.length)
    const view = new DataView(local.buffer)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(8, 0, true)
    view.setUint16(10, 0, true)
    view.setUint16(12, 0, true)
    view.setUint32(14, crc, true)
    view.setUint32(18, data.length, true)
    view.setUint32(22, data.length, true)
    view.setUint16(26, name.length, true)
    view.setUint16(28, 0, true)
    local.set(name, 30)
    local.set(data, 30 + name.length)
    parts.push(local)

    const entry = new Uint8Array(46 + name.length)
    const ev = new DataView(entry.buffer)
    ev.setUint32(0, 0x02014b50, true)
    ev.setUint16(4, 20, true)
    ev.setUint16(6, 20, true)
    ev.setUint16(8, 0, true)
    ev.setUint16(10, 0, true)
    ev.setUint16(12, 0, true)
    ev.setUint16(14, 0, true)
    ev.setUint32(16, crc, true)
    ev.setUint32(20, data.length, true)
    ev.setUint32(24, data.length, true)
    ev.setUint16(28, name.length, true)
    ev.setUint16(30, 0, true)
    ev.setUint16(32, 0, true)
    ev.setUint16(34, 0, true)
    ev.setUint16(36, 0, true)
    ev.setUint32(38, 0, true)
    ev.setUint32(42, offset, true)
    entry.set(name, 46)
    central.push(entry)
    offset += local.length
  }

  const centralBytes = central.reduce((n, x) => n + x.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(8, files.length, true)
  endView.setUint16(10, files.length, true)
  endView.setUint32(12, centralBytes, true)
  endView.setUint32(16, offset, true)

  return new Blob([...parts, ...central, end], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
}

function makeDocx(text: string) {
  const encoder = new TextEncoder()
  const paragraphs = text.split(/\r?\n/).map((line) => line.trim() ? `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>` : "<w:p/>").join("")
  return zipStore([
    { name: "[Content_Types].xml", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`) },
    { name: "_rels/.rels", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`) },
    { name: "word/document.xml", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`) },
    { name: "word/styles.xml", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/></w:rPr></w:style></w:styles>`) },
    { name: "word/_rels/document.xml.rels", data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`) },
  ])
}

async function pdfText(file: File) {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist")
  GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs"
  const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((item: any) => "str" in item ? item.str : "").join(" "))
  }
  return pages.join("\n\n")
}

async function renderPdfPages(file: File, type: "png" | "jpg") {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist")
  GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs"
  const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const results: Blob[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.6 })
    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not render page")), type === "jpg" ? "image/jpeg" : "image/png", 0.92))
    results.push(blob)
  }
  return results
}

async function docxText(file: File) {
  const mammoth = await import("mammoth")
  return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value
}

async function makePdf(text: string) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib")
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const lines = text.split(/\r?\n/)
  let page = pdf.addPage([595, 842])
  let y = 800
  for (const line of lines) {
    const chunks = line.match(/.{1,95}/g) ?? [""]
    for (const chunk of chunks) {
      if (y < 40) { page = pdf.addPage([595, 842]); y = 800 }
      page.drawText(chunk, { x: 40, y, size: 11, font, color: rgb(0.12, 0.12, 0.12) })
      y -= 16
    }
    y -= 4
  }
  return new Blob([await pdf.save()], { type: "application/pdf" })
}

async function imageBlob(file: File, target: string) {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Image rendering is unavailable")
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  const mime = target === "jpg" || target === "jpeg" ? "image/jpeg" : target === "webp" ? "image/webp" : "image/png"
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image conversion failed")), mime, 0.92))
}

async function imagesToPdf(files: File[]) {
  const { PDFDocument } = await import("pdf-lib")
  const pdf = await PDFDocument.create()
  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const ext = extensionOf(file.name)
    const image = ext === "jpg" || ext === "jpeg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes)
    const scale = Math.min(555 / image.width, 780 / image.height, 1)
    const page = pdf.addPage([595, 842])
    page.drawImage(image, { x: (595 - image.width * scale) / 2, y: (842 - image.height * scale) / 2, width: image.width * scale, height: image.height * scale })
  }
  return new Blob([await pdf.save()], { type: "application/pdf" })
}

function parseDelimited(text: string, delimiter: string) {
  const rows = text.trim().split(/\r?\n/).map((line) => line.split(delimiter))
  const headers = rows[0] ?? []
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((key, i) => [key, row[i] ?? ""])))
}

function jsonToCsv(value: any[]) {
  if (!Array.isArray(value) || !value.length) return ""
  const keys = [...new Set(value.flatMap((row) => Object.keys(row)))]
  const quote = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`
  return [keys.map(quote).join(","), ...value.map((row) => keys.map((key) => quote(row[key])).join(","))].join("\n")
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function convertFile(file: File, from: string, to: string): Promise<Result> {
  if (from === to) return { name: file.name, blob: file }
  if (from === "pdf" && to === "txt") return { name: file.name.replace(/\.pdf$/i, ".txt"), blob: new Blob([await pdfText(file)], { type: "text/plain" }) }
  if (from === "pdf" && to === "docx") return { name: file.name.replace(/\.pdf$/i, ".docx"), blob: makeDocx(await pdfText(file)) }
  if (from === "pdf" && (to === "png" || to === "jpg")) {
    const pages = await renderPdfPages(file, to)
    if (pages.length === 1) return { name: file.name.replace(/\.pdf$/i, `.${to}`), blob: pages[0] }
    const packed = zipStore(await Promise.all(pages.map(async (blob, i) => ({ name: `page-${String(i + 1).padStart(3, "0")}.${to}`, data: new Uint8Array(await blob.arrayBuffer()) }))))
    return { name: file.name.replace(/\.pdf$/i, "-pages.zip"), blob: packed }
  }
  if (from === "docx" && to === "txt") return { name: file.name.replace(/\.docx$/i, ".txt"), blob: new Blob([await docxText(file)], { type: "text/plain" }) }
  if (from === "docx" && to === "html") return { name: file.name.replace(/\.docx$/i, ".html"), blob: new Blob([`<html><body><pre>${escapeXml(await docxText(file))}</pre></body></html>`], { type: "text/html" }) }
  if (from === "docx" && to === "pdf") return { name: file.name.replace(/\.docx$/i, ".pdf"), blob: await makePdf(await docxText(file)) }
  if (["txt", "html", "htm", "md"].includes(from) && ["txt", "html", "htm", "md"].includes(to)) {
    const text = await file.text()
    const output = to === "html" || to === "htm" ? `<html><body><pre>${escapeXml(text)}</pre></body></html>` : text.replace(/<[^>]*>/g, "")
    return { name: file.name.replace(/\.[^.]+$/i, `.${to}`), blob: new Blob([output], { type: to === "html" || to === "htm" ? "text/html" : "text/plain" }) }
  }
  if ((from === "txt" || from === "md") && to === "pdf") return { name: file.name.replace(/\.[^.]+$/i, ".pdf"), blob: await makePdf(await file.text()) }
  if ((from === "txt" || from === "md") && to === "docx") return { name: file.name.replace(/\.[^.]+$/i, ".docx"), blob: makeDocx(await file.text()) }
  if (from === "html" && to === "pdf") return { name: file.name.replace(/\.[^.]+$/i, ".pdf"), blob: await makePdf((await file.text()).replace(/<[^>]*>/g, " ")) }
  if (["jpg", "jpeg", "png", "webp"].includes(from)) {
    if (to === "pdf") return { name: file.name.replace(/\.[^.]+$/i, ".pdf"), blob: await imagesToPdf([file]) }
    if (["jpg", "jpeg", "png", "webp"].includes(to)) return { name: file.name.replace(/\.[^.]+$/i, `.${to}`), blob: await imageBlob(file, to) }
  }
  if ((from === "csv" || from === "tsv") && to === "json") return { name: file.name.replace(/\.[^.]+$/i, ".json"), blob: new Blob([JSON.stringify(parseDelimited(await file.text(), from === "csv" ? "," : "\t"), null, 2)], { type: "application/json" }) }
  if (from === "json" && (to === "csv" || to === "tsv")) {
    const data = JSON.parse(await file.text())
    const csv = jsonToCsv(data)
    return { name: file.name.replace(/\.[^.]+$/i, `.${to}`), blob: new Blob([to === "tsv" ? csv.replaceAll(",", "\t") : csv], { type: "text/plain" }) }
  }
  throw new Error(`${from.toUpperCase()} → ${to.toUpperCase()} is not available in this conversion engine yet.`)
}

function Selector({ label, value, onClick }: { label: string; value: Format; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-left transition hover:border-white/20 hover:bg-white/[0.065] focus:outline-none focus:ring-2 focus:ring-cyan-400/40"><div className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{label}</div><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="truncate text-[15px] font-semibold text-white">{value.ext.toUpperCase()}</div><div className="truncate text-xs text-slate-500">{value.name}</div></div><ChevronDown className="h-4 w-4 shrink-0 text-slate-500" /></div></button>
}

function FormatPicker({ side, onClose, value, onSelect }: { side: "from" | "to"; onClose: () => void; value: Format; onSelect: (format: Format) => void }) {
  const [query, setQuery] = useState("")
  const lower = query.trim().toLowerCase()
  const hints = side === "to" ? SOURCE_HINTS[value.ext] ?? [] : []
  const filtered = useMemo(() => lower ? FORMATS.filter((f) => `${f.ext} ${f.name} ${f.group}`.toLowerCase().includes(lower)) : FORMATS, [lower])
  return <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 py-10 backdrop-blur-sm"><button aria-label="Close" className="absolute inset-0" onClick={onClose} /><div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f14] shadow-2xl"><div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><Search className="h-4 w-4 text-slate-500" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={side === "from" ? "Search an input format" : "Search a destination format"} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /><button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"><X className="h-4 w-4" /></button></div><div className="max-h-[72vh] overflow-y-auto px-5 py-5">{!lower && <div className="mb-6"><div className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Popular</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{POPULAR.map((ext) => { const f = formatOf(ext); return <button key={ext} onClick={() => onSelect(f)} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-left hover:border-cyan-400/30"><div className="text-xs font-semibold text-white">{f.ext.toUpperCase()}</div><div className="mt-0.5 text-[11px] text-slate-600">{f.group}</div></button> })}</div>{side === "to" && hints.length > 0 && <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-4"><div className="text-xs font-medium text-cyan-300">Common destinations for {value.ext.toUpperCase()}</div><div className="mt-2 flex flex-wrap gap-2">{hints.map((ext) => <button key={ext} onClick={() => onSelect(formatOf(ext))} className="rounded-lg border border-cyan-400/15 px-2.5 py-1.5 text-xs font-medium text-slate-200">{ext.toUpperCase()}</button>)}</div></div>}</div>}<div className="space-y-6">{(lower ? [{ key: "Matches", icon: Search, formats: filtered.map((f) => [f.ext, f.name] as [string, string]) }] : FORMAT_GROUPS).map((group) => { const Icon = group.icon; const entries = group.formats as readonly [string, string][]; if (!entries.length) return null; return <section key={group.key}><div className="mb-3 flex items-center gap-2"><Icon className="h-4 w-4 text-slate-500" /><h3 className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{group.key}</h3></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{entries.map(([ext, name]) => { const f = formatOf(ext); const supported = side === "to" ? SUPPORTED_PAIRS.has(`${value.ext}:${ext}`) : true; return <button key={ext} disabled={side === "to" && !supported} onClick={() => onSelect(f)} className={`rounded-xl border px-3 py-2.5 text-left transition ${f.ext === value.ext ? "border-cyan-400/30 bg-cyan-400/[0.06]" : supported || side === "from" ? "border-white/8 bg-white/[0.025] hover:border-white/15" : "border-white/5 bg-white/[0.012] opacity-35 cursor-not-allowed"}`}><div className="text-xs font-semibold text-white">{f.ext.toUpperCase()}</div><div className="mt-0.5 truncate text-[11px] text-slate-600">{name}</div></button> })}</div></section> })}</div></div></div>
}

function DropZone({ files, onFiles, onRemove }: { files: File[]; onFiles: (files: File[]) => void; onRemove: (name: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const addFiles = (items: FileList | File[]) => onFiles([...files, ...Array.from(items)])
  if (!files.length) return <div><input ref={input} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = "" }} /><button type="button" onClick={() => input.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }} className="group flex min-h-[190px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/12 bg-white/[0.018] px-6 text-center transition hover:border-cyan-400/25"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 group-hover:text-cyan-300"><Upload className="h-5 w-5" /></div><div className="text-sm font-semibold text-slate-200">Drop files here</div><div className="mt-1 text-xs text-slate-600">or click to browse from your computer</div><div className="mt-4 text-[11px] text-slate-700">Multiple files supported</div></button></div>
  return <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center justify-between gap-4"><div><div className="text-sm font-semibold text-white">{files.length} file{files.length > 1 ? "s" : ""} ready</div><div className="mt-0.5 text-xs text-slate-600">Add more files or remove anything you do not need.</div></div><button onClick={() => input.current?.click()} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5">Add files</button></div><input ref={input} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.currentTarget.value = "" }} /><div className="mt-4 divide-y divide-white/6 rounded-2xl border border-white/8 bg-black/10">{files.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 px-4 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/[0.035] text-[10px] font-semibold text-slate-400">{extensionOf(file.name).slice(0, 4).toUpperCase() || "FILE"}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-200">{file.name}</div><div className="text-[11px] text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MB</div></div><button onClick={() => onRemove(file.name)} className="rounded-lg p-2 text-slate-600 hover:bg-white/5 hover:text-slate-200"><X className="h-4 w-4" /></button></div>)}</div></div>
}

export default function Converter() {
  const [from, setFrom] = useState<Format>(formatOf("pdf"))
  const [to, setTo] = useState<Format>(formatOf("docx"))
  const [picker, setPicker] = useState<PickerSide>(null)
  const [files, setFiles] = useState<File[]>([])
  const [advanced, setAdvanced] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [results, setResults] = useState<Result[]>([])

  const detected = files[0] ? extensionOf(files[0].name) : ""
  const supported = SUPPORTED_PAIRS.has(`${from.ext}:${to.ext}`)

  const setFilesAndDetect = (next: File[]) => {
    setFiles(next)
    setResults([])
    const ext = next[0] ? extensionOf(next[0].name) : ""
    if (ext && FORMATS.some((f) => f.ext === ext)) {
      const detectedFormat = formatOf(ext)
      setFrom(detectedFormat)
      const preferred = SOURCE_HINTS[ext]?.[0]
      if (preferred) setTo(formatOf(preferred))
    }
  }

  const swap = () => {
    const current = from
    setFrom(to)
    setTo(current)
    setResults([])
    setStatus({ kind: "idle" })
  }

  async function handleConvert() {
    if (!files.length || !supported) return
    setStatus({ kind: "running", message: `Converting ${files.length} file${files.length > 1 ? "s" : ""}…` })
    setResults([])
    try {
      const output: Result[] = []
      for (const file of files) output.push(await convertFile(file, from.ext, to.ext))
      setResults(output)
      output.forEach((result) => download(result.blob, result.name))
      setStatus({ kind: "done", message: `${output.length} conversion${output.length > 1 ? "s" : ""} complete.` })
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Conversion failed." })
    }
  }

  return <AppShell><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8"><div className="flex items-end justify-between gap-4"><div><div className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-300/70">TraceX File Converter</div><h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">Change format</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Choose an input and an output format, add your files, and convert without leaving the page.</p></div><div className={`hidden rounded-full border px-3 py-1.5 text-[11px] sm:block ${supported ? "border-emerald-400/20 bg-emerald-400/[0.04] text-emerald-300" : "border-white/10 bg-white/[0.03] text-slate-500"}`}>{supported ? "Ready" : "Format pair unavailable"}</div></div><div className="mt-8 rounded-[28px] border border-white/10 bg-[#0b0f14] p-4 shadow-2xl shadow-black/20 sm:p-6"><div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><Selector label="From" value={from} onClick={() => setPicker("from")} /><button onClick={swap} aria-label="Swap formats" className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500 hover:border-cyan-400/20 hover:text-cyan-300 lg:mt-4"><ArrowLeftRight className="h-4 w-4" /></button><Selector label="To" value={to} onClick={() => setPicker("to")} /></div></div><div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_340px]"><section className="rounded-[28px] border border-white/10 bg-[#0b0f14] p-4 sm:p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold text-white">Files</h2><p className="mt-1 text-xs text-slate-600">Drop one file or a batch. The first file sets the input format automatically.</p></div>{detected && <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.035] px-3 py-2 text-xs text-cyan-200">Detected {detected.toUpperCase()}</div>}</div><div className="mt-5"><DropZone files={files} onFiles={setFilesAndDetect} onRemove={(name) => setFilesAndDetect(files.filter((f) => f.name !== name))} /></div></section><aside className="rounded-[28px] border border-white/10 bg-[#0b0f14] p-5 sm:p-6"><div className="flex items-center gap-2"><Zap className="h-4 w-4 text-cyan-300" /><h2 className="text-sm font-semibold text-white">Quick formats</h2></div><p className="mt-2 text-xs leading-5 text-slate-600">Popular destinations for the selected file type.</p><div className="mt-4 grid grid-cols-2 gap-2">{(SOURCE_HINTS[from.ext] ?? POPULAR).slice(0, 10).map((ext) => <button key={ext} onClick={() => setTo(formatOf(ext))} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${to.ext === ext ? "border-cyan-400/25 bg-cyan-400/[0.05] text-cyan-200" : "border-white/8 bg-white/[0.025] text-slate-300 hover:border-white/15"}`}>{ext.toUpperCase()}</button>)}</div><div className="mt-5 border-t border-white/8 pt-5"><button onClick={() => setAdvanced((v) => !v)} className="flex w-full items-center justify-between text-left text-xs font-medium text-slate-400 hover:text-white"><span>Conversion settings</span><ChevronDown className={`h-4 w-4 transition ${advanced ? "rotate-180" : ""}`} /></button>{advanced && <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 text-xs leading-5 text-slate-500">Only settings relevant to the selected pair will appear here. The current native engine uses sensible defaults.</div>}</div></aside></div><section className="mt-6 rounded-[28px] border border-white/10 bg-[#0b0f14] p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600">Current selection</div><div className="mt-2 flex items-center gap-2 text-base font-semibold text-white"><span>{from.ext.toUpperCase()}</span><ArrowLeftRight className="h-4 w-4 text-slate-600" /><span>{to.ext.toUpperCase()}</span></div><div className="mt-1 text-xs text-slate-600">{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Add a file to continue"}</div></div><div className="flex items-center gap-2"><button onClick={() => { setFiles([]); setResults([]); setFrom(formatOf("pdf")); setTo(formatOf("docx")); setStatus({ kind: "idle" }) }} className="rounded-xl border border-white/10 px-3 py-2.5 text-xs font-medium text-slate-500 hover:bg-white/5 hover:text-slate-300"><RotateCcw className="mr-2 inline h-3.5 w-3.5" />Reset</button><button disabled={!files.length || !supported || status.kind === "running"} onClick={handleConvert} className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-600">{status.kind === "running" ? "Converting…" : "Convert"}</button></div></div>{!supported && files.length > 0 && <div className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.025] px-3 py-2.5 text-xs text-amber-200/80">This format pair is listed in the catalog but does not have a native conversion path yet. Choose one of the highlighted destinations to convert now.</div>}{status.kind !== "idle" && <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${status.kind === "done" ? "border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300" : status.kind === "error" ? "border-rose-400/15 bg-rose-400/[0.04] text-rose-300" : "border-cyan-400/15 bg-cyan-400/[0.04] text-cyan-200"}`}>{status.message}</div>}{results.length > 0 && <div className="mt-4 space-y-2">{results.map((result) => <div key={result.name} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3"><Check className="h-4 w-4 text-emerald-300" /><div className="min-w-0 flex-1 truncate text-sm text-slate-200">{result.name}</div><button onClick={() => download(result.blob, result.name)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"><Download className="mr-1.5 inline h-3.5 w-3.5" />Download</button></div>)}</div>}</section><div className="mt-6 pb-8 text-center text-[11px] text-slate-700">Native conversion engine • Context-aware destinations • Batch-friendly workflow</div></div>{picker === "from" && <FormatPicker side="from" value={from} onClose={() => setPicker(null)} onSelect={(f) => { setFrom(f); setPicker(null); const preferred = SOURCE_HINTS[f.ext]?.[0]; if (preferred) setTo(formatOf(preferred)); setResults([]); setStatus({ kind: "idle" }) }} />}{picker === "to" && <FormatPicker side="to" value={to} onClose={() => setPicker(null)} onSelect={(f) => { setTo(f); setPicker(null); setResults([]); setStatus({ kind: "idle" }) }} />}</AppShell>
}
