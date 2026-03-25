"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "./AppShell";
import Button from "./Button";
import Input from "./Input";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";

// ─── FIREBASE IMPORTS ──────────────────────────────────────────────
import { auth, db } from "@/lib/firebase"; 
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const countryCodes = [
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+1",   flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
];

export default function SignupClient() {
  const [step, setStep] = useState(1);
  const [dialCode, setDialCode] = useState("+91");
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

  // ─── 1. GLOBAL UI STYLING ──────────────────────────────────────────
  // Ensures the "Hacker" Dark Mode is forced during the signup flow
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#030712"; 
    return () => { document.body.style.backgroundColor = originalBg; };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || verifierRef.current) return;
    verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }, []);

  // ─── 2. LOGIC HANDLERS ─────────────────────────────────────────────
  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);
    setPhoneError(value !== digitsOnly && value.length > 0 ? "Numeric characters only." : "");
  }

  async function sendOtp() {
    if (!phone) return setPhoneError("Please enter your phone number.");
    setSending(true);
    try {
      const fullNumber = `${dialCode}${phone}`;
      const result = await signInWithPhoneNumber(auth, fullNumber, verifierRef.current!);
      setConfirmation(result);
      setStep(2);
    } catch (err: any) {
      setPhoneError("Failed to dispatch OTP. Please verify your connection.");
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
      setOtpError("Invalid verification code. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function finishSignup() {
    const user = auth.currentUser;
    if (!user) return;
    try {
      // Generate a sophisticated TraceX ID
      const traceXId = "TRX-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
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
      
      window.location.href = "/home";
    } catch (error) {
      console.error("Critical Database Error:", error);
    }
  }

  // ─── 3. RENDER STEPS ──────────────────────────────────────────────
  
  // STEP 1: Identification
  if (step === 1) {
    return (
      <AppShell>
        <div id="recaptcha-container" ref={recaptchaRef} />
        <PageHeader 
          title="Begin your journey" 
          subtitle="Where chaos turns into clarity." 
        />
        <SectionCard title="Mobile Authentication">
          <div className="flex gap-2">
            <select 
              value={dialCode} 
              onChange={(e) => setDialCode(e.target.value)} 
              className="bg-slate-900 border border-slate-800 rounded-xl px-2 text-white outline-none focus:border-blue-500 transition-all text-sm"
            >
              {countryCodes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
            </select>
            <Input 
              value={phone} 
              placeholder="Enter mobile number" 
              inputMode="numeric" 
              onChange={(e) => handlePhoneChange(e.target.value)} 
            />
          </div>
          {phoneError && <p className="text-red-500 text-[10px] mt-2 ml-1">{phoneError}</p>}
          <Button 
            style={{ marginTop: "16px" }} 
            onClick={sendOtp} 
            disabled={sending}
          >
            {sending ? "Dispatching OTP..." : "Continue"}
          </Button>
        </SectionCard>
      </AppShell>
    );
  }

  // STEP 2: Verification
  if (step === 2) {
    return (
      <AppShell>
        <PageHeader title="Identity Verification" subtitle={`We've sent a secure code to ${dialCode}${phone}`} />
        <SectionCard title="Verification Code">
          <Input 
            value={otp} 
            placeholder="6-digit OTP" 
            maxLength={6} 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
          />
          {otpError && <p className="text-red-500 text-[10px] mt-2 ml-1">{otpError}</p>}
          <div className="flex gap-2 mt-4">
            <Button onClick={verifyOtp} disabled={verifying}>
              {verifying ? "Verifying..." : "Verify Identity"}
            </Button>
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  // STEP 3: Personalization
  return (
    <AppShell>
      <PageHeader title="Personalize your space" subtitle="One final step to finalize your setup." />
      <SectionCard title="Legal Name">
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter your full name" 
        />
      </SectionCard>
      <Button 
        style={{ marginTop: "12px" }} 
        disabled={!name.trim()} 
        onClick={finishSignup}
      >
        Initialize TraceX
      </Button>
    </AppShell>
  );
}