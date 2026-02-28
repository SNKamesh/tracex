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
export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState(SignupStep.Start);

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
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 px-4">
      {notice && <p className="mb-4 rounded-md bg-emerald-900/30 border border-emerald-700 px-3 py-2 text-sm text-green-400">{notice}</p>}
      {error && <p className="mb-4 rounded-md bg-emerald-900/30 border border-emerald-700 px-3 py-2 text-sm text-green-400">{error}</p>}
      <div>
        Welcome to <span className="text-green-400">TraceX</span>
      </div>
      <p className="text-center text-green-400 mb-10">Your ultimate study companion</p>
      <Button onClick={() => setStep(SignupStep.Email)}>Continue with Email</Button>
      <Button variant="secondary" onClick={() => setStep(SignupStep.Phone)}></Button>
      <p className="text-center mt-4 cursor-pointer text-green-400" onClick={() => setStep(SignupStep.Phone)}></p>
      <SectionCard title="Phone Number" description="Enter your number to receive OTP">
        <Input placeholder="+91XXXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <p className="text-green-400 text-xs mt-1">Only international format allowed. Example: +919876543210</p>
        <Button disabled={phone.length === 0 || loading} onClick={() => handleSendOtp("phone", phone, SignupStep.OTP)}>{loading ? "Sending..." : "Send OTP"}</Button>
      </SectionCard>
      <SectionCard title="Verify OTP" description={`OTP sent to ${phone}`}>
        <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <Button disabled={otp.length < 6 || loading} onClick={() => handleVerifyOtp("phone", phone)}>Verify OTP</Button>
      </SectionCard>
      <SectionCard title="Profile Details" description="Tell us about yourself">
        <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button className="mt-4" disabled={!name} onClick={() => setStep(SignupStep.Safety)}>Continue</Button>
      </SectionCard>
      <SectionCard title="Safety First" description="Accept to continue">
        <p className="text-sm text-green-400 mb-4">
          No harmful, abusive, or vulgar content. Violations lead to immediate suspension.
        </p>
        <Button onClick={() => setStep(SignupStep.Email)}>I Agree</Button>
      </SectionCard>
      <SectionCard title="Email" description="Enter your email to continue">
        <Input placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button disabled={email.length === 0 || loading} onClick={() => handleSendOtp("email", email, SignupStep.EmailOTP)}>{loading ? "Sending..." : "Send OTP"}</Button>
      </SectionCard>
      <SectionCard title="Verify Email OTP" description={`OTP sent to ${email}`}>
        <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
        <Button disabled={otp.length < 6 || loading} onClick={() => handleVerifyOtp("email", email)}>{loading ? "Verifying..." : "Verify OTP"}</Button>
      </SectionCard>
    </div>
  );
}
