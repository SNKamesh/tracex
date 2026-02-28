"use client";

import React from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-transparent text-inherit">
      <Sidebar />
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}