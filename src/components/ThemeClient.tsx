"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "./Button";
import ThemePreview from "./ThemePreview";

// ─── IMPORT FROM YOUR CENTRAL FILE ──────────────────────────────────
// This prevents the "Firebase App [DEFAULT] already exists" error.
import { auth, db } from "@/lib/firebase"; 
import { doc, updateDoc } from "firebase/firestore";

const THEME_KEY = "tracex:theme";

const themes = [
  { name: "AMOLED", key: "amoled", description: "Pure black for deep contrast.", bg: "#000000" },
  { name: "Dark",   key: "dark",   description: "Soft dark theme for night study.", bg: "#0f172a" },
  { name: "Light",  key: "light",  description: "Clean and bright for daytime.", bg: "#e2e8f0" },
];

function applyTheme(themeKey: string) {
  document.body.classList.remove("tracex-theme-amoled", "tracex-theme-dark", "tracex-theme-light");
  document.body.classList.add(`tracex-theme-${themeKey}`);
  window.dispatchEvent(new CustomEvent("tracex-theme-change", { detail: themeKey }));
}

export default function ThemeClient() {
  const router = useRouter();
  const [selected, setSelected] = useState("amoled");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || "amoled";
    setSelected(saved);
    applyTheme(saved);
  }, []);

  const currentTheme = themes.find((t) => t.key === selected) || themes[0];
  const isLight = selected === "light";
  const textColor = isLight ? "#0f172a" : "#f8fafc";
  const subColor  = isLight ? "#475569" : "#94a3b8";

  function chooseTheme(themeKey: string) {
    setSelected(themeKey);
    // We still save to localStorage for an instant visual update
    localStorage.setItem(THEME_KEY, themeKey);
    applyTheme(themeKey);
  }

  async function applyThemeAndContinue() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // SAVE TO CLOUD: This ensures the Chrome Extension knows your preference.
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          theme: selected
        });
      }
      
      localStorage.setItem(THEME_KEY, selected);
      applyTheme(selected);
      router.push("/home");
    } catch (error) {
      console.error("Error saving theme to cloud:", error);
      // Even if the cloud save fails, we let the user into the home page.
      router.push("/home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: currentTheme.bg,
      color: textColor,
      transition: "background-color 0.3s, color 0.3s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <h1 style={{ textAlign: "center", fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
          Choose your Theme
        </h1>
        <p style={{ textAlign: "center", color: subColor, marginBottom: "32px" }}>
          Pick one before entering Home.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {themes.map((theme) => (
            <button
              key={theme.key}
              onClick={() => chooseTheme(theme.key)}
              style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <ThemePreview theme={theme} selected={selected === theme.key} isLight={isLight} />
            </button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "32px" }}>
          <Button onClick={applyThemeAndContinue} disabled={loading}>
            {loading ? "Saving Theme..." : "Continue to Home"}
          </Button>
        </div>
      </div>
    </div>
  );
}