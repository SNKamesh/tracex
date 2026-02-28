"use client";
import { useState } from "react";
import AppShell from "./AppShell";
import PageHeader from "./PageHeader";
import Button from "./Button";
import ThemePreview from "./ThemePreview";

const themes = [
  {
    name: "AMOLED Black",
    description: "Pure black for deep contrast.",
    background: "bg-black",
    accent: "bg-white text-black",
  },
  {
    name: "Dark",
    description: "Soft dark theme for night study.",
    background: "bg-slate-900",
    accent: "bg-slate-700 text-white",
  },
  {
    name: "Light",
    description: "Clean and bright for daytime.",
    background: "bg-slate-100",
    accent: "bg-slate-200 text-black",
  },
];

export default function ThemeClient() {
  const [selected, setSelected] = useState("AMOLED Black");

  return (
    <AppShell>
      <PageHeader
        title="Theme Selection"
        subtitle="Choose a theme for your TraceX experience."
      />

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

      <div className="flex items-center gap-4 mt-4">
        <Button>Save Theme</Button>
        <span className="chip">Selected: {selected}</span>
      </div>
    </AppShell>
  );
}