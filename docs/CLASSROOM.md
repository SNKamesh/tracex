# TraceX Classroom (local-first MVP)

## Included
- Protected /classroom page in the existing Next.js Pages Router application.
- Browser-side PDF, PPTX, DOCX, TXT, Markdown and CSV text extraction (20 MB maximum).
- Local Ollama integration at http://127.0.0.1:11434.
- Optional Chrome on-device Prompt API provider for compatible desktop Chrome installations.
- Optional Chrome on-device Prompt API provider on eligible desktop Chrome installations; no cloud inference endpoint.
- Local-AI lesson plan generation, lesson navigation, concept-flow diagrams and optional equations.
- Full-screen whiteboard with four writing-style choices.
- Browser SpeechSynthesis narration, voice/speed selection, stop and auto-advance.
- Typed questions, optional browser Web Speech Recognition input, and local-model answer evaluation.
- No Groq/OpenAI inference call from Classroom and no upload of the original document to TraceX servers.

## Start locally
1. Install Ollama from https://ollama.com/
2. Run: ollama pull qwen2.5:3b
3. Ensure Ollama is running.
4. In PowerShell, set Ollama browser origins with: $env:OLLAMA_ORIGINS="http://localhost:3000,https://tracex-gdbl.vercel.app". Quit and reopen Ollama. For a permanent user-level setting, use [Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "http://localhost:3000,https://tracex-gdbl.vercel.app", "User"), then quit and reopen Ollama.
5. Open /classroom, select Local Ollama and press Test Ollama to list installed models. Or select Chrome on-device AI and use Check Chrome AI.

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
- Chrome on-device AI is available only on supported desktop Chrome versions and eligible devices. Chrome currently documents a minimum 16 GB RAM / 4+ CPU cores or GPU with more than 4 GB VRAM, and approximately 22 GB free space for the model download. It is not currently supported on Chrome for Android or iOS. See https://developer.chrome.com/docs/ai/prompt-api for current availability.
- Chrome on-device AI runs through Chrome's built-in on-device model when supported. Chrome documents desktop-only availability and hardware/storage requirements; check its current developer documentation before relying on this provider: https://developer.chrome.com/docs/ai/prompt-api

## Next steps
- OCR for scanned PDFs and image understanding for slides.
- Domain-specific, validated circuit/graph/block-diagram renderers.
- Fully local speech-to-text and Piper voice packaging.
- Automated tests and device capability benchmarks.
- Separate production audit of Firestore rules and backend authorization.
