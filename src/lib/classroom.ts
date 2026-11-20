export type LessonStep = {
  title: string;
  explanation: string;
  boardPoints: string[];
  equation?: string;
  diagramNodes?: string[];
  example?: string;
  checkQuestion?: string;
};
export type LessonPlan = { title: string; subject: string; steps: LessonStep[]; source: "local-ai" | "outline" };
export type ExtractedMaterial = { name: string; kind: string; text: string; pagesOrSlides: number };

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_TEXT_CHARS = 100_000;
const OLLAMA_URL = "http://127.0.0.1:11434";

function extensionOf(name: string): string { return name.split(".").pop()?.toLowerCase() || ""; }
function cleanText(value: string): string {
  return value.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function inflateZipEntry(bytes: Uint8Array, method: number): Promise<Uint8Array> {
  if (method === 0) return bytes;
  if (method !== 8 || typeof DecompressionStream === "undefined") throw new Error("Unsupported Office document compression in this browser.");
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw" as CompressionFormat));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipEntries(buffer: ArrayBuffer, wanted: (name: string) => boolean): Promise<Map<string, string>> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("This Office file is not a valid ZIP-based document.");
  const count = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const output = new Map<string, string>();
  for (let i = 0; i < count; i++) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break;
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + nameLength));
    cursor += 46 + nameLength + extraLength + commentLength;
    if (!wanted(name) || view.getUint32(localOffset, true) !== 0x04034b50) continue;
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const plain = await inflateZipEntry(bytes.slice(start, start + compressedSize), method);
    output.set(name, decoder.decode(plain));
  }
  return output;
}

function xmlParagraphs(xml: string, tag: string): string[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Could not read text inside this Office document.");
  return Array.from(doc.getElementsByTagNameNS("*", tag)).map((p) =>
    Array.from(p.getElementsByTagNameNS("*", "t")).map((n) => n.textContent || "").join("").trim()
  ).filter(Boolean);
}

async function extractPdf(file: File): Promise<ExtractedMaterial> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const lib = pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string }; getDocument: (options: Record<string, unknown>) => { promise: Promise<any> } };
  lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.7.284/pdf.worker.min.mjs";
  const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
  const pages: string[] = [];
  for (let pageNo = 1; pageNo <= Math.min(pdf.numPages, 80); pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    const lines = content.items.map((item: any) => typeof item.str === "string" ? item.str : "").filter(Boolean);
    if (lines.length) pages.push("Page " + pageNo + "\n" + lines.join(" "));
  }
  const text = cleanText(pages.join("\n\n")).slice(0, MAX_TEXT_CHARS);
  if (!text) throw new Error("No selectable text found. This may be a scanned PDF; OCR is not included in this first version.");
  return { name: file.name, kind: "PDF", text, pagesOrSlides: pdf.numPages };
}

async function extractPptx(file: File): Promise<ExtractedMaterial> {
  const entries = await readZipEntries(await file.arrayBuffer(), (name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  const slides = Array.from(entries.entries()).sort((a, b) => Number(a[0].match(/slide(\d+)\.xml/)?.[1] || 0) - Number(b[0].match(/slide(\d+)\.xml/)?.[1] || 0));
  if (!slides.length) throw new Error("No readable slides were found in this PPTX.");
  const text = slides.map(([name, xml]) => "Slide " + (name.match(/slide(\d+)\.xml/)?.[1] || "") + "\n" + xmlParagraphs(xml, "p").join("\n")).join("\n\n");
  return { name: file.name, kind: "PowerPoint", text: cleanText(text).slice(0, MAX_TEXT_CHARS), pagesOrSlides: slides.length };
}

async function extractDocx(file: File): Promise<ExtractedMaterial> {
  const entries = await readZipEntries(await file.arrayBuffer(), (name) => name === "word/document.xml");
  const xml = entries.get("word/document.xml");
  if (!xml) throw new Error("Could not find the main document text in this DOCX.");
  const text = cleanText(xmlParagraphs(xml, "p").join("\n"));
  if (!text) throw new Error("No text was found in this DOCX.");
  return { name: file.name, kind: "Word document", text: text.slice(0, MAX_TEXT_CHARS), pagesOrSlides: 1 };
}

export async function extractMaterial(file: File): Promise<ExtractedMaterial> {
  if (file.size > MAX_FILE_BYTES) throw new Error("Please upload a file smaller than 20 MB.");
  const ext = extensionOf(file.name);
  if (["txt", "md", "csv"].includes(ext)) {
    const text = cleanText(await file.text()).slice(0, MAX_TEXT_CHARS);
    if (!text) throw new Error("This file appears to be empty.");
    return { name: file.name, kind: ext.toUpperCase(), text, pagesOrSlides: 1 };
  }
  if (ext === "pdf") return extractPdf(file);
  if (ext === "pptx") return extractPptx(file);
  if (ext === "docx") return extractDocx(file);
  if (ext === "ppt") throw new Error("Legacy .ppt files are not supported. Save the presentation as .pptx and upload it again.");
  throw new Error("Supported formats: PDF, PPTX, DOCX, TXT, MD and CSV.");
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...init, signal: controller.signal }); }
  finally { window.clearTimeout(timer); }
}

export async function listLocalModels(): Promise<string[]> {
  const response = await fetchWithTimeout(OLLAMA_URL + "/api/tags");
  if (!response.ok) throw new Error("Ollama returned HTTP " + response.status + ".");
  const data = await response.json();
  return Array.isArray(data.models) ? data.models.map((item: { name?: string }) => item.name).filter(Boolean) : [];
}

export async function askLocalModel(model: string, prompt: string, json = false): Promise<string> {
  const response = await fetchWithTimeout(OLLAMA_URL + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, stream: false, format: json ? "json" : undefined, messages: [{ role: "user", content: prompt }], options: { temperature: 0.35, num_ctx: 8192 } })
  }, 120_000);
  if (!response.ok) throw new Error("Local model returned HTTP " + response.status + ".");
  const data = await response.json();
  const content = data?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("The local model returned an empty response.");
  return content.trim();
}

function parsePlan(raw: string, material: ExtractedMaterial): LessonPlan | null {
  try {
    const cleaned = raw.replace(new RegExp("^\\s{0,3}" + String.fromCharCode(96, 96, 96) + "(?:json)?\\s*", "i"), "").replace(new RegExp("\\s*" + String.fromCharCode(96, 96, 96) + "\\s*$"), "");
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.steps) || !parsed.steps.length) return null;
    const steps: LessonStep[] = parsed.steps.slice(0, 12).map((step: any, index: number) => ({
      title: String(step.title || "Teaching step " + (index + 1)).slice(0, 120),
      explanation: String(step.explanation || step.narration || "").slice(0, 3500),
      boardPoints: Array.isArray(step.boardPoints) ? step.boardPoints.map(String).slice(0, 6) : [],
      equation: typeof step.equation === "string" ? step.equation.slice(0, 500) : undefined,
      diagramNodes: Array.isArray(step.diagramNodes) ? step.diagramNodes.map(String).slice(0, 5) : undefined,
      example: typeof step.example === "string" ? step.example.slice(0, 1200) : undefined,
      checkQuestion: typeof step.checkQuestion === "string" ? step.checkQuestion.slice(0, 500) : undefined
    })).filter((step: LessonStep) => step.explanation.trim().length > 0);
    if (!steps.length) return null;
    return { title: String(parsed.title || material.name).slice(0, 120), subject: String(parsed.subject || "From your uploaded material").slice(0, 100), steps, source: "local-ai" };
  } catch { return null; }
}

export async function createLessonPlan(model: string, material: ExtractedMaterial): Promise<LessonPlan> {
  const prompt = [
    "You are TraceX Classroom, a careful teacher. Create a faithful teaching plan using ONLY the supplied material.",
    "Do not invent facts, formulas, values, or source claims. Keep original terminology. Make 4 to 8 logical teaching steps where the material allows.",
    "Return valid JSON only with schema: { title, subject, steps: [{ title, explanation, boardPoints: string[], equation?: string, diagramNodes?: string[], example?: string, checkQuestion?: string }] }.",
    "Use clear language but do not omit important concepts. Include equations only when supported by the material. State when the source is incomplete.",
    "SOURCE MATERIAL (" + material.kind + "):\n" + material.text.slice(0, 22_000)
  ].join("\n\n");
  const raw = await askLocalModel(model, prompt, true);
  const plan = parsePlan(raw, material);
  if (!plan) throw new Error("The model replied, but its lesson plan was not valid JSON. Try again or choose another local model.");
  return plan;
}

export async function answerLocalQuestion(model: string, material: ExtractedMaterial, step: LessonStep, question: string): Promise<string> {
  return askLocalModel(model, [
    "You are the TraceX teacher. Answer accurately using the provided source and current step. Distinguish source facts from general explanation. If the source is insufficient, say so.",
    "Current step: " + step.title + "\n" + step.explanation,
    "Student question: " + question,
    "Relevant uploaded material:\n" + material.text.slice(0, 12_000)
  ].join("\n\n"));
}

export async function evaluateLocalAnswer(model: string, material: ExtractedMaterial, step: LessonStep, question: string, answer: string): Promise<string> {
  return askLocalModel(model, [
    "Evaluate a student's answer as a supportive but rigorous teacher. Identify what is correct, incorrect or missing, then explain the correction. Different wording alone is not an error. State uncertainty when the source is insufficient.",
    "Lesson: " + step.title + "\nTeaching explanation: " + step.explanation,
    "Question: " + question + "\nStudent answer: " + answer,
    "Relevant source:\n" + material.text.slice(0, 10_000)
  ].join("\n\n"));
}
