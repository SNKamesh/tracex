// tracex/src/lib/notexAi.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Match the exact type name your UI expects
export type NoteXMode = "summarize" | "explain" | "improve" | "ask" | "brainstorm";

export interface NoteXResponse {
  success: boolean;
  data: string;
  error?: string;
}

/**
 * Handles communication with the backend for NoteX Bot processing
 * Renamed back to askNoteXAI to fix the Vercel build compilation crash
 */
export async function askNoteXAI(documentText: string, formatType: NoteXMode): Promise<NoteXResponse> {
  try {
    // Format type mapping to match your backend's expected capitalization
    const capitalizedFormat = formatType.charAt(0).toUpperCase() + formatType.slice(1);

    const response = await fetch(`${BACKEND_URL}/api/ai/notex/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText,
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