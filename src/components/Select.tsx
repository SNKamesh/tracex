import { SelectHTMLAttributes } from "react"

type Props = SelectHTMLAttributes<HTMLSelectElement>

export default function Select({ className, children, ...props }: Props) {
  return (
    <select
      className={`w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 focus:border-tracex-400 focus:outline-none ${className ?? ""}`}
      {...props}
    >
      {children}
    </select>
  )
}
