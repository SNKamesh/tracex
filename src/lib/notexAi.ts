// tracex/src/lib/notexAi.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export type NoteXMode = "summarize" | "explain" | "improve" | "ask" | "brainstorm";

// Match the exact single-object parameter shape passed by your UI pages
export interface AskNoteXAIParams {
  message: string;
  context: string;
  mode: NoteXMode;
}

export interface NoteXResponse {
  success: boolean;
  data: string;
  error?: string;
}

/**
 * Handles communication with the backend for NoteX Bot processing.
 * Accepts a single unified parameter object to perfectly match UI usage.
 */
export async function askNoteXAI({ message, context, mode }: AskNoteXAIParams): Promise<NoteXResponse> {
  try {
    // Map the string to match your backend endpoints' expected casing
    const capitalizedFormat = mode.charAt(0).toUpperCase() + mode.slice(1);

    // If 'ask' mode includes a custom prompt message, use it; otherwise fall back to context text
    const textToProcess = mode === 'ask' && message ? `${message}\n\nContext:\n${context}` : context;

    const response = await fetch(`${BACKEND_URL}/api/ai/notex/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText: textToProcess,
        formatType: capitalizedFormat
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('NoteX AI Connection Error:', error);
    return {
      success: false,
      data: '',
      error: error.message || 'Failed to connect to the NoteX AI backend.'
    };
  }
}