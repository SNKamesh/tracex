type Theme = {
  name: string
  description: string
  background: string
  accent: string
}

type Props = {
  theme: Theme
  selected?: boolean
}

export default function ThemePreview({ theme, selected }: Props) {
  return (
    <div
      className={`rounded-2xl border p-4 ${selected ? "border-tracex-400" : "border-slate-800"}`}
    >
      <div className={`mb-3 h-24 w-full rounded-xl ${theme.background}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{theme.name}</p>
          <p className="text-xs text-slate-400">{theme.description}</p>
        </div>
        <span className={`chip ${theme.accent}`}>Preview</span>
      </div>
    </div>
  )
}
