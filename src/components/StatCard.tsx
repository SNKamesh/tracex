type Props = {
  label: string
  value: string
  accent?: string
}

export default function StatCard({ label, value, accent }: Props) {
  return (
    <div className="glass card flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-white">{value}</p>
      </div>
      <span className={`chip ${accent ?? ""}`}>{label}</span>
    </div>
  )
}
