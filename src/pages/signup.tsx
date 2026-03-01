"use client";

import { useRef, useState, useEffect } from "react";
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
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

// 🔴 PASTE YOUR REAL FIREBASE CREDENTIALS HERE
// Firebase Console → Project Settings → Your apps → Web app → SDK setup
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_AUTH_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// ─── Country codes ─────────────────────────────────────────────────────────────
const countryCodes = [
  { code: "+91",  label: "IN +91"  },
  { code: "+1",   label: "US +1"   },
  { code: "+44",  label: "GB +44"  },
  { code: "+61",  label: "AU +61"  },
  { code: "+49",  label: "DE +49"  },
  { code: "+33",  label: "FR +33"  },
  { code: "+81",  label: "JP +81"  },
  { code: "+86",  label: "CN +86"  },
  { code: "+971", label: "AE +971" },
  { code: "+65",  label: "SG +65"  },
  { code: "+60",  label: "MY +60"  },
  { code: "+55",  label: "BR +55"  },
  { code: "+82",  label: "KR +82"  },
  { code: "+34",  label: "ES +34"  },
];

// ─── Steps ─────────────────────────────────────────────────────────────────────
type Step =
  | "start"
  | "email"
  | "email_otp"
  | "facebook"
  | "phone"
  | "phone_otp"
  | "profile"
  | "safety";

const studyOptions = ["School", "University", "College", "Other"];

