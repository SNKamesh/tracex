"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LegacyNoteXRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) void router.replace("/classroom");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6 text-center" style={{ background: "var(--background)", color: "var(--text)" }}>
      <p className="text-sm opacity-70">NoteX Bot has been removed. Taking you to TraceX Classroom…</p>
    </main>
  );
}
