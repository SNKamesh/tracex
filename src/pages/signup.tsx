import { useState } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";

export default function Signup() {
  const [step, setStep] = useState(1 as 1 | 2 | 3 | 4 | 5 | 10 | 11);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  const phoneValid = /^\+[0-9]{7,15}$/.test(phone);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h1 className="text-center text-4xl font-bold mb-6">
              Welcome to <span className="text-cyan-400">TraceX</span>
            </h1>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setStep(10)}>Continue with Email</Button>
              <Button variant="secondary" onClick={() => setStep(2)}>
                Continue with Phone
              </Button>
              <Button variant="secondary">Continue with Apple</Button>
              <Button variant="secondary">Continue with Facebook</Button>
            </div>

            <p
              className="text-center mt-4 cursor-pointer text-slate-400"
              onClick={() => setStep(2)}
            >
              Create a full TraceX account
            </p>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <SectionCard title="Phone Number" description="Enter your number to get OTP">
            <Input
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {!phoneValid && phone.length > 0 && (
              <p className="text-red-400 text-xs mt-1">
                Only international format allowed. Example: +919876543210
              </p>
            )}

            <Button
              className="mt-4"
              disabled={!phoneValid}
              onClick={() => setStep(3)}
            >
              Send OTP
            </Button>
          </SectionCard>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <SectionCard title="Enter OTP" description={`OTP sent to ${phone}`}>
            <Input
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button
              className="mt-4"
              disabled={otp.length < 6}
              onClick={() => setStep(4)}
            >
              Verify OTP
            </Button>
          </SectionCard>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <SectionCard title="Profile Details" description="Tell us about yourself">
            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Button
              className="mt-4"
              disabled={!name}
              onClick={() => setStep(5)}
            >
              Continue
            </Button>
          </SectionCard>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">
              No harmful, abusive, or vulgar content allowed.
            </p>

            <Button className="mt-4">I Accept</Button>
          </SectionCard>
        )}

        {/* STEP 10 — EMAIL */}
        {step === 10 && (
          <SectionCard title="Email Login" description="Enter your email">
            <Input
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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