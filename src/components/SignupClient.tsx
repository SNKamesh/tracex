"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "./AppShell";
import Button from "./Button";
import Input from "./Input";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";

// ─── FIREBASE & FIRESTORE IMPORTS ──────────────────────────────────
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

  // ─── 1. FORCE DARK THEME (Strictly Forced for Welcome Page) ──────
  useEffect(() => {
    // This locks the root background to black immediately
    document.documentElement.style.backgroundColor = "#030712";
    document.body.style.backgroundColor = "#030712";
    
    return () => {
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || verifierRef.current) return;
    verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }, []);

  // ─── 2. LOGIC HANDLERS ───────────────────────────────────────────
  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);
    setPhoneError(value !== digitsOnly && value.length > 0 ? "Numeric characters only." : "");
  }

  async function sendOtp() {
    if (!phone) return setPhoneError("Please enter your mobile number.");
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

  // ─── 3. STEPS RENDERING ──────────────────────────────────────────

  // STEP 1: Phone Entry (Includes Anime Mascot)
  if (step === 1) {
    return (
      <AppShell>
        <div id="recaptcha-container" ref={recaptchaRef} />
        
        {/* ─── ANIME MASCOT: WELCOME PAGE ONLY ─── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ position: "relative", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            
            {/* 1. Headset (Blue Arch) */}
            <div style={{ 
              position: "absolute", top: "-5px", width: "50px", height: "35px", 
              borderTop: "4px solid #3B82F6", borderLeft: "4px solid #3B82F6", 
              borderRight: "4px solid #3B82F6", borderRadius: "25px 25px 0 0",
              boxShadow: "0 -4px 15px rgba(59, 130, 246, 0.4)"
            }} />

            {/* 2. Anime X (The Body) */}
            <span style={{ 
              fontSize: "52px", fontWeight: 900, color: "#3B82F6", 
              fontStyle: "italic", zIndex: 10, textShadow: "0 0 15px rgba(59, 130, 246, 0.5)" 
            }}>X</span>

            {/* 3. White Glove Hand Holding Book */}
            <div style={{ 
              position: "absolute", right: "-12px", bottom: "20px", zIndex: 20, 
              width: "28px", height: "20px", backgroundColor: "#FFFFFF", 
              border: "1px solid #cbd5e1", borderRadius: "5px", transform: "rotate(-12deg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
            }}>
              {/* Glove Stitches */}
              <div style={{ position: "absolute", top: "4px", left: "7px", width: "1px", height: "8px", backgroundColor: "#e2e8f0" }} />
              <div style={{ position: "absolute", top: "4px", left: "13px", width: "1px", height: "8px", backgroundColor: "#e2e8f0" }} />
              <div style={{ position: "absolute", top: "4px", left: "19px", width: "1px", height: "8px", backgroundColor: "#e2e8f0" }} />
              
              {/* The Study Book */}
              <span style={{ position: "absolute", top: "-12px", right: "-6px", fontSize: "20px" }}>📖</span>
            </div>

            {/* 4. Chunky Sneakers (Legs) */}
            <div style={{ position: "absolute", bottom: "0", width: "100%", display: "flex", justifyContent: "space-between", padding: "0 10px" }}>
              <div style={{ width: "22px", height: "12px", backgroundColor: "#3B82F6", borderRadius: "6px", borderBottom: "3px solid rgba(255,255,255,0.4)" }} />
              <div style={{ width: "22px", height: "12px", backgroundColor: "#3B82F6", borderRadius: "6px", borderBottom: "3px solid rgba(255,255,255,0.4)" }} />
            </div>
          </div>
          
          <PageHeader 
            title="Begin your journey" 
            subtitle="Where chaos turns into clarity." 
          />
        </div>

        <SectionCard title="Identity Setup">
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

  // STEP 2: OTP Verification
  if (step === 2) {
    return (
      <AppShell>
        <PageHeader title="Secure Access" subtitle={`A verification code was dispatched to ${dialCode}${phone}`} />
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
              {verifying ? "Verifying Identity..." : "Verify Identity"}
            </Button>
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  // STEP 3: Final Personalization
  return (
    <AppShell>
      <PageHeader title="Personalize your workspace" subtitle="Finalize your identity to initialize the protocol." />
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