export const dynamic = "force-dynamic";
import { useState } from "react"
import AppShell from "@/components/AppShell"
import Button from "@/components/Button"
import PageHeader from "@/components/PageHeader"
import ThemePreview from "@/components/ThemePreview"

const themes = [
  {
    name: "AMOLED Black",
    description: "Pure black for deep contrast.",
    background: "bg-black",
    accent: "bg-white text-black"
  },
  {
    name: "Dark",
    description: "Balanced dark palette for long sessions.",
    background: "bg-slate-900",
    accent: "bg-slate-700 text-white"
  },
  {
    name: "Light",
    description: "Bright, clean look for daytime study.",
    background: "bg-slate-100",
    accent: "bg-slate-200 text-slate-800"
  }
]

export default function ThemeSelection() {
  const [selected, setSelected] = useState(themes[0].name)

  return (
    <AppShell>
      <PageHeader
        title="Theme Selection"
        subtitle="Pick a theme. Previews update across devices in real-time."
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
      <div className="flex items-center gap-4">
        <Button>Save Theme</Button>
        <span className="chip">Selected: {selected}</span>
      </div>
    </AppShell>
  )
}