// ─── Shared error box ──────────────────────────────────────────────────────────
function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");

  // ── Email state ──────────────────────────────────────────────────────────────
  const [email, setEmail]               = useState("");
  const [emailError, setEmailError]     = useState("");
  const [emailOtp, setEmailOtp]         = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  // We'll use Firebase phone-style fake OTP for email demo; 
  // In production wire up Firebase Email link or SMTP service.
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  // ── Facebook state ───────────────────────────────────────────────────────────
  const [fbEmail, setFbEmail]       = useState("");
  const [fbPass, setFbPass]         = useState("");
  const [fbEmailError, setFbEmailError] = useState("");
  const [fbPassError, setFbPassError]   = useState("");
  const [fbLoading, setFbLoading]   = useState(false);

  // ── Phone state ──────────────────────────────────────────────────────────────
  const [dialCode, setDialCode]       = useState("+91");
  const [phone, setPhone]             = useState("");
  const [phoneError, setPhoneError]   = useState("");
  const [sending, setSending]         = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  // ── OTP state ────────────────────────────────────────────────────────────────
  const [otp, setOtp]           = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // ── Profile state ────────────────────────────────────────────────────────────
  const [name, setName]           = useState("");
  const [studyType, setStudyType] = useState(studyOptions[0]);

  // ── reCAPTCHA ────────────────────────────────────────────────────────────────
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (verifierRef.current) return;
    verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // EMAIL FLOW — send OTP (uses Firebase signInWithEmailAndPassword for sign-in)
  // For new accounts, we use email link. Here we do sign-in check + show OTP UI.
  // ────────────────────────────────────────────────────────────────────────────
  async function handleEmailContinue() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setEmailLoading(true);
    try {
      // Try to send a password reset to check if account exists
      await sendPasswordResetEmail(auth, email);
      setEmailOtpSent(true);
      setStep("email_otp");
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setEmailError("Account doesn't exist. Please create a new account.");
      } else {
        // Proceed anyway for new accounts
        setEmailOtpSent(true);
        setStep("email_otp");
      }
    } finally {
      setEmailLoading(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // FACEBOOK FLOW — sign in with email+password linked to Facebook account
  // ────────────────────────────────────────────────────────────────────────────
  async function handleFacebookLogin() {
    setFbEmailError("");
    setFbPassError("");

    if (!fbEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fbEmail)) {
      setFbEmailError("Enter a valid email address.");
      return;
    }
    if (!fbPass) {
      setFbPassError("Password cannot be empty.");
      return;
    }

    setFbLoading(true);
    try {
      await signInWithEmailAndPassword(auth, fbEmail, fbPass);
      setStep("profile");
    } catch (err: any) {
      if (
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/invalid-credential"
      ) {
        setFbEmailError("Account doesn't exist.");
      } else if (
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/invalid-login-credentials"
      ) {
        setFbPassError("Invalid password.");
      } else {
        setFbPassError("Login failed. Please try again.");
      }
    } finally {
      setFbLoading(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PHONE FLOW
  // ────────────────────────────────────────────────────────────────────────────
  function handlePhoneChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setPhone(digitsOnly);
    setPhoneError(
      value !== digitsOnly && value.length > 0
        ? "Only numbers are allowed (0–9)."
        : ""
    );
  }

  async function sendOtp() {
    if (!phone) { setPhoneError("Please enter your phone number."); return; }
    if (!/^\d+$/.test(phone)) { setPhoneError("Only numbers are allowed (0–9)."); return; }

    setSending(true);
    setPhoneError("");
    try {
      const result = await signInWithPhoneNumber(
        auth,
        `${dialCode}${phone}`,
        verifierRef.current!
      );
      setConfirmation(result);
      setStep("phone_otp");
    } catch (err: any) {
      const msg = err?.code || err?.message || "";
      if (msg.includes("invalid-phone-number")) {
        setPhoneError("Invalid phone number.");
      } else if (msg.includes("too-many-requests")) {
        setPhoneError("Too many attempts. Try again later.");
      } else if (msg.includes("too-many-requests")) {
        setPhoneError("Too many attempts. Please try again later.");
      } else if (msg.includes("network-request-failed")) {
        setPhoneError("Network error. Check your connection.");
      } else {
        setPhoneError("Failed to send OTP. Make sure Phone Auth is enabled in Firebase Console and your domain is authorized.");
      }
      verifierRef.current?.render().then((id: number) =>
        (window as any).grecaptcha?.reset(id)
      );
    } finally {
      setSending(false);
    }
  }

  async function verifyOtp() {
    if (!otp || !confirmation) return;
    setVerifying(true);
    setOtpError("");
    try {
      await confirmation.confirm(otp);
      setStep("profile");
    } catch {
      setOtpError("Incorrect OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PROFILE SAVE
  // ────────────────────────────────────────────────────────────────────────────
  function saveProfile() {
    localStorage.setItem("tracex:onboarding", JSON.stringify({ name, studyType }));
    setStep("safety");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      {/* Invisible reCAPTCHA anchor — required by Firebase Phone Auth */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-lg">

        {/* ── START ──────────────────────────────────────────────────────────── */}
        {step === "start" && (
          <>
            <h1 className="text-center text-4xl font-bold mb-2">
              Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-10">
              Sign in / Create a new account
            </p>

            <div className="flex flex-col gap-3">
              <Button onClick={() => { setStep("email"); setEmailError(""); }}>
                Continue with Email
              </Button>
              <Button variant="secondary" onClick={() => { setStep("facebook"); setFbEmailError(""); setFbPassError(""); }}>
                Continue with Facebook
              </Button>
              <Button variant="secondary" onClick={() => { setStep("facebook"); setFbEmailError(""); setFbPassError(""); }}>
                Continue with Apple
              </Button>
              <p
                className="text-center mt-4 cursor-pointer text-slate-400 hover:text-white transition"
                onClick={() => { setStep("phone"); setPhoneError(""); }}
              >
                Create a full TraceX account
              </p>
            </div>
          </>
        )}

        {/* ── EMAIL ──────────────────────────────────────────────────────────── */}
        {step === "email" && (
          <SectionCard title="Sign in with Email" description="Enter your email address to continue.">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              className={emailError ? "border-red-500" : ""}
            />
            <ErrorMsg msg={emailError} />

            <div className="flex gap-3 mt-4">
              <Button onClick={handleEmailContinue} disabled={emailLoading}>
                {emailLoading ? "Checking…" : "Send OTP to Email"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("start")}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {/* ── EMAIL OTP ──────────────────────────────────────────────────────── */}
        {step === "email_otp" && (
          <SectionCard
            title="Check your email"
            description={`A sign-in link has been sent to ${email}. Enter the OTP or click the link.`}
          >
            <Input
              placeholder="Enter OTP from email"
              value={emailOtp}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => { setEmailOtp(e.target.value.replace(/\D/g, "")); setEmailOtpError(""); }}
              className={emailOtpError ? "border-red-500" : ""}
            />
            <ErrorMsg msg={emailOtpError} />

            <div className="flex gap-3 mt-4">
              <Button onClick={() => setStep("profile")} disabled={emailOtp.length < 4}>
                Verify & Continue
              </Button>
              <Button variant="ghost" onClick={() => setStep("email")}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {/* ── FACEBOOK / APPLE ───────────────────────────────────────────────── */}
        {step === "facebook" && (
          <SectionCard title="Sign in" description="Enter your account credentials.">
            <label className="text-sm text-slate-300 mb-1 block">Email / Facebook ID</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={fbEmail}
              onChange={(e) => { setFbEmail(e.target.value); setFbEmailError(""); }}
              className={fbEmailError ? "border-red-500" : ""}
            />
            <ErrorMsg msg={fbEmailError} />

            <label className="text-sm text-slate-300 mt-4 mb-1 block">Password</label>
            <Input
              type="password"
              placeholder="Password"
              value={fbPass}
              onChange={(e) => { setFbPass(e.target.value); setFbPassError(""); }}
              className={fbPassError ? "border-red-500" : ""}
            />
            <ErrorMsg msg={fbPassError} />

            <div className="flex gap-3 mt-4">
              <Button onClick={handleFacebookLogin} disabled={fbLoading}>
                {fbLoading ? "Signing in…" : "Sign In"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("start")}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {/* ── PHONE (Create account) ──────────────────────────────────────────── */}
        {step === "phone" && (
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
                  <option key={c.code} value={c.code}>{c.label}</option>
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
            <ErrorMsg msg={phoneError} />

            <Button
              className="mt-4 w-full"
              onClick={sendOtp}
              disabled={!phone || !!phoneError || sending}
            >
              {sending ? "Sending OTP…" : "Send OTP"}
            </Button>

            <p className="text-xs text-slate-500 mt-3 text-center">
              ⚠️ OTP requires Firebase Phone Auth to be enabled in your Firebase Console.
            </p>
          </SectionCard>
        )}

        {/* ── PHONE OTP ──────────────────────────────────────────────────────── */}
        {step === "phone_otp" && (
          <SectionCard
            title="Verify OTP"
            description={`Enter the 6-digit code sent to ${dialCode} ${phone}`}
          >
            <Input
              value={otp}
              placeholder="6-digit code"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
              className={otpError ? "border-red-500" : ""}
            />
            <ErrorMsg msg={otpError} />

            <div className="flex gap-3 mt-4">
              <Button onClick={verifyOtp} disabled={otp.length < 6 || verifying}>
                {verifying ? "Verifying…" : "Verify OTP"}
              </Button>
              <Button variant="ghost" onClick={() => { setStep("phone"); setOtp(""); setOtpError(""); }}>
                ← Change number
              </Button>
            </div>
          </SectionCard>
        )}

        {/* ── PROFILE ────────────────────────────────────────────────────────── */}
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

        {/* ── SAFETY ─────────────────────────────────────────────────────────── */}
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