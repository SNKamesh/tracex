"use client";

import React, { useEffect, useState } from "react";

const navItems = [
  { label: "Home", href: "/home", icon: "🏠" },
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Study Sessions", href: "/study", icon: "📚" },
  { label: "Study Plans", href: "/plans", icon: "📝" },
  { label: "Friends", href: "/friends", icon: "👥" },
  { label: "File Converter", href: "/converter", icon: "🔄" },
  { label: "NoteX Bot", href: "/notex", icon: "🤖" },
  { label: "Activity", href: "/activity", icon: "⚡" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
  { label: "Trash", href: "/trash", icon: "🗑️" },
];

export default function Sidebar() {
  const [theme, setTheme] = useState("amoled");
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    const saved = localStorage.getItem("tracex:theme") || "amoled";
    setTheme(saved);
    const handler = (e: Event) => {
      setTheme((e as CustomEvent<string>).detail || "amoled");
    };
    window.addEventListener("tracex-theme-change", handler);
    return () => window.removeEventListener("tracex-theme-change", handler);
  }, []);

  const sidebarBg = theme === "light" ? "#f8fafc" : theme === "dark" ? "#0f172a" : "#000000";
  const borderColor = theme === "light" ? "#e2e8f0" : theme === "dark" ? "#1e293b" : "#1a1a1a";
  const textColor = theme === "light" ? "#0f172a" : "#f8fafc";
  const activeBg = theme === "light" ? "#e2e8f0" : "#1e293b";

  return (
    <aside style={{
      width: "240px",
      minHeight: "100vh",
      backgroundColor: sidebarBg,
      borderRight: `1px solid ${borderColor}`,
      padding: "24px 16px",
      transition: "background-color 0.3s",
      flexShrink: 0,
    }}>
      <div style={{
        color: "#00d8ff",
        fontSize: "22px",
        fontWeight: 800,
        marginBottom: "32px",
        paddingLeft: "8px",
      }}>
        Trace<span style={{ color: textColor }}>X</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                textDecoration: "none",
                color: isActive ? "#00d8ff" : textColor,
                backgroundColor: isActive ? activeBg : "transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: "14px",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = activeBg;
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}