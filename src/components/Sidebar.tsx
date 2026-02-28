import Link from "next/link"
import { useRouter } from "next/router"
import { navItems } from "@/lib/navigation"

export default function Sidebar() {
  const router = useRouter()

  return (
    <aside className="glass flex h-full w-full flex-col gap-6 rounded-3xl p-6">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.4em] text-tracex-300">TraceX</p>
        <h2 className="text-xl font-semibold text-white">Focus Guardian</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active =
            router.pathname === item.href || (item.href.includes("#") && router.asPath === item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-xl px-4 py-2 text-sm ${
                active ? "bg-tracex-500 text-white" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>{item.label}</span>
              {active ? <span className="chip">Active</span> : null}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto space-y-3 text-xs text-slate-400">
        <p>Safety: No abusive or vulgar content allowed.</p>
        <div className="flex items-center gap-2">
          <span className="chip">Premium</span>
          <span className="chip">Freemium</span>
        </div>
      </div>
    </aside>
  )
}
