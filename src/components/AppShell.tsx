"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("amoled");

  useEffect(() => {
    const saved = localStorage.getItem("tracex:theme") || "amoled";
    setTheme(saved);
    const handler = (e: Event) => {
      setTheme((e as CustomEvent<string>).detail || "amoled");
    };
    window.addEventListener("tracex-theme-change", handler);
    return () => window.removeEventListener("tracex-theme-change", handler);
  }, []);

  const bgColor =
    theme === "light" ? "#f1f5f9" :
    theme === "dark"  ? "#0f172a" : "#000000";

  const textColor =
    theme === "light" ? "#0f172a" : "#f8fafc";

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      backgroundColor: bgColor,
      color: textColor,
      transition: "background-color 0.3s, color 0.3s",
    }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "40px" }}>{children}</main>
    </div>
  );
}