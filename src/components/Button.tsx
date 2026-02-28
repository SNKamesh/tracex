import { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost"
}

const base =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
const variants = {
  primary: "bg-tracex-500 text-white hover:bg-tracex-400",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  ghost: "bg-transparent text-slate-200 hover:bg-slate-800"
}

export default function Button({ variant = "primary", className, ...props }: Props) {
  return <button className={`${base} ${variants[variant]} ${className ?? ""}`} {...props} />
}
