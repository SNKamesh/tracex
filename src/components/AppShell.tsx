"use client";

import React from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-[#0a0f1a] text-white">
      {/* LEFT — SIDEBAR */}
      <Sidebar />

      {/* RIGHT — MAIN CONTENT */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}