"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Button from "./Button";
import ThemePreview from "./ThemePreview";

const THEME_KEY = "tracex:theme";

const themes = [
  {
    name: "AMOLED",
    key: "amoled",
    description: "Pure black for deep contrast.",
    background: "bg-black",
  },
  {
    name: "Dark",
    key: "dark",
    description: "Soft dark theme for night study.",
    background: "bg-slate-900",
  },
  {
    name: "Light",
    key: "light",
    description: "Clean and bright for daytime.",
    background: "bg-slate-200",
  },
];

function applyTheme(themeKey: string) {
  document.body.classList.remove("tracex-theme-amoled", "tracex-theme-dark", "tracex-theme-light");
  document.body.classList.add(`tracex-theme-${themeKey}`);
  window.dispatchEvent(new CustomEvent("tracex-theme-change", { detail: themeKey }));
}

export default function ThemeClient() {
  const router = useRouter();
  const [selected, setSelected] = useState("amoled");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || "amoled";
    setSelected(saved);
    applyTheme(saved);
  }, []);

  const textTone = useMemo(() => (selected === "light" ? "text-slate-900" : "text-white"), [selected]);
  const subTone = useMemo(() => (selected === "light" ? "text-slate-600" : "text-slate-400"), [selected]);

  function chooseTheme(themeKey: string) {
    setSelected(themeKey);
    localStorage.setItem(THEME_KEY, themeKey);
    applyTheme(themeKey);
  }

  function applyThemeAndContinue() {
    localStorage.setItem(THEME_KEY, selected);
    applyTheme(selected);
    router.push("/home");
  }

  return (
    <div className={`min-h-screen px-4 py-10 flex items-center justify-center transition-colors ${textTone}`}>
      <div className="w-full max-w-5xl">
        <h1 className="text-center text-3xl font-bold mb-2">Choose your Theme</h1>
        <p className={`text-center mb-8 ${subTone}`}>Pick one before entering Home.</p>

        <div className="grid gap-4 md:grid-cols-3">
          {themes.map((theme) => (
            <button
              key={theme.name}
              type="button"
              onClick={() => chooseTheme(theme.key)}
              className="text-left"
            >
              <ThemePreview theme={theme} selected={selected === theme.key} />
            </button>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={applyThemeAndContinue}>Continue to Home</Button>
        </div>
      </div>
    </div>
  );
}