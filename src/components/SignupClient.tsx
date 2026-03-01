"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "./AppShell";
import Button from "./Button";
import Input from "./Input";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";

// ─── Firebase imports ───────────────────────────────────────────────
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

// ────────────────────────────────────────────────────────────────────
// 🔴 REPLACE these values with your Firebase project credentials
// Firebase Console → Project Settings → Your apps → SDK setup
// ────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Init Firebase only once
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// ─── Country dial codes ──────────────────────────────────────────────
const countryCodes = [
  { code: "+1",   flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44",  flag: "🇬🇧", name: "UK" },
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+61",  flag: "🇦🇺", name: "Australia" },
  { code: "+49",  flag: "🇩🇪", name: "Germany" },
  { code: "+33",  flag: "🇫🇷", name: "France" },
  { code: "+81",  flag: "🇯🇵", name: "Japan" },
  { code: "+86",  flag: "🇨🇳", name: "China" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia" },
  { code: "+27",  flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+55",  flag: "🇧🇷", name: "Brazil" },
  { code: "+52",  flag: "🇲🇽", name: "Mexico" },
  { code: "+7",   flag: "🇷🇺", name: "Russia" },
  { code: "+82",  flag: "🇰🇷", name: "South Korea" },
  { code: "+39",  flag: "🇮🇹", name: "Italy" },
  { code: "+34",  flag: "🇪🇸", name: "Spain" },
];

// ────────────────────────────────────────────────────────────────────

export default function SignupClient() {
  const [step, setStep] = useState(1);

  // Step 1
  const [dialCode, setDialCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // Step 2
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Step 3
  const [name, setName] = useState("");

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  // Set up invisible reCAPTCHA on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (verifierRef.current) return;

    verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }, []);

  // ── Phone validation: only digits allowed ──────────────────────────
  function handlePhoneChange(value: string) {
    // Strip everything except digits
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);

    if (value !== digitsOnly && value.length > 0) {
      setPhoneError("Only numbers are allowed (0–9).");
    } else {
      setPhoneError("");
    }
  }

  // ── Send OTP via Firebase ──────────────────────────────────────────
  async function sendOtp() {
    if (!phone) {
      setPhoneError("Please enter your phone number.");
      return;
    }
    if (!/^\d+$/.test(phone)) {
      setPhoneError("Only numbers are allowed (0–9).");
      return;
    }

    setSending(true);
    setPhoneError("");

    try {
      const fullNumber = `${dialCode}${phone}`;
      const result = await signInWithPhoneNumber(
        auth,
        fullNumber,
        verifierRef.current!
      );
      setConfirmation(result);
      setStep(2);
    } catch (err: any) {
      setPhoneError(
        err?.message?.includes("invalid-phone-number")
          ? "Invalid phone number. Check country code and digits."
          : "Failed to send OTP. Please try again."
      );
      // Reset reCAPTCHA on error
      verifierRef.current?.render().then((id) =>
        (window as any).grecaptcha?.reset(id)
      );
    } finally {
      setSending(false);
    }
  }

  // ── Verify OTP ─────────────────────────────────────────────────────
  async function verifyOtp() {
    if (!otp || !confirmation) return;
    setVerifying(true);
    setOtpError("");

    try {
      await confirmation.confirm(otp);
      setStep(3);
    } catch {
      setOtpError("Incorrect OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  // ── STEP 1 — Phone Number ──────────────────────────────────────────
  if (step === 1) {
    return (
      <AppShell>
        {/* Invisible reCAPTCHA anchor */}
        <div id="recaptcha-container" ref={recaptchaRef} />

        <PageHeader
          title="Create your TraceX account"
          subtitle="We'll send a one-time code to your mobile number."
        />

        <SectionCard
          title="Enter your phone number"
          description="Include your country code. Only digits (0–9) accepted."
        >
          {/* Country code + number row */}
          <div className="flex gap-2">
            <select
              value={dialCode}
              onChange={(e) => setDialCode(e.target.value)}
              className="rounded-lg px-3 py-2 bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 text-sm shrink-0"
            >
              {countryCodes.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>

            <Input
              value={phone}
              placeholder="Mobile number"
              inputMode="numeric"
              maxLength={15}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={phoneError ? "border-red-500" : ""}
            />
          </div>

          {/* Red validation message */}
          {phoneError && (
            <p className="mt-1 text-xs text-red-500 font-medium">{phoneError}</p>
          )}

          <Button
            style={{ marginTop: "16px" }}
            onClick={sendOtp}
            disabled={!phone || !!phoneError || sending}
          >
            {sending ? "Sending OTP…" : "Send OTP"}
          </Button>
        </SectionCard>
      </AppShell>
    );
  }

  // ── STEP 2 — OTP Verification ──────────────────────────────────────
  if (step === 2) {
    return (
      <AppShell>
        <PageHeader
          title="Verify your number"
          subtitle={`OTP sent to ${dialCode} ${phone}`}
        />

        <SectionCard
          title="Enter OTP"
          description="Check your SMS for the 6-digit code."
        >
          <Input
            value={otp}
            placeholder="6-digit code"
            inputMode="numeric"
            maxLength={6}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              setOtp(v);
              setOtpError("");
            }}
            className={otpError ? "border-red-500" : ""}
          />

          {otpError && (
            <p className="mt-1 text-xs text-red-500 font-medium">{otpError}</p>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              onClick={verifyOtp}
              disabled={otp.length < 6 || verifying}
            >
              {verifying ? "Verifying…" : "Verify OTP"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                setStep(1);
                setOtp("");
                setOtpError("");
              }}
            >
              ← Change number
            </Button>
          </div>
        </SectionCard>
      </AppShell>
    );
  }

  // ── STEP 3 — Profile Setup ─────────────────────────────────────────
  return (
    <AppShell>
      <PageHeader
        title="One last step 🎉"
        subtitle="Tell us your name to finish setting up."
      />

      <SectionCard title="Full Name">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />
      </SectionCard>

      <Button
        style={{ marginTop: "12px" }}
        disabled={!name.trim()}
        onClick={() => {
          localStorage.setItem(
            "tracex:onboarding",
            JSON.stringify({ name })
          );
          window.location.href = "/theme";
        }}
      >
        Create Account
      </Button>
    </AppShell>
  );
}