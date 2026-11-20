"use client";

import React from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)", color: "var(--text)" }}
    >
      <Sidebar />
      <main className="min-w-0 flex-1 min-h-screen px-4 pb-24 pt-20 sm:px-6 sm:pt-20 lg:px-10 lg:pb-10 lg:pt-8">
        <div className="mx-auto w-full max-w-[1480px] tx-page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
