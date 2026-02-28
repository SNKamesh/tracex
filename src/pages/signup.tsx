import { useMemo, useState } from "react"
import Link from "next/link"
import AppShell from "@/components/AppShell"
import Button from "@/components/Button"
import Input from "@/components/Input"
import Select from "@/components/Select"
import Toggle from "@/components/Toggle"
import PageHeader from "@/components/PageHeader"
import SectionCard from "@/components/SectionCard"

const userTypes = [
  "School",
  "University",
  "Competitive",
  "Self-learner",
  "Coaching",
  "Other"
]

export default function Signup() {
  const [name, setName] = useState("")
  const [userType, setUserType] = useState(userTypes[0])
  const [otp, setOtp] = useState("")
  const [passkey, setPasskey] = useState(false)
  const [accept, setAccept] = useState(false)

  const traceId = useMemo(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return Array.from({ length: 10 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("")
  }, [])

  return (
    <AppShell>
      <PageHeader title="Sign Up" subtitle="Create your TraceX profile and secure access." />
      <SectionCard
        title="OTP + Passkey"
        description="Verify your device and enable biometrics or passkey login."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="OTP code" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <Toggle checked={passkey} onChange={setPasskey} label="Enable Passkey/Biometrics" />
        </div>
      </SectionCard>
      <SectionCard title="Profile Details" description="Personalize your learning journey.">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select value={userType} onChange={(e) => setUserType(e.target.value)}>
            {userTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">TraceX ID</p>
            <p className="text-xs text-slate-400">{traceId}</p>
          </div>
          <span className="chip">Auto-generated</span>
        </div>
      </SectionCard>
      <SectionCard title="Safety Disclaimer" description="You must accept the safety rules.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-300">No abusive/vulgar content allowed.</p>
          <Toggle checked={accept} onChange={setAccept} label="I Accept" />
        </div>
      </SectionCard>
      <div className="flex flex-wrap items-center gap-4">
        <Button disabled={!accept || !otp || !name}>Create TraceX Account</Button>
        <Link href="/theme" className="text-sm text-tracex-200">
          Continue to theme selection
        </Link>
      </div>
    </AppShell>
  )
}
