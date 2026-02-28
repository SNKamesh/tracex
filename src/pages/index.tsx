import Link from "next/link"
import Button from "@/components/Button"

export default function Welcome() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.5em] text-slate-400">TraceX</p>
          <h1 className="text-4xl font-semibold">Welcome to TraceX</h1>
          <p className="text-sm text-slate-400">
            Focus guardian for study sessions, sync, blockers, and analytics.
          </p>
        </div>
        <div className="grid w-full gap-3">
          <Button>Continue with Email</Button>
          <Button variant="secondary">Continue with Phone</Button>
          <Button variant="secondary">Continue with Apple</Button>
          <Button variant="secondary">Continue with Facebook</Button>
        </div>
        <Link href="/signup" className="text-sm text-tracex-300 hover:text-tracex-100">
          Create a full TraceX account
        </Link>
      </div>
    </div>
  )
}
