import { ReactNode } from "react"
import Sidebar from "@/components/Sidebar"

type Props = {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  )
}
