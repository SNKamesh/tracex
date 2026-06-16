// tracex/src/lib/notexAi.ts

// Automatically uses your production Render URL or drops back to local dev port
const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface NoteXResponse {
  success: boolean;
  data: string;
  error?: string;
}

export async function processNotesWithAI(documentText: string, formatType: string): Promise<NoteXResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/notex/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentText,
        formatType
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