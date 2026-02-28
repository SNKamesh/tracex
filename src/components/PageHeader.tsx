import { ReactNode } from "react"

type Props = {
  title: string
  subtitle?: string
  rightSlot?: ReactNode
}

export default function PageHeader({ title, subtitle, rightSlot }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  )
}
