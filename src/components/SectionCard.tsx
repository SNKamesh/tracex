import { ReactNode } from "react"

type Props = {
  title: string
  description?: string
  children: ReactNode
}

export default function SectionCard({ title, description, children }: Props) {
  return (
    <div className="glass card space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}
