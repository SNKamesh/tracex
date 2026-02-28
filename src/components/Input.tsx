import { InputHTMLAttributes } from "react"

type Props = InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ...props }: Props) {
  return (
    <input
      className={`w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-tracex-400 focus:outline-none ${className ?? ""}`}
      {...props}
    />
  )
}
