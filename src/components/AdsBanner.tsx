type Props = {
  visible: boolean
}

export default function AdsBanner({ visible }: Props) {
  if (!visible) return null
  return (
    <div className="glass card flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800">
      <div>
        <p className="text-sm font-semibold text-white">Freemium Ads</p>
        <p className="text-xs text-slate-400">Upgrade to remove ads and unlock Pro or Supreme.</p>
      </div>
      <span className="chip">Ad Slot</span>
    </div>
  )
}
