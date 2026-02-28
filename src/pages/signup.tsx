import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";

enum SignupStep {
  Start = 1,
  Phone = 2,
  OTP = 3,
  Profile = 4,
  Safety = 5,
  Email = 10,
  EmailOTP = 11,
}

async function authRequest(payload: {
  action: "send_otp" | "verify_otp";
  channel: "phone" | "email";
  target: string;
  otp?: string;
}) {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed");
  }

  return data;
}

export default function Signup() {
  const [step, setStep] = useState<SignupStep>(SignupStep.Start);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phoneValid = /^\+[0-9]{7,15}$/.test(phone);
  const emailValid = /^[^@]+@[^@]+\.[^@]+$/.test(email);

  async function handleSendOtp(channel: "phone" | "email", target: string, nextStep: SignupStep) {
    setLoading(true);
    setError(null);
    setNotice(null);
    setOtp("");

    try {
      await authRequest({ action: "send_otp", channel, target });
      setNotice(`OTP sent to ${target}`);
      setStep(nextStep);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(channel: "phone" | "email", target: string) {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      await authRequest({ action: "verify_otp", channel, target, otp });
      setNotice("OTP verified successfully");
      setStep(SignupStep.Profile);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg">
        {notice && <p className="mb-4 rounded-md bg-emerald-900/30 border border-emerald-700 px-3 py-2 text-sm">{notice}</p>}
        {error && <p className="mb-4 rounded-md bg-red-900/30 border border-red-700 px-3 py-2 text-sm">{error}</p>}

        {step === SignupStep.Start && (
          <>
            <h1 className="text-center text-4xl font-bold mb-6">
              Welcome to <span className="text-cyan-400">TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-10">Your ultimate study companion</p>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setStep(SignupStep.Email)}>Continue with Email</Button>
              <Button variant="secondary" onClick={() => setStep(SignupStep.Phone)}>
                Continue with Phone
              </Button>
              <Button variant="secondary">Continue with Apple</Button>
              <Button variant="secondary">Continue with Facebook</Button>
              <p className="text-center mt-4 cursor-pointer text-slate-400" onClick={() => setStep(SignupStep.Phone)}>
                Create a full TraceX account
              </p>
            </div>
          </>
        )}

        {step === SignupStep.Phone && (
          <SectionCard title="Phone Number" description="Enter your number to receive OTP">
            <Input placeholder="+91XXXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />

            {!phoneValid && phone.length > 0 && (
              <p className="text-red-400 text-xs mt-1">Only international format allowed. Example: +919876543210</p>
            )}

            <Button
              className="mt-4"
              disabled={!phoneValid || loading}
              onClick={() => handleSendOtp("phone", phone, SignupStep.OTP)}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </SectionCard>
        )}

        {step === SignupStep.OTP && (
          <SectionCard title="Verify OTP" description={`OTP sent to ${phone}`}>
            <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Button
              className="mt-4"
              disabled={otp.length < 6 || loading}
              onClick={() => handleVerifyOtp("phone", phone)}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </SectionCard>
        )}

        {step === SignupStep.Profile && (
          <SectionCard title="Profile Details" description="Tell us about yourself">
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />

            <Button className="mt-4" disabled={!name} onClick={() => setStep(SignupStep.Safety)}>
              Continue
            </Button>
          </SectionCard>
        )}

        {step === SignupStep.Safety && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">
              No harmful, abusive, or vulgar content. Violations lead to immediate suspension.
            </p>

            <Button className="mt-4">I Accept</Button>
          </SectionCard>
        )}

        {step === SignupStep.Email && (
          <SectionCard title="Email Login" description="Enter your email">
            <Input placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />

            <Button
              className="mt-4"
              disabled={!emailValid || loading}
              onClick={() => handleSendOtp("email", email, SignupStep.EmailOTP)}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </SectionCard>
        )}

        {step === SignupStep.EmailOTP && (
          <SectionCard title="Verify Email OTP">
            <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />

            <Button
              className="mt-4"
              disabled={otp.length < 6 || loading}
              onClick={() => handleVerifyOtp("email", email)}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </SectionCard>
        )}
      </div>
    </div>
  );
}