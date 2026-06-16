export type NoteXMode = "summarize" | "explain" | "improve" | "ask" | "brainstorm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function askNoteXAI({
  message,
  context,
  mode,
}: {
  message: string;
  context: string;
  mode: NoteXMode;
}) {
  const response = await fetch(`${API_URL}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context, mode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "NoteX AI failed");
  }

  return data.answer as string;
}
