"use client"; // safe for pages router too

import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";
import PageHeader from "@/components/PageHeader";

export default function Signup() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 10 | 11>(1);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  const phoneValid = /^\+[0-9]{7,15}$/.test(phone);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg">

        {/* STEP 1 — LOGIN METHODS */}
        {step === 1 && (
          <>
            <h1 className="text-center text-4xl font-bold mb-6">
              Welcome to <span className="text-cyan-400">TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-10">
              Your ultimate study companion.
            </p>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setStep(10)}>Continue with Email</Button>
              <Button variant="secondary" onClick={() => setStep(2)}>
                Continue with Phone
              </Button>
              <Button variant="secondary">Continue with Apple</Button>
              <Button variant="secondary">Continue with Facebook</Button>

              <p
                className="text-center mt-4 cursor-pointer text-slate-400 hover:text-white"
                onClick={() => setStep(2)}
              >
                Create a full TraceX account
              </p>
            </div>
          </>
        )}

        {/* STEP 2 — PHONE ENTRY */}
        {step === 2 && (
          <SectionCard title="Phone Number" description="Enter your number">
            <Input
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
            />

            {phone && !phoneValid && (
              <p className="text-red-400 text-xs mt-1">
                Use international format. Example: +919876543210
              </p>
            )}

            <Button
              className="mt-4"
              disabled={!phoneValid}
              onClick={() => {
                setOtp("");
                setStep(3);
              }}
            >
              Send OTP
            </Button>
          </SectionCard>
        )}

        {/* STEP 3 — OTP */}
        {step === 3 && (
          <SectionCard
            title="Verify OTP"
            description={`Code sent to ${phone}`}
          >
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOtp(e.target.value)
              }
            />

            <Button
              className="mt-4"
              disabled={otp.length < 6}
              onClick={() => setStep(4)}
            >
              Verify
            </Button>
          </SectionCard>
        )}

        {/* STEP 4 — PROFILE DETAILS */}
        {step === 4 && (
          <SectionCard
            title="Your Profile"
            description="Tell us about yourself"
          >
            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
            />

            <Button className="mt-4" disabled={!name} onClick={() => setStep(5)}>
              Continue
            </Button>
          </SectionCard>
        )}

        {/* STEP 5 — SAFETY */}
        {step === 5 && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">
              No harmful or abusive content. Violations result in
              immediate suspension.
            </p>

            <Button className="mt-4">I Accept</Button>
          </SectionCard>
        )}

        {/* STEP 10 — EMAIL */}
        {step === 10 && (
          <SectionCard title="Email Login" description="Enter your email">
            <Input
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />

            <Button
              className="mt-4"
              disabled={!email.includes("@")}
              onClick={() => setStep(11)}
            >
              Send OTP
            </Button>
          </SectionCard>
        )}

        {/* STEP 11 — EMAIL OTP */}
        {step === 11 && (
          <SectionCard title="Verify Email OTP">
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setOtp(e.target.value)
              }
            />
            <Button
              className="mt-4"
              disabled={otp.length < 6}
              onClick={() => setStep(4)}
            >
              Verify Email
            </Button>
          </SectionCard>
        )}

      </div>
    </div>
  );
}