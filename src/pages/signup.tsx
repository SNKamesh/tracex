"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";
import Select from "@/components/Select";

// ─── Firebase ─────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

// 🔴 Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// ─── Country codes ─────────────────────────────────────────────────────────────
const countryCodes = [
  { code: "+1",   flag: "🇺🇸" },
  { code: "+44",  flag: "🇬🇧" },
  { code: "+91",  flag: "🇮🇳" },
  { code: "+61",  flag: "🇦🇺" },
  { code: "+49",  flag: "🇩🇪" },
  { code: "+33",  flag: "🇫🇷" },
  { code: "+81",  flag: "🇯🇵" },
  { code: "+86",  flag: "🇨🇳" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+966", flag: "🇸🇦" },
  { code: "+65",  flag: "🇸🇬" },
  { code: "+60",  flag: "🇲🇾" },
  { code: "+27",  flag: "🇿🇦" },
  { code: "+234", flag: "🇳🇬" },
  { code: "+55",  flag: "🇧🇷" },
  { code: "+52",  flag: "🇲🇽" },
  { code: "+7",   flag: "🇷🇺" },
  { code: "+82",  flag: "🇰🇷" },
  { code: "+39",  flag: "🇮🇹" },
  { code: "+34",  flag: "🇪🇸" },
];

enum Step {
  Start   = 1,
  Phone   = 2,
  OTP     = 3,
  Profile = 4,
  Safety  = 5,
}

const studyOptions = ["School", "University", "College", "Other"];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(Step.Start);

  // Phone
  const [dialCode, setDialCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // OTP
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Profile
  const [name, setName] = useState("");
  const [studyType, setStudyType] = useState(studyOptions[0]);

  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (verifierRef.current) return;
    verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }, []);

  // ── Phone validation ───────────────────────────────────────────────
  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);
    if (value !== digitsOnly && value.length > 0) {
      setPhoneError("Only numbers are allowed (0–9).");
    } else {
      setPhoneError("");
    }
  }

  // ── Send OTP ───────────────────────────────────────────────────────
  async function sendOtp() {
    if (!phone) { setPhoneError("Please enter your phone number."); return; }
    if (!/^\d+$/.test(phone)) { setPhoneError("Only numbers are allowed (0–9)."); return; }
    setSending(true);
    setPhoneError("");
    try {
      const result = await signInWithPhoneNumber(auth, `${dialCode}${phone}`, verifierRef.current!);
      setConfirmation(result);
      setStep(Step.OTP);
    } catch (err: any) {
      setPhoneError(
        err?.message?.includes("invalid-phone-number")
          ? "Invalid phone number. Check country code and digits."
          : "Failed to send OTP. Please try again."
      );
      verifierRef.current?.render().then((id: number) => (window as any).grecaptcha?.reset(id));
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
      setStep(Step.Profile);
    } catch {
      setOtpError("Incorrect OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  // ── Save profile ───────────────────────────────────────────────────
  function saveProfile() {
    localStorage.setItem("tracex:onboarding", JSON.stringify({ name, studyType }));
    setStep(Step.Safety);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-lg">

        {/* ── STEP 1: Start ─────────────────────────────────────────── */}
        {step === Step.Start && (
          <>
            <h1 className="text-center text-4xl font-bold mb-2">
              Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-10">
              Sign in / Create a new account
            </p>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setStep(Step.Phone)}>Continue with Email</Button>
              <Button variant="secondary" onClick={() => setStep(Step.Phone)}>
                Continue with Apple
              </Button>
              <Button variant="secondary" onClick={() => setStep(Step.Phone)}>
                Continue with Facebook
              </Button>
              <p
                className="text-center mt-4 cursor-pointer text-slate-400 hover:text-white transition"
                onClick={() => setStep(Step.Phone)}
              >
                Create a full TraceX account
              </p>
            </div>
          </>
        )}

        {/* ── STEP 2: Phone ─────────────────────────────────────────── */}
        {step === Step.Phone && (
          <SectionCard
            title="Enter your mobile number"
            description="We'll send a one-time code to verify your number."
          >
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

            {phoneError && (
              <p className="mt-1 text-xs text-red-500 font-medium">{phoneError}</p>
            )}

            <Button
              className="mt-4 w-full"
              onClick={sendOtp}
              disabled={!phone || !!phoneError || sending}
            >
              {sending ? "Sending OTP…" : "Send OTP"}
            </Button>
          </SectionCard>
        )}

        {/* ── STEP 3: OTP ───────────────────────────────────────────── */}
        {step === Step.OTP && (
          <SectionCard
            title="Verify OTP"
            description={`Enter the 6-digit code sent to ${dialCode} ${phone}`}
          >
            <Input
              value={otp}
              placeholder="6-digit code"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setOtpError("");
              }}
              className={otpError ? "border-red-500" : ""}
            />

            {otpError && (
              <p className="mt-1 text-xs text-red-500 font-medium">{otpError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <Button onClick={verifyOtp} disabled={otp.length < 6 || verifying}>
                {verifying ? "Verifying…" : "Verify OTP"}
              </Button>
              <Button variant="ghost" onClick={() => { setStep(Step.Phone); setOtp(""); setOtpError(""); }}>
                ← Change number
              </Button>
            </div>
          </SectionCard>
        )}

        {/* ── STEP 4: Profile ───────────────────────────────────────── */}
        {step === Step.Profile && (
          <SectionCard title="Profile Details" description="Tell us about yourself">
            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="mt-4 mb-2 block text-sm text-slate-300">
              Where are you studying?
            </label>
            <Select
              className="w-full rounded-lg px-4 py-2 bg-slate-900 border border-slate-700 text-white"
              value={studyType}
              onChange={(e) => setStudyType(e.target.value)}
            >
              {studyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>

            <Button className="mt-4" disabled={!name.trim()} onClick={saveProfile}>
              Continue
            </Button>
          </SectionCard>
        )}

        {/* ── STEP 5: Safety ────────────────────────────────────────── */}
        {step === Step.Safety && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">
              No harmful, abusive, or vulgar content. Violations lead to immediate suspension.
            </p>
            <Button className="mt-4" onClick={() => router.push("/theme")}>
              I Accept
            </Button>
          </SectionCard>
        )}

      </div>
    </div>
  );
}