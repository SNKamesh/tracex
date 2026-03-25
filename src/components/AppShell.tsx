"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("amoled");

  useEffect(() => {
    // 1. Get initial theme from storage or default to amoled
    const saved = localStorage.getItem("tracex:theme") || "amoled";
    setTheme(saved);
    
    // 2. FORCE DARK ROOT: Immediately sets the HTML/Body to black 
    // to stop the white flash before React even finishes rendering.
    if (saved !== "light") {
      document.documentElement.style.backgroundColor = "#000000";
      document.body.style.backgroundColor = "#000000";
    }

    const handler = (e: Event) => {
      const newTheme = (e as CustomEvent<string>).detail || "amoled";
      setTheme(newTheme);
      // Update root background when theme is changed via settings
      const newBg = newTheme === "light" ? "#f1f5f9" : "#000000";
      document.documentElement.style.backgroundColor = newBg;
      document.body.style.backgroundColor = newBg;
    };

    window.addEventListener("tracex-theme-change", handler);
    return () => {
      window.removeEventListener("tracex-theme-change", handler);
    };
  }, []);

  const isLight = theme === "light";
  
  // 3. Dynamic Colors (Solid Backgrounds only)
  const bgColor = isLight ? "#F1F5F9" : theme === "dark" ? "#0F172A" : "#000000";
  const textColor = isLight ? "#0F172A" : "#F8FAFC";

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      backgroundColor: bgColor,
      color: textColor,
      transition: "background-color 0.3s ease",
      position: "relative",
    }}>
      <Sidebar />
      
      <main style={{ 
        flex: 1, 
        padding: "32px", 
        zIndex: 10,
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {children}
      </main>
    </div>
  );
}