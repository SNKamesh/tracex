"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Button from "./Button";
import ThemePreview from "./ThemePreview";

const themes = [
  {
    name: "AMOLED",
    description: "Pure black for deep contrast.",
    background: "bg-black",
  },
  {
    name: "Dark",
    description: "Soft dark theme for night study.",
    background: "bg-slate-900",
  },
  {
    name: "Light",
    description: "Clean and bright for daytime.",
    background: "bg-slate-100",
  },
];

export default function ThemeClient() {
  const router = useRouter();
  const [selected, setSelected] = useState("AMOLED");

  function applyThemeAndContinue() {
    localStorage.setItem("tracex:theme", selected.toLowerCase());
    router.push("/home");
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-center text-3xl font-bold mb-2">Choose your Theme</h1>
        <p className="text-center text-slate-400 mb-8">Pick one before entering Home.</p>

        <div className="grid gap-4 md:grid-cols-3">
          {themes.map((theme) => (
            <button
              key={theme.name}
              type="button"
              onClick={() => setSelected(theme.name)}
              className="text-left"
            >
              <ThemePreview theme={theme} selected={selected === theme.name} />
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