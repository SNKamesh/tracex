type Props = {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
}

export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-3 rounded-full border px-3 py-2 text-xs font-semibold ${
        checked
          ? "border-tracex-400 bg-tracex-500 text-white"
          : "border-slate-700 bg-slate-900 text-slate-200"
      }`}
    >
      <span className={`h-3 w-3 rounded-full ${checked ? "bg-white" : "bg-slate-500"}`} />
      <span>{label ?? (checked ? "On" : "Off")}</span>
    </button>
  )
}
