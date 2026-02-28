"use client";

import { useState } from "react";
import AppShell from "./AppShell";
import Button from "./Button";
import Input from "./Input";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";

export default function SignupClient() {
  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  // -------------------------------------
  // STEP 1 — Phone Number
  // -------------------------------------
  if (step === 1) {
    return (
      <AppShell>
        <PageHeader
          title="Create your TraceX account"
          subtitle="Secure and fast onboarding"
        />

        <SectionCard title="Enter your phone number">
          <Input
            value={phone}
            placeholder="Phone number"
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            style={{ marginTop: "12px" }}
            onClick={() => setStep(2)}
            disabled={!phone}
          >
            Continue
          </Button>
        </SectionCard>

        <Button variant="secondary" style={{ marginTop: "12px" }}>
          Continue with Email
        </Button>
      </AppShell>
    );
  }

  // -------------------------------------
  // STEP 2 — OTP Verification
  // -------------------------------------
  if (step === 2) {
    return (
      <AppShell>
        <PageHeader
          title="Verify OTP"
          subtitle={`Code sent to ${phone}`}
        />

        <SectionCard title="Enter OTP">
          <Input
            value={otp}
            placeholder="123456"
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button
            style={{ marginTop: "12px" }}
            onClick={() => setStep(3)}
            disabled={!otp}
          >
            Verify OTP
          </Button>
        </SectionCard>
      </AppShell>
    );
  }

  // -------------------------------------
  // STEP 3 — Profile Setup
  // -------------------------------------
  return (
    <AppShell>
      <PageHeader
        title="Profile Details"
        subtitle="Finish setting up your account"
      />

      <SectionCard title="Full Name">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
      </SectionCard>

      <Button
        style={{ marginTop: "12px" }}
        disabled={!name}
      >
        Create Account
      </Button>
    </AppShell>
  );
}