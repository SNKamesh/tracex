"use client";

import { useState, useMemo } from "react";
import AppShell from "./AppShell";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import Toggle from "./Toggle";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";

const userTypes = [
  "School",
  "University",
  "Competitive",
  "Self-learner",
  "Coaching",
  "Other",
];

export default function SignupClient() {
  const [name, setName] = useState("");
  const [userType, setUserType] = useState(userTypes[0]);
  const [otp, setOtp] = useState("");
  const [passkey, setPasskey] = useState(false);
  const [accept, setAccept] = useState(false);

  // Auto TraceX ID
  const traceId = useMemo(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 10 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
  }, []);

  return (
    <AppShell>
      <PageHeader title="Sign Up" subtitle="Create your TraceX account." />

      {/* OTP Verification */}
      <SectionCard
        title="OTP Verification"
        description="Secure login & device verification."
      >
        <div className="grid gap-3 md:grid-cols-2">

          {/* FIXED TYPE HERE */}
          <Input
            value={otp}
            placeholder="Enter OTP"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setOtp(e.target.value)
            }
          />

          <Toggle
            checked={passkey}
            onChange={setPasskey}
            label="Use Passkey/Biometrics"
          />
        </div>
      </SectionCard>

      {/* Profile Details */}
      <SectionCard
        title="Profile Details"
        description="Personalize your learning account."
      >
        <div className="grid gap-3 md:grid-cols-2">

          {/* FIXED TYPE HERE */}
          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />

          {/* FIXED TYPE HERE */}
          <Select
            value={userType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setUserType(e.target.value)
            }
          >
            {userTypes.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </div>

        <div className="flex justify-between mt-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3">
          <div>
            <p className="font-semibold text-white">TraceX ID</p>
            <p className="text-xs text-slate-400">{traceId}</p>
          </div>
          <span className="chip">Auto-generated</span>
        </div>
      </SectionCard>

      {/* Safety */}
      <SectionCard title="Safety" description="Required to use TraceX.">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-300">
            No abusive/vulgar content allowed.
          </p>

          <Toggle checked={accept} onChange={setAccept} label="Accept" />
        </div>
      </SectionCard>

      <Button disabled={!accept || !otp || !name}>Create Account</Button>
    </AppShell>
  );
}