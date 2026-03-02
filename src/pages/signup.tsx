"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SectionCard from "@/components/SectionCard";
import Select from "@/components/Select";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

// ─── Firebase config ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseAuth() {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    return getAuth(app);
  } catch {
    return null;
  }
}

// ─── EmailJS OTP sender ────────────────────────────────────────────────────────
// 🔴 Replace with your EmailJS credentials from emailjs.com (free)
const EMAILJS_SERVICE_ID  = "service_ri49ei2";
const EMAILJS_TEMPLATE_ID = "sk378id";
const EMAILJS_PUBLIC_KEY  = "qsOgPP31asLWMeneB";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: toEmail,
          otp_code: otp,
          app_name: "TraceX",
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Steps ────────────────────────────────────────────────────────────────────
type Step = "start" | "signin" | "create_form" | "create_otp" | "profile" | "safety";

const studyOptions = ["School", "University", "College", "Other"];

function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");

  // Sign in state
  const [siEmail, setSiEmail]       = useState("");
  const [siPass, setSiPass]         = useState("");
  const [siEmailErr, setSiEmailErr] = useState("");
  const [siPassErr, setSiPassErr]   = useState("");
  const [siLoading, setSiLoading]   = useState(false);

  // Create account state
  const [caEmail, setCaEmail]       = useState("");
  const [caPass, setCaPass]         = useState("");
  const [caPass2, setCaPass2]       = useState("");
  const [caEmailErr, setCaEmailErr] = useState("");
  const [caPassErr, setCaPassErr]   = useState("");
  const [caLoading, setCaLoading]   = useState(false);

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp]     = useState("");
  const [otpErr, setOtpErr]             = useState("");
  const [otpLoading, setOtpLoading]     = useState(false);
  const [otpTimer, setOtpTimer]         = useState(60);
  const [canResend, setCanResend]       = useState(false);

  // Profile state
  const [name, setName]           = useState("");
  const [studyType, setStudyType] = useState(studyOptions[0]);

  // OTP countdown timer
  useEffect(() => {
    if (step !== "create_otp") return;
    setOtpTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // ── SIGN IN ────────────────────────────────────────────────────────────────
  async function handleSignIn() {
    setSiEmailErr("");
    setSiPassErr("");

    if (!siEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siEmail)) {
      setSiEmailErr("Enter a valid email address.");
      return;
    }
    if (!siPass) {
      setSiPassErr("Enter your password.");
      return;
    }

    setSiLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not ready");

      // Check if account exists first
      const methods = await fetchSignInMethodsForEmail(auth, siEmail);
      if (methods.length === 0) {
        setSiEmailErr("Account doesn't exist. Please create a TraceX account first.");
        setSiLoading(false);
        return;
      }

      // Account exists — try signing in
      await signInWithEmailAndPassword(auth, siEmail, siPass);
      router.push("/home");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        setSiEmailErr("Account doesn't exist. Please create a TraceX account first.");
      } else if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-login-credentials"
      ) {
        setSiPassErr("Invalid password.");
      } else if (code === "auth/too-many-requests") {
        setSiPassErr("Too many attempts. Try again later.");
      } else {
        setSiPassErr("Sign in failed. Please try again.");
      }
    } finally {
      setSiLoading(false);
    }
  }

  // ── CREATE — validate then send OTP ───────────────────────────────────────
  async function handleSendOtp() {
    setCaEmailErr("");
    setCaPassErr("");

    if (!caEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(caEmail)) {
      setCaEmailErr("Enter a valid email address.");
      return;
    }
    if (caPass.length < 6) {
      setCaPassErr("Password must be at least 6 characters.");
      return;
    }
    if (caPass !== caPass2) {
      setCaPassErr("Passwords don't match.");
      return;
    }

    setCaLoading(true);
    try {
      // Check if account already exists
      const auth = getFirebaseAuth();
      if (auth) {
        const methods = await fetchSignInMethodsForEmail(auth, caEmail);
        if (methods.length > 0) {
          setCaEmailErr("An account with this email already exists. Please sign in.");
          return;
        }
      }

      // Generate and send OTP
      const otp = generateOtp();
      setGeneratedOtp(otp);
      const sent = await sendOtpEmail(caEmail, otp);
      if (!sent) {
        setCaEmailErr("Failed to send OTP. Please check your EmailJS setup.");
        return;
      }
      setStep("create_otp");
    } finally {
      setCaLoading(false);
    }
  }

  // ── VERIFY OTP ─────────────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    setOtpErr("");
    if (enteredOtp.length < 6) {
      setOtpErr("Enter the 6-digit OTP.");
      return;
    }
    if (enteredOtp !== generatedOtp) {
      setOtpErr("Incorrect OTP. Please try again.");
      return;
    }

    setOtpLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not ready");
      await createUserWithEmailAndPassword(auth, caEmail, caPass);
      setStep("profile");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/email-already-in-use") {
        setOtpErr("Account already exists. Please sign in.");
      } else {
        setOtpErr("Failed to create account. Please try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  }

  // ── RESEND OTP ─────────────────────────────────────────────────────────────
  async function handleResendOtp() {
    const otp = generateOtp();
    setGeneratedOtp(otp);
    setEnteredOtp("");
    setOtpErr("");
    setCanResend(false);
    setOtpTimer(60);
    await sendOtpEmail(caEmail, otp);
  }

  // ── PROFILE SAVE ──────────────────────────────────────────────────────────
  function saveProfile() {
    localStorage.setItem("tracex:onboarding", JSON.stringify({ name, studyType }));
    setStep("safety");
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg">

        {/* ── START ─────────────────────────────────────────────────────────── */}
        {step === "start" && (
          <>
            <h1 className="text-center text-4xl font-bold mb-2">
              Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-10">
              Sign in / Create a new account
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => { setStep("signin"); setSiEmailErr(""); setSiPassErr(""); setSiEmail(""); setSiPass(""); }}>
                Continue with Email
              </Button>
              <p
                className="text-center mt-4 cursor-pointer text-slate-400 hover:text-white transition text-sm"
                onClick={() => { setStep("create_form"); setCaEmailErr(""); setCaPassErr(""); setCaEmail(""); setCaPass(""); setCaPass2(""); }}
              >
                Create a full TraceX account
              </p>
            </div>
          </>
        )}

        {/* ── SIGN IN ───────────────────────────────────────────────────────── */}
        {step === "signin" && (
          <SectionCard title="Sign In" description="Enter your TraceX email and password.">
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <Input
              type="email"
              placeholder="you@gmail.com"
              value={siEmail}
              onChange={(e) => { setSiEmail(e.target.value); setSiEmailErr(""); }}
              className={siEmailErr ? "border-red-500" : ""}
            />
            <ErrorMsg msg={siEmailErr} />

            <label className="text-sm text-slate-300 mt-4 mb-1 block">Password</label>
            <Input
              type="password"
              placeholder="Password"
              value={siPass}
              onChange={(e) => { setSiPass(e.target.value); setSiPassErr(""); }}
              className={siPassErr ? "border-red-500" : ""}
            />
            <ErrorMsg msg={siPassErr} />

            <div className="flex gap-3 mt-4">
              <Button onClick={handleSignIn} disabled={siLoading}>
                {siLoading ? "Signing in…" : "Sign In"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("start")}>← Back</Button>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Don't have an account?{" "}
              <span
                className="text-cyan-400 cursor-pointer hover:underline"
                onClick={() => { setStep("create_form"); setCaEmailErr(""); setCaPassErr(""); }}
              >
                Create one here
              </span>
            </p>
          </SectionCard>
        )}

        {/* ── CREATE ACCOUNT ────────────────────────────────────────────────── */}
        {step === "create_form" && (
          <SectionCard
            title="Create Your TraceX Account"
            description="Enter your email and set a password. A 6-digit OTP will be sent to your email to verify."
          >
            <label className="text-sm text-slate-300 mb-1 block">Email Address</label>
            <Input
              type="email"
              placeholder="you@gmail.com"
              value={caEmail}
              onChange={(e) => { setCaEmail(e.target.value); setCaEmailErr(""); }}
              className={caEmailErr ? "border-red-500" : ""}
            />
            <ErrorMsg msg={caEmailErr} />

            <label className="text-sm text-slate-300 mt-4 mb-1 block">Password</label>
            <Input
              type="password"
              placeholder="Min. 6 characters"
              value={caPass}
              onChange={(e) => { setCaPass(e.target.value); setCaPassErr(""); }}
              className={caPassErr ? "border-red-500" : ""}
            />

            <label className="text-sm text-slate-300 mt-3 mb-1 block">Confirm Password</label>
            <Input
              type="password"
              placeholder="Re-enter password"
              value={caPass2}
              onChange={(e) => { setCaPass2(e.target.value); setCaPassErr(""); }}
              className={caPassErr ? "border-red-500" : ""}
            />
            <ErrorMsg msg={caPassErr} />

            <div className="flex gap-3 mt-4">
              <Button onClick={handleSendOtp} disabled={caLoading}>
                {caLoading ? "Sending OTP…" : "Send OTP to Email"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("start")}>← Back</Button>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Already have an account?{" "}
              <span
                className="text-cyan-400 cursor-pointer hover:underline"
                onClick={() => { setStep("signin"); setSiEmailErr(""); setSiPassErr(""); }}
              >
                Sign in here
              </span>
            </p>
          </SectionCard>
        )}

        {/* ── OTP VERIFY ────────────────────────────────────────────────────── */}
        {step === "create_otp" && (
          <SectionCard
            title="Enter OTP 📧"
            description={`A 6-digit OTP has been sent to ${caEmail}. Check your inbox and enter it below.`}
          >
            <Input
              placeholder="Enter 6-digit OTP"
              value={enteredOtp}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, "")); setOtpErr(""); }}
              className={otpErr ? "border-red-500" : ""}
            />
            <ErrorMsg msg={otpErr} />

            {!canResend ? (
              <p className="text-xs text-slate-400 mt-2">Resend OTP in {otpTimer}s</p>
            ) : (
              <button
                className="text-xs text-cyan-400 mt-2 hover:underline"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            )}

            <div className="flex gap-3 mt-4">
              <Button onClick={handleVerifyOtp} disabled={enteredOtp.length < 6 || otpLoading}>
                {otpLoading ? "Verifying…" : "Verify OTP"}
              </Button>
              <Button variant="ghost" onClick={() => { setStep("create_form"); setOtpErr(""); setEnteredOtp(""); }}>
                ← Back
              </Button>
            </div>
          </SectionCard>
        )}

        {/* ── PROFILE ───────────────────────────────────────────────────────── */}
        {step === "profile" && (
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
              {studyOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </Select>
            <Button className="mt-4" disabled={!name.trim()} onClick={saveProfile}>
              Continue
            </Button>
          </SectionCard>
        )}

        {/* ── SAFETY ────────────────────────────────────────────────────────── */}
        {step === "safety" && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">
              No harmful, abusive, or vulgar content. Violations lead to immediate suspension.
            </p>
            <Button onClick={() => router.push("/theme")}>
              I Accept → Choose Theme
            </Button>
          </SectionCard>
        )}

      </div>
    </div>
  );
}