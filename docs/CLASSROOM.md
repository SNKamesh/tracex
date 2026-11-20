# TraceX Classroom (local-first MVP)

## Included
- Protected /classroom page in the existing Next.js Pages Router application.
- Browser-side PDF, PPTX, DOCX, TXT, Markdown and CSV text extraction (20 MB maximum).
- Local Ollama integration at http://127.0.0.1:11434.
- Local-AI lesson plan generation, lesson navigation, concept-flow diagrams and optional equations.
- Full-screen whiteboard with four writing-style choices.
- Browser SpeechSynthesis narration, voice/speed selection, stop and auto-advance.
- Typed questions, optional browser Web Speech Recognition input, and local-model answer evaluation.
- No Groq/OpenAI inference call from Classroom and no upload of the original document to TraceX servers.

## Start locally
1. Install Ollama from https://ollama.com/
2. Run: ollama pull qwen2.5:3b
3. Ensure Ollama is running.
4. Allow exact browser origins in Ollama's OLLAMA_ORIGINS environment variable. For local development include http://localhost:3000. For the deployed TraceX site include https://tracex-gdbl.vercel.app. Restart Ollama after changing the environment.
5. Open /classroom and press Test to list installed models.

Do not set OLLAMA_ORIGINS=* on a public or shared computer. Allow only origins you control. A deployed TraceX page calls the Ollama process on the student's own computer, not a remote cloud model. Browser mixed-content/CORS/security policies may block this connection on some devices.

## Material limitations
- PDF text extraction uses the existing pdfjs-dist dependency and the matching PDF.js worker CDN. Text extraction runs in the browser. Scanned/image-only PDFs need OCR, which is not included in this MVP.
- PPTX and DOCX text is extracted from Open XML ZIP parts. Embedded images, charts and diagrams are not interpreted yet.
- Legacy .ppt files are unsupported; save them as .pptx.
- The simple diagram renderer displays model-provided concept sequences. It is not yet a validated engineering circuit, graph or block-diagram solver.
- Voice output uses browser/operating-system SpeechSynthesis. Available voices and offline behaviour vary.
- Speech input uses the browser Web Speech Recognition API when present. Some browser implementations may use online recognition; typed questions are always available.
- Local model answers can be wrong. Check important calculations and technical claims against the uploaded source or a trusted reference.

## Privacy and security
- Classroom sends extracted material text only to the local Ollama process on the same computer when generating a lesson.
- Do not expose Ollama's port to the public internet.
- The page is protected by the existing global ProtectedRoute.
- Classroom does not use the existing TraceX/Groq AI endpoint.

## Next steps
- OCR for scanned PDFs and image understanding for slides.
- Domain-specific, validated circuit/graph/block-diagram renderers.
- Fully local speech-to-text and Piper voice packaging.
- Automated tests and device capability benchmarks.
- Separate production audit of Firestore rules and backend authorization.
