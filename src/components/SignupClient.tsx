"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "./AppShell";
import Button from "./Button";
import Input from "./Input";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";

// ─── IMPORT FROM YOUR CENTRAL FILE ──────────────────────────────────
// This uses your lib/firebase.ts to prevent "App already exists" errors
import { auth, db } from "@/lib/firebase"; 
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const countryCodes = [
  { code: "+1",   flag: "🇺🇸", name: "USA / Canada" },
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
];

export default function SignupClient() {
  const [step, setStep] = useState(1);
  const [dialCode, setDialCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [name, setName] = useState("");

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (verifierRef.current) return;
    verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }, []);

  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);
    setPhoneError(value !== digitsOnly && value.length > 0 ? "Only numbers allowed." : "");
  }

  async function sendOtp() {
    if (!phone) return setPhoneError("Enter phone number.");
    setSending(true);
    try {
      const fullNumber = `${dialCode}${phone}`;
      const result = await signInWithPhoneNumber(auth, fullNumber, verifierRef.current!);
      setConfirmation(result);
      setStep(2);
    } catch (err: any) {
      setPhoneError("Failed to send OTP. Check your Firebase Keys.");
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    if (!otp || !confirmation) return;
    setVerifying(true);
    try {
      await confirmation.confirm(otp);
      setStep(3);
    } catch {
      setOtpError("Incorrect OTP.");
    } finally {
      setVerifying(false);
    }
  }

  // ── SAVE USER DATA TO CLOUD ──
  async function finishSignup() {
    const user = auth.currentUser;
    if (!user) return;
    try {
      // 1. Generate ID (Matches logic in friends.tsx)
      const traceXId = "TRX" + Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // 2. Save to Firestore 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        traceXId: traceXId,
        phone: user.phoneNumber,
        theme: "amoled",
        createdAt: new Date(),
        status: "Online",
        friends: [],
        sentReqs: [],
        receivedReqs: [],
      });
      window.location.href = "/theme";
    } catch (error) {
      console.error("Database Error:", error);
    }
  }

  // ── STEP 1: Phone Number ──
  if (step === 1) {
    return (
      <AppShell>
        <div id="recaptcha-container" ref={recaptchaRef} />
        <PageHeader title="Create account" subtitle="We'll send a code to your mobile." />
        <SectionCard title="Phone Number">
          <div className="flex gap-2">
            <select value={dialCode} onChange={(e) => setDialCode(e.target.value)} className="bg-slate-900 border rounded px-2 text-white">
              {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
            <Input value={phone} placeholder="Mobile number" inputMode="numeric" onChange={(e) => handlePhoneChange(e.target.value)} />
          </div>
          {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          <Button style={{ marginTop: "16px" }} onClick={sendOtp} disabled={sending}>{sending ? "Sending..." : "Send OTP"}</Button>
        </SectionCard>
      </AppShell>
    );
  }

  // ── STEP 2: OTP ──
  if (step === 2) {
    return (
      <AppShell>
        <PageHeader title="Verify number" subtitle={`Sent to ${dialCode}${phone}`} />
        <SectionCard title="Enter OTP">
          <Input value={otp} placeholder="6-digit code" maxLength={6} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
          {otpError && <p className="text-red-500 text-xs mt-1">{otpError}</p>}
          <div className="flex gap-2 mt-4">
            <Button onClick={verifyOtp} disabled={verifying}>{verifying ? "Verifying..." : "Verify"}</Button>
            <Button variant="ghost" onClick={() => setStep(1)}>Change Number</Button>
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  // ── STEP 3: Name ──
  return (
    <AppShell>
      <PageHeader title="One last step 🎉" subtitle="Tell us your name to finish." />
      <SectionCard title="Full Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
      </SectionCard>
      <Button style={{ marginTop: "12px" }} disabled={!name.trim()} onClick={finishSignup}>Create Account</Button>
    </AppShell>
  );
}