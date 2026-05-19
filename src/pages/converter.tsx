"use client";

import { useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import Toggle from "@/components/Toggle";

// ── types ──────────────────────────────────────────────────────────────────
type ConversionStep = { label: string; done: boolean };
type ConversionState =
  | { status: "idle" }
  | { status: "running"; steps: ConversionStep[]; currentStep: number }
  | { status: "done"; downloadUrl: string; filename: string }
  | { status: "error"; message: string };

// ── helpers ────────────────────────────────────────────────────────────────
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

async function readAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsText(file);
  });
}

function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([new Uint8Array(bytes)], { type });
}

// ── LoadingOverlay ─────────────────────────────────────────────────────────
function LoadingOverlay({
  state,
  icon,
  onClose,
}: {
  state: ConversionState;
  icon: string;
  onClose: () => void;
}) {
  if (state.status === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-md mx-4 rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl text-center">
        
        {/* Animated Icon Space */}
        <div className="mb-6 flex justify-center relative">
          <span className={`text-6xl ${state.status === "running" ? "animate-bounce" : ""}`}>{icon}</span>
          {state.status === "running" && (
            <span className="absolute top-0 h-16 w-16 rounded-full bg-blue-500/20 animate-ping" />
          )}
        </div>

        {state.status === "running" && (
          <>
            <h3 className="mb-1 text-xl font-bold text-white tracking-wide">
              Working Magic... ✨
            </h3>
            <p className="mb-6 text-xs text-slate-400">
              Crafting your files. Please keep this tab open!
            </p>

            {/* Impressive non-technical step list */}
            <ol className="mb-6 space-y-4 text-left bg-slate-900/50 p-4 rounded-xl border border-slate-900">
              {state.steps.map((step, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      step.done
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : i === state.currentStep
                        ? "animate-pulse bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {step.done ? "✓" : i + 1}
                  </span>
                  <span
                    className={`text-sm tracking-wide transition-colors duration-300 ${
                      step.done
                        ? "text-slate-400 line-through decoration-slate-600"
                        : i === state.currentStep
                        ? "text-white font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>

            {/* Premium progress timeline bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 shadow-inner"
                style={{
                  width: `${
                    ((state.currentStep + (state.steps[state.currentStep]?.done ? 1 : 0)) /
                      state.steps.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </>
        )}

{state.status === "done" && (
          <>
            <h3 className="mb-1 text-xl font-bold text-emerald-400 tracking-wide">
              Ready to Roll! 🎉
            </h3>
            <p className="mb-6 text-sm text-slate-400">
              Your optimized file has been successfully prepared.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={state.downloadUrl}
                download={state.filename}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-bold text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                ⬇️ Download {state.filename}
              </a>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
              >
                Done
              </button>
            </div>
          </>
        )}

        {state.status === "error" && (
          <>
            <h3 className="mb-1 text-xl font-bold text-rose-400 tracking-wide">
              Ouch! Something Went Wrong 🛠️
            </h3>
            <p className="mb-6 text-sm text-slate-400">
              {state.message}
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-all"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── custom Select ──────────────────────────────────────────────────────────
function StyledSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
    >
      {children}
    </select>
  );
}

// ── FileDropZone ───────────────────────────────────────────────────────────
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
      className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/50 px-4 py-4 text-center transition-colors hover:border-blue-500 hover:bg-slate-800"
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
          <span className="text-sm font-medium text-blue-400 truncate max-w-full">
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

// ── multi-file drop zone (for merge) ──────────────────────────────────────
function MultiFileDropZone({
  files,
  onFiles,
}: {
  files: File[];
  onFiles: (f: File[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const dropped = Array.from(e.dataTransfer.files).filter((f) =>
          f.name.endsWith(".pdf")
        );
        if (dropped.length) onFiles([...files, ...dropped]);
      }}
      className="flex min-h-[80px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/50 px-4 py-4 text-center transition-colors hover:border-blue-500 hover:bg-slate-800"
    >
      <input
        ref={ref}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const picked = Array.from(e.target.files ?? []);
          if (picked.length) onFiles([...files, ...picked]);
          e.currentTarget.value = "";
        }}
      />
      {files.length > 0 ? (
        <>
          <span className="text-xl">📑</span>
          <span className="text-sm font-medium text-blue-400">
            {files.length} PDF{files.length > 1 ? "s" : ""} selected
          </span>
          <ul className="mt-1 text-xs text-slate-500 space-y-0.5">
            {files.map((f, i) => (
              <li key={i} className="truncate max-w-[240px]">
                {f.name}
              </li>
            ))}
          </ul>
          <span className="text-xs text-slate-600">click to add more</span>
          <button
            type="button"
            className="mt-1 text-xs text-slate-500 underline hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onFiles([]);
            }}
          >
            Clear all
          </button>
        </>
      ) : (
        <>
          <span className="text-2xl text-slate-500">⬆️</span>
          <span className="text-sm text-slate-400">Drop PDFs here (2+)</span>
          <span className="text-xs text-slate-600">click or drag & drop</span>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function Converter() {
  // ── shared conversion state ──────────────────────────────────────────────
  const [convState, setConvState] = useState<ConversionState>({ status: "idle" });
  const [convIcon, setConvIcon] = useState("📄");
  const [compressLevel, setCompressLevel] = useState<"low" | "medium" | "high">("medium");
  const [imgOp, setImgOp] = useState("png");
  const [imgFile, setImgFile] = useState<File | null>(null);

  // helper to estimate compressed size sizes metrics visually instantly
  const estimateCompressedSize = (bytes: number, level: "low" | "medium" | "high") => {
    const ratios = { low: 0.85, medium: 0.65, high: 0.45 };
    return Math.max(1, Math.round(bytes * ratios[level]));
  };

  // helper to advance steps
  const advance = async (
    steps: ConversionStep[],
    idx: number
  ): Promise<ConversionStep[]> => {
    await sleep(400);
    const updated = steps.map((s, i) =>
      i < idx ? { ...s, done: true } : i === idx ? { ...s, done: false } : s
    );
    setConvState({ status: "running", steps: updated, currentStep: idx });
    await sleep(600);
    return updated;
  };

  const finish = (url: string, filename: string) => {
    setConvState({ status: "done", downloadUrl: url, filename });
  };

  const fail = (message: string) => {
    setConvState({ status: "error", message });
  };

  const reset = () => {
    setConvState({ status: "idle" });
  };

  // ── Document Tools ───────────────────────────────────────────────────────
  const [docOp, setDocOp] = useState("PDF → Text");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [pdfOp, setPdfOp] = useState("Merge PDFs");
  const [txtFile, setTxtFile] = useState<File | null>(null);
  const [imgToPdfFile, setImgToPdfFile] = useState<File | null>(null);

  // ── perform: PDF → Text ──────────────────────────────────────────────────
  const doPdfToText = async (file: File) => {
    setConvIcon("📄");
    const stepDefs = ["Reading PDF structure...", "Extracting readable text strings...", "Assembling file packaging..."];
    const steps = stepDefs.map((label) => ({ label, done: false }));
    setConvState({ status: "running", steps, currentStep: 0 });

    try {
      let s = await advance(steps, 0);
      const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
      GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";
      const ab = await readAsArrayBuffer(file);
      s = await advance(s, 1);
      const pdf = await getDocument({ data: ab }).promise;
      let text = "";
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const tc = await page.getTextContent();
        text +=
          tc.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ") + "\n\n";
      }
      s = await advance(s, 2);
      const blob = new Blob([text], { type: "text/plain" });
      finish(URL.createObjectURL(blob), file.name.replace(/\.pdf$/i, "") + ".txt");
    } catch (e: unknown) {
      fail((e as Error).message ?? "Failed to extract text");
    }
  };

  // ── perform: Word → Text (mammoth) ──────────────────────────────────────
  const doWordToText = async (file: File) => {
    setConvIcon("📄");
    const stepDefs = ["Opening Word document...", "Converting content layout...", "Exporting clean file text..."];
    const steps = stepDefs.map((label) => ({ label, done: false }));
    setConvState({ status: "running", steps, currentStep: 0 });
    try {
      let s = await advance(steps, 0);
      const mammoth = await import("mammoth");
      const ab = await readAsArrayBuffer(file);
      s = await advance(s, 1);
      const result = await mammoth.extractRawText({ arrayBuffer: ab });
      s = await advance(s, 2);
      const blob = new Blob([result.value], { type: "text/plain" });
      finish(URL.createObjectURL(blob), file.name.replace(/\.docx?$/i, "") + ".txt");
    } catch (e: unknown) {
      fail((e as Error).message ?? "Failed to convert Word doc");
    }
  };

  // ── perform: Image → PDF ─────────────────────────────────────────────────
  const doImageToPdf = async (file: File) => {
    setConvIcon("🖼️");
    const stepDefs = ["Analyzing photo composition...", "Creating fresh blueprint lines...", "Wrapping up final canvas..."];
    const steps = stepDefs.map((label) => ({ label, done: false }));
    setConvState({ status: "running", steps, currentStep: 0 });
    try {
      let s = await advance(steps, 0);
      const { PDFDocument } = await import("pdf-lib");
      const ab = await readAsArrayBuffer(file);
      s = await advance(s, 1);
      const pdfDoc = await PDFDocument.create();
      let img;
      if (file.type === "image/png") {
        img = await pdfDoc.embedPng(ab);
      } else {
        img = await pdfDoc.embedJpg(ab);
      }
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      s = await advance(s, 2);
      const bytes = await pdfDoc.save();
      const blob = bytesToBlob(bytes, "application/pdf");
      finish(URL.createObjectURL(blob), file.name.replace(/\.[^.]+$/, "") + ".pdf");
    } catch (e: unknown) {
      fail((e as Error).message ?? "Failed to convert image");
    }
  };

  // ── perform: TXT → PDF ──────────────────────────────────────────────────
  const doTxtToPdf = async (file: File) => {
    setConvIcon("📝");
    const stepDefs = ["Parsing raw strings...", "Formatting custom alignment grids...", "Generating vector pages..."];
    const steps = stepDefs.map((label) => ({ label, done: false }));
    setConvState({ status: "running", steps, currentStep: 0 });
    try {
      let s = await advance(steps, 0);
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const text = await readAsText(file);
      s = await advance(s, 1);
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Courier);
      const fontSize = 11;
      const margin = 50;
      const pageWidth = 595;
      const pageHeight = 842;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = fontSize * 1.4;

      const rawLines = text.split("\n");
      const lines: string[] = [];
      for (const raw of rawLines) {
        if (raw.trim() === "") { lines.push(""); continue; }
        let cur = "";
        for (const word of raw.split(" ")) {
          const test = cur ? cur + " " + word : word;
          if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
            cur = test;
          } else {
            if (cur) lines.push(cur);
            cur = word;
          }
        }
        if (cur) lines.push(cur);
      }

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;
      for (const line of lines) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        if (line) {
          page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
        }
        y -= lineHeight;
      }
      s = await advance(s, 2);
      const bytes = await pdfDoc.save();
      const blob = bytesToBlob(bytes, "application/pdf");
      finish(URL.createObjectURL(blob), file.name.replace(/\.txt$/i, "") + ".pdf");
    } catch (e: unknown) {
      fail((e as Error).message ?? "Failed to convert text");
    }
  };

  // ── perform: Merge PDFs ──────────────────────────────────────────────────
  const doMergePdfs = async (files: File[]) => {
    setConvIcon("📑");
    const stepDefs = [
      "Gathering selected files...",
      "Stitching asset timelines...",
      "Binding compound structures...",
      "Finalizing single portfolio...",
    ];
    const steps = stepDefs.map((label) => ({ label, done: false }));
    setConvState({ status: "running", steps, currentStep: 0 });
    try {
      let s = await advance(steps, 0);
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();
      s = await advance(s, 1);
      for (const file of files) {
        const ab = await readAsArrayBuffer(file);
        const src = await PDFDocument.load(ab);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      s = await advance(s, 2);
      s = await advance(s, 3);
      const bytes = await merged.save();
      const blob = bytesToBlob(bytes, "application/pdf");
      finish(URL.createObjectURL(blob), "merged.pdf");
    } catch (e: unknown) {
      fail((e as Error).message ?? "Failed to merge PDFs");
    }
  };

  // ── perform: Compress PDF (Live Render/Ghostscript API) ──────────────────
  const doCompressPdf = async (file: File) => {
    setConvIcon("🗜️");
    
    // Smooth impressive client text strings
    const stepDefs = [
      "🛸 Gathering your pages...", 
      "✨ Compacting layouts & shrinking footprints...", 
      "🎁 Wrapping up your polished PDF..."
    ];
    let steps = stepDefs.map((label) => ({ label, done: false }));
    setConvState({ status: "running", steps, currentStep: 0 });
  
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", compressLevel || "medium"); 
  
      const response = await fetch("https://tracex-be.onrender.com/compress", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Our cloud sorting engines hit a snag optimizing your document.");
      }
  
      const data = await response.json();
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      await sleep(400);
      steps[0].done = true;
      setConvState({ status: "running", steps, currentStep: 1 });
      
      await sleep(600);
      steps[1].done = true;
      setConvState({ status: "running", steps, currentStep: 2 });
  
      await sleep(400);
      steps[2].done = true;
  
      setConvState({
        status: "done",
        downloadUrl: data.url,
        filename: data.filename,
      });
  
    } catch (e: unknown) {
      setConvState({
        status: "error",
        message: (e as Error).message ?? "Failed to compress PDF target",
      });
    }
  };

  // ── handle Convert click ─────────────────────────────────────────────────
// ── handle Convert click ─────────────────────────────────────────────────
const handleDocConvert = async () => {
  if (docOp === "PDF → Text") {
    if (!docFile) return alert("Upload a PDF first");
    await doPdfToText(docFile);
  } else if (docOp === "Word → Text") {
    if (!docFile) return alert("Upload a .docx file first");
    await doWordToText(docFile);
  } else if (docOp === "Image → PDF") {
    if (!imgToPdfFile) return alert("Upload an image first");
    await doImageToPdf(imgToPdfFile);
  } else if (docOp === "TXT → PDF") {
    if (!txtFile) return alert("Upload a .txt file first");
    await doTxtToPdf(txtFile);
  }
};
const handleImageConvertSubmit = async () => {
  if (!imgFile) return alert("Please upload an image asset first!");
  
  setConvIcon("🖼️");
  const stepDefs = [
    "🛸 Inspecting dimensions...",
    "🎨 Rendering fresh pixels & shifting color spaces...",
    "🎁 Wrapping up your polished image...",
  ];
  let steps = stepDefs.map((label) => ({ label, done: false }));
  setConvState({ status: "running", steps, currentStep: 0 });

  try {
    const formData = new FormData();
    formData.append("file", imgFile);

    // Smart two-way conversion mapping for the JPG ↔ PNG option
    let targetFormat = imgOp;
    if (imgOp === "png" && (imgFile.name.endsWith(".png") || imgFile.type === "image/png")) {
      targetFormat = "jpeg"; 
    }

    formData.append("format", targetFormat);

    const response = await fetch("https://tracex-be.onrender.com/convert-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("The image processing engine hit a configuration roadblock.");
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    await sleep(400);
    steps[0].done = true;
    setConvState({ status: "running", steps, currentStep: 1 });

    await sleep(600);
    steps[1].done = true;
    setConvState({ status: "running", steps, currentStep: 2 });

    await sleep(400);
    steps[2].done = true;

    setConvState({ status: "done", downloadUrl: data.url, filename: data.filename });
  } catch (e: unknown) {
    setConvState({
      status: "error",
      message: (e as Error).message ?? "Failed to convert selected image file",
    });
  }
};

  const handlePdfToolApply = async () => {
    if (pdfOp === "Merge PDFs") {
      if (mergeFiles.length < 2) return alert("Select at least 2 PDFs to merge");
      await doMergePdfs(mergeFiles);
    } else if (pdfOp === "Compress PDF") {
      if (!docFile) return alert("Upload a PDF to compress");
      await doCompressPdf(docFile);
    } else {
      alert(`${pdfOp} — coming soon!`);
    }
  };

  // ── decide which file drop to show ──────────────────────────────────────
  const showDocDrop =
    docOp === "PDF → Text" || docOp === "Word → Text";
  const docDropAccept =
    docOp === "PDF → Text" ? ".pdf" : ".doc,.docx";
  const docDropLabel =
    docOp === "PDF → Text"
      ? "Upload a PDF file"
      : "Upload a Word (.docx) file";

  return (
    <AppShell>
      <LoadingOverlay state={convState} icon={convIcon} onClose={reset} />

      <PageHeader
        title="File Converter"
        subtitle="Document, image, video, and audio conversions with premium tools."
      />

      {/* DOCUMENT TOOLS */}
      <SectionCard
        title="Document Tools"
        description="Convert between PDF, Word, images, and text."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {/* left: conversion type */}
          <div className="space-y-3">
            <StyledSelect value={docOp} onChange={setDocOp}>
              <option>PDF → Text</option>
              <option>Word → Text</option>
              <option>Image → PDF</option>
              <option>TXT → PDF</option>
            </StyledSelect>

            {showDocDrop && (
              <FileDropZone
                accept={docDropAccept}
                file={docFile}
                onFile={setDocFile}
                label={docDropLabel}
              />
            )}
            {docOp === "Image → PDF" && (
              <FileDropZone
                accept=".jpg,.jpeg,.png"
                file={imgToPdfFile}
                onFile={setImgToPdfFile}
                label="Upload JPG or PNG image"
              />
            )}
            {docOp === "TXT → PDF" && (
              <FileDropZone
                accept=".txt"
                file={txtFile}
                onFile={setTxtFile}
                label="Upload a .txt file"
              />
            )}

            <Button onClick={handleDocConvert}>Convert</Button>
          </div>

          {/* right: PDF tools */}
          <div className="space-y-3">
            <StyledSelect value={pdfOp} onChange={setPdfOp}>
              <option>Merge PDFs</option>
              <option>Compress PDF</option>
              <option>Split PDF (coming soon)</option>
              <option>Extract ZIP / RAR (coming soon)</option>
            </StyledSelect>

            {pdfOp === "Merge PDFs" && (
              <MultiFileDropZone files={mergeFiles} onFiles={setMergeFiles} />
            )}
            
            {pdfOp === "Compress PDF" && (
              <div className="space-y-3">
                <FileDropZone
                  accept=".pdf"
                  file={docFile}
                  onFile={setDocFile}
                  label="Upload PDF to compress"
                />

                <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
                  <div className="mb-2 text-xs font-medium text-slate-400">
                    Compression Level
                  </div>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCompressLevel(lvl)}
                        className={`flex-1 rounded-md border px-3 py-2 text-xs font-semibold transition ${
                          compressLevel === lvl
                            ? "border-blue-500 bg-blue-500/20 text-blue-200"
                            : "border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {lvl === "low" ? "Low" : lvl === "medium" ? "Medium" : "High"}
                      </button>
                    ))}
                  </div>

                  {docFile && (
                    <div className="mt-3 text-xs text-slate-400">
                      Estimated size:{" "}
                      <span className="text-slate-200">
                        {(docFile.size / 1024).toFixed(0)} KB →{" "}
                        {(estimateCompressedSize(docFile.size, compressLevel) / 1024).toFixed(0)} KB
                      </span>{" "}
                      (est.)
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <Button variant="secondary" onClick={handlePdfToolApply}>
                    Apply Tool
                  </Button>
                  <button
                    type="button"
                    onClick={() => setCompressLevel("medium")}
                    className="rounded-md px-3 py-2 text-xs text-slate-400 hover:text-white transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {pdfOp !== "Compress PDF" && (
              <Button variant="secondary" onClick={handlePdfToolApply}>
                Apply Tool
              </Button>
            )}
          </div>
        </div>
      </SectionCard>

{/* IMAGE TOOLS */}
<SectionCard
        title="Image Tools"
        description="Transform files between popular high-fidelity graphics structures instantly."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left Column: Dropdown Selection & Dropzone */}
          <div className="space-y-3">
            <StyledSelect value={imgOp} onChange={setImgOp}>
              <option value="jpg-png">JPG ↔ PNG</option>
              <option value="webp-jpg">WEBP → JPG</option>
              <option value="heic-jpg">HEIC → JPG</option>
            </StyledSelect>

            <FileDropZone 
  accept={
    imgOp === "webp-jpg" 
      ? ".webp" 
      : imgOp === "heic-jpg" 
      ? ".heic" 
      : ".jpg,.jpeg,.png"
  } 
  file={imgFile} 
  onFile={setImgFile} 
  label={
    imgOp === "webp-jpg"
      ? "Upload a WEBP image"
      : imgOp === "heic-jpg"
      ? "Upload an HEIC image"
      : "Upload a JPG or PNG image"
  } 
/>
          </div>
          
          {/* Right Column: Submission Alignment Action */}
          <div className="flex items-end">
            <Button onClick={handleImageConvertSubmit} className="w-full">
              Convert Image
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* VIDEO + AUDIO — UI only */}
      <SectionCard
        title="Video & Audio"
        description="MP4, MOV, MKV, MP3, WAV, AAC — coming soon."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <StyledSelect value="MP4 ↔ MP3" onChange={() => {}}>
            <option>MP4 ↔ MP3</option>
            <option>MP4 ↔ MOV</option>
            <option>MKV → MP4</option>
            <option>AVI → MP4</option>
            <option>Video → GIF</option>
          </StyledSelect>
          <Button onClick={() => alert("Video tools coming soon!")}>
            Convert Video
          </Button>

          <StyledSelect value="MP3 ↔ WAV" onChange={() => {}}>
            <option>MP3 ↔ WAV</option>
            <option>AAC → MP3</option>
            <option>M4A → MP3</option>
          </StyledSelect>
          <Button variant="secondary" onClick={() => alert("Audio tools coming soon!")}>
            Convert Audio
          </Button>
        </div>
      </SectionCard>

      {/* PREMIUM */}
      <SectionCard
        title="Premium Tools"
        description="OCR, scanned PDF to Word, large files."
      >
        <div className="flex flex-wrap gap-3">
          <Toggle checked={false} onChange={() => {}} label="OCR (Premium)" />
          <Toggle checked={false} onChange={() => {}} label="Scanned PDF → Word" />
          <Toggle checked={false} onChange={() => {}} label="Large Files" />
          <span className="chip">Ads for Freemium Only</span>
        </div>
      </SectionCard>
    </AppShell>
  );
}