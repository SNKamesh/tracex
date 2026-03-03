"use client";

import { useState, useEffect, useRef } from "react";
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
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}
function getFirebaseAuth() {
  try { return getAuth(getFirebaseApp()); } catch { return null; }
}
function getDb() {
  return getFirestore(getFirebaseApp());
}

const SESSION_KEY = "tracex_session_token";

function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

const BANNED_WORDS = [
  "fuck","f**k","fuk","shit","sh1t","s**t","bitch","b**ch","b1tch",
  "ass","a**","a55","bastard","dick","d**k","cunt","c**t","pussy","p***y",
  "nigga","nigger","n***a","whore","wh**e","slut","sl*t","idiot","stupid",
  "moron","retard","kill","rape","r*pe","sex","porn","xxx","hate","nazi","terrorist",
];

function containsAbusiveContent(text: string): boolean {
  const lower = text.toLowerCase().replace(/\s+/g, "");
  return BANNED_WORDS.some((word) => lower.includes(word.replace(/\*/g, "")));
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: toEmail, otp }),
    });
    return res.ok;
  } catch { return false; }
}

function generateTracexId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TRX-";
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

type Step =
  | "start"
  | "signin"
  | "create_form"
  | "create_otp"
  | "profile"
  | "safety"
  | "forgot_email"
  | "forgot_otp"
  | "forgot_newpass";

const studyOptions = ["School", "University", "College", "Other"];

function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");

  // ── Sign In state ──────────────────────────────────────────────────────────
  const [siEmail, setSiEmail]                   = useState("");
  const [siPass, setSiPass]                     = useState("");
  const [siEmailErr, setSiEmailErr]             = useState("");
  const [siPassErr, setSiPassErr]               = useState("");
  const [siLoading, setSiLoading]               = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // ── Create Account state ───────────────────────────────────────────────────
  const [caEmail, setCaEmail]       = useState("");
  const [caPass, setCaPass]         = useState("");
  const [caPass2, setCaPass2]       = useState("");
  const [caEmailErr, setCaEmailErr] = useState("");
  const [caPassErr, setCaPassErr]   = useState("");
  const [caLoading, setCaLoading]   = useState(false);

  // ── OTP state (shared for create + forgot) ─────────────────────────────────
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp]     = useState("");
  const [otpErr, setOtpErr]             = useState("");
  const [otpLoading, setOtpLoading]     = useState(false);
  const [otpTimer, setOtpTimer]         = useState(60);
  const [canResend, setCanResend]       = useState(false);

  // ── Profile state ─────────────────────────────────────────────────────────
  const [name, setName]           = useState("");
  const [nameErr, setNameErr]     = useState("");
  const [studyType, setStudyType] = useState(studyOptions[0]);

  // ── Forgot Password state ──────────────────────────────────────────────────
  const [fpEmail, setFpEmail]       = useState("");
  const [fpEmailErr, setFpEmailErr] = useState("");
  const [fpLoading, setFpLoading]   = useState(false);
  const [fpNewPass, setFpNewPass]   = useState("");
  const [fpNewPass2, setFpNewPass2] = useState("");
  const [fpPassErr, setFpPassErr]   = useState("");
  const [fpSaving, setFpSaving]     = useState(false);

  const sessionUnsubRef = useRef<(() => void) | null>(null);
  const forcedOutRef    = useRef(false);

  // ── OTP countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "create_otp" && step !== "forgot_otp") return;
    setOtpTimer(60); setCanResend(false);
    const interval = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    return () => { sessionUnsubRef.current?.(); };
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storedToken = sessionStorage.getItem(SESSION_KEY);
        if (storedToken) startSessionWatcher(user.uid, storedToken);
      }
    });
    return () => unsub();
  }, []);

  async function forceLogout(reason: string) {
    if (forcedOutRef.current) return;
    forcedOutRef.current = true;
    sessionUnsubRef.current?.();
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    sessionStorage.removeItem(SESSION_KEY);
    alert(reason);
    router.replace("/signup");
  }

  async function writeSession(uid: string): Promise<string> {
    const token = generateSessionToken();
    await setDoc(doc(getDb(), "sessions", uid), {
      token,
      loginAt:   Date.now(),
      userAgent: navigator.userAgent,
    });
    sessionStorage.setItem(SESSION_KEY, token);
    return token;
  }

  function startSessionWatcher(uid: string, myToken: string) {
    sessionUnsubRef.current?.();
    const ref   = doc(getDb(), "sessions", uid);
    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) return;
      const activeToken = snap.data()?.token;
      if (activeToken && activeToken !== myToken) {
        await forceLogout(
          "⚠️ Your TraceX account was signed in on another device or browser tab.\n\nYou have been logged out for security."
        );
      }
    });
    sessionUnsubRef.current = unsub;
  }

  // ── SIGN IN ───────────────────────────────────────────────────────────────
  async function handleSignIn() {
    setSiEmailErr(""); setSiPassErr(""); setPasswordResetSuccess(false);
    if (!siEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siEmail)) {
      setSiEmailErr("Enter a valid email address."); return;
    }
    if (!siPass) { setSiPassErr("Enter your password."); return; }

    setSiLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not ready");
      forcedOutRef.current = false;
      const cred  = await signInWithEmailAndPassword(auth, siEmail, siPass);
      const token = await writeSession(cred.user.uid);
      startSessionWatcher(cred.user.uid, token);
      router.push("/home");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") {
        setSiEmailErr("Account doesn't exist. Please create a TraceX account first.");
      } else if (["auth/wrong-password","auth/invalid-login-credentials","auth/invalid-credential"].includes(code)) {
        setSiPassErr("Invalid password.");
      } else if (code === "auth/too-many-requests") {
        setSiPassErr("Too many attempts. Try again later.");
      } else {
        setSiPassErr("Something went wrong. Please try again.");
      }
    } finally { setSiLoading(false); }
  }

  // ── CREATE — send OTP ─────────────────────────────────────────────────────
  async function handleSendOtp() {
    setCaEmailErr(""); setCaPassErr("");
    if (!caEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(caEmail)) {
      setCaEmailErr("Enter a valid email address."); return;
    }
    if (caPass.length < 6) { setCaPassErr("Password must be at least 6 characters."); return; }
    if (caPass !== caPass2) { setCaPassErr("Passwords don't match."); return; }

    setCaLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (auth) {
        const methods = await fetchSignInMethodsForEmail(auth, caEmail);
        if (methods.length > 0) { setCaEmailErr("Account already exists. Please sign in."); return; }
      }
      const otp  = generateOtp();
      setGeneratedOtp(otp);
      const sent = await sendOtpEmail(caEmail, otp);
      if (!sent) { setCaEmailErr("Unable to send verification code. Please try again."); return; }
      setStep("create_otp");
    } finally { setCaLoading(false); }
  }

  // ── VERIFY OTP (create account) ───────────────────────────────────────────
  async function handleVerifyOtp() {
    setOtpErr("");
    if (enteredOtp.length < 6) { setOtpErr("Enter the 6-digit OTP."); return; }
    if (enteredOtp !== generatedOtp) { setOtpErr("Incorrect OTP entered."); return; }

    setOtpLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase not ready");
      forcedOutRef.current = false;
      const cred  = await createUserWithEmailAndPassword(auth, caEmail, caPass);
      const token = await writeSession(cred.user.uid);
      startSessionWatcher(cred.user.uid, token);
      setStep("profile");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/email-already-in-use") {
        setStep("signin");
        setSiEmail(caEmail);
        setSiEmailErr("Account already exists. Please sign in.");
        return;
      } else { setOtpErr("Something went wrong. Please try again."); }
    } finally { setOtpLoading(false); }
  }

  async function handleResendOtp() {
    const otp = generateOtp();
    setGeneratedOtp(otp); setEnteredOtp(""); setOtpErr(""); setCanResend(false); setOtpTimer(60);
    const email = step === "forgot_otp" ? fpEmail : caEmail;
    await sendOtpEmail(email, otp);
  }

  // ── PROFILE SAVE ──────────────────────────────────────────────────────────
  async function saveProfile() {
    setNameErr("");
    if (containsAbusiveContent(name)) { setNameErr("Please enter a proper name. Keep it respectful."); return; }
    if (!/^[a-zA-Z\s.\-']+$/.test(name.trim())) { setNameErr("Name can only contain letters, spaces, and basic punctuation."); return; }

    const { getAuth } = await import("firebase/auth");
    const { getFirestore, doc, setDoc, collection, query, where, getDocs } = await import("firebase/firestore");

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore();

    let tracexId = generateTracexId();
    let isUnique = false;
    while (!isUnique) {
      const snap = await getDocs(query(collection(db, "users"), where("tracexId", "==", tracexId)));
      if (snap.empty) { isUnique = true; } else { tracexId = generateTracexId(); }
    }

    await setDoc(doc(db, "users", user.uid), { name, studyType, email: user.email, tracexId, createdAt: Date.now() });
    localStorage.setItem(`tracex:onboarding:${user.uid}`, JSON.stringify({ name, studyType, tracexId }));
    setStep("safety");
  }

  // ── FORGOT PASSWORD — Step 1: send OTP ────────────────────────────────────
  async function handleForgotSendOtp() {
    setFpEmailErr("");
    if (!fpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fpEmail)) {
      setFpEmailErr("Enter a valid email address."); return;
    }
    setFpLoading(true);
    try {
      const otp = generateOtp();
      setGeneratedOtp(otp);
      const sent = await sendOtpEmail(fpEmail, otp);
      if (!sent) { setFpEmailErr("Unable to send OTP. Please try again."); return; }
      setEnteredOtp(""); setOtpErr("");
      setStep("forgot_otp");
    } finally { setFpLoading(false); }
  }

  // ── FORGOT PASSWORD — Step 2: verify OTP ──────────────────────────────────
  async function handleForgotVerifyOtp() {
    setOtpErr("");
    if (enteredOtp.length < 6) { setOtpErr("Enter the 6-digit OTP."); return; }
    if (enteredOtp !== generatedOtp) { setOtpErr("Incorrect OTP entered."); return; }
    setFpNewPass(""); setFpNewPass2(""); setFpPassErr("");
    setStep("forgot_newpass");
  }

  // ── FORGOT PASSWORD — Step 3: set new password ────────────────────────────
  async function handleForgotSetPassword() {
    setFpPassErr("");
    if (fpNewPass.length < 6) { setFpPassErr("Password must be at least 6 characters."); return; }
    if (fpNewPass !== fpNewPass2) { setFpPassErr("Passwords don't match."); return; }

    setFpSaving(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, newPassword: fpNewPass }),
      });
      if (!res.ok) throw new Error("Reset failed");
      // ── Redirect to sign in with success message ──
      setSiEmail(fpEmail);
      setSiPass("");
      setSiEmailErr("");
      setSiPassErr("");
      setPasswordResetSuccess(true);
      setStep("signin");
    } catch {
      setFpPassErr("Failed to update password. Please try again.");
    } finally { setFpSaving(false); }
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg">

        {/* ── START ── */}
        {step === "start" && (
          <>
            <h1 className="text-center text-4xl font-bold mb-2">
              Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-10">Sign in / Create a new account</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => { setStep("signin"); setSiEmailErr(""); setSiPassErr(""); setSiEmail(""); setSiPass(""); setPasswordResetSuccess(false); }}>
                Continue with Email
              </Button>
              <p className="text-center mt-4 cursor-pointer text-slate-400 hover:text-white transition text-sm"
                onClick={() => { setStep("create_form"); setCaEmailErr(""); setCaPassErr(""); setCaEmail(""); setCaPass(""); setCaPass2(""); }}>
                Create a full TraceX account
              </p>
            </div>
          </>
        )}

        {/* ── SIGN IN ── */}
        {step === "signin" && (
          <SectionCard title="Sign In" description="Enter your TraceX email and password.">
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <Input type="email" placeholder="you@gmail.com" value={siEmail}
              onChange={(e) => { setSiEmail(e.target.value); setSiEmailErr(""); setPasswordResetSuccess(false); }}
              className={siEmailErr ? "border-red-500" : ""} />
            <ErrorMsg msg={siEmailErr} />

            <label className="text-sm text-slate-300 mt-4 mb-1 block">Password</label>
            <Input type="password" placeholder="Password" value={siPass}
              onChange={(e) => { setSiPass(e.target.value); setSiPassErr(""); setPasswordResetSuccess(false); }}
              className={siPassErr ? "border-red-500" : ""} />
            <ErrorMsg msg={siPassErr} />

            {/* ── Password reset success message ── */}
            {passwordResetSuccess && (
              <p className="mt-1 text-xs text-green-400 font-medium">
                ✓ Password reset successfully! Sign in with your new password.
              </p>
            )}

            {/* ── Forgot Password link ── */}
            <p className="text-xs mt-2 text-right">
              <span
                className="text-cyan-400 cursor-pointer hover:underline"
                onClick={() => { setFpEmail(""); setFpEmailErr(""); setPasswordResetSuccess(false); setStep("forgot_email"); }}
              >
                Forgot password?
              </span>
            </p>

            <div className="flex gap-3 mt-4">
              <Button onClick={handleSignIn} disabled={siLoading}>{siLoading ? "Signing in…" : "Sign In"}</Button>
              <Button variant="ghost" onClick={() => { setStep("start"); setPasswordResetSuccess(false); }}>← Back</Button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Don't have an account?{" "}
              <span className="text-cyan-400 cursor-pointer hover:underline"
                onClick={() => { setStep("create_form"); setCaEmailErr(""); setCaPassErr(""); setPasswordResetSuccess(false); }}>
                Create one here
              </span>
            </p>
          </SectionCard>
        )}

        {/* ── CREATE FORM ── */}
        {step === "create_form" && (
          <SectionCard title="Create Your TraceX Account" description="Enter your email and set a password. A 6-digit OTP will be sent to verify.">
            <label className="text-sm text-slate-300 mb-1 block">Email Address</label>
            <Input type="email" placeholder="you@gmail.com" value={caEmail}
              onChange={(e) => { setCaEmail(e.target.value); setCaEmailErr(""); }}
              className={caEmailErr ? "border-red-500" : ""} />
            <ErrorMsg msg={caEmailErr === "__EXISTS__" ? "Account already exists. Please sign in." : caEmailErr} />

            <label className="text-sm text-slate-300 mt-4 mb-1 block">Password</label>
            <Input type="password" placeholder="Min. 6 characters" value={caPass}
              onChange={(e) => { setCaPass(e.target.value); setCaPassErr(""); }}
              className={caPassErr ? "border-red-500" : ""} />

            <label className="text-sm text-slate-300 mt-3 mb-1 block">Confirm Password</label>
            <Input type="password" placeholder="Re-enter password" value={caPass2}
              onChange={(e) => { setCaPass2(e.target.value); setCaPassErr(""); }}
              className={caPassErr ? "border-red-500" : ""} />
            <ErrorMsg msg={caPassErr} />

            <div className="flex gap-3 mt-4">
              <Button onClick={handleSendOtp} disabled={caLoading}>{caLoading ? "Sending OTP…" : "Send OTP to Email"}</Button>
              <Button variant="ghost" onClick={() => setStep("start")}>← Back</Button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Already have an account?{" "}
              <span className="text-cyan-400 cursor-pointer hover:underline"
                onClick={() => { setStep("signin"); setSiEmailErr(""); setSiPassErr(""); }}>
                Sign in here
              </span>
            </p>
          </SectionCard>
        )}

        {/* ── CREATE OTP ── */}
        {step === "create_otp" && (
          <SectionCard title="Enter OTP 📧" description={`A 6-digit OTP has been sent to ${caEmail}. Check your inbox.`}>
            <Input placeholder="Enter 6-digit OTP" value={enteredOtp} inputMode="numeric" maxLength={6}
              onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, "")); setOtpErr(""); }}
              className={otpErr ? "border-red-500" : ""} />
            <ErrorMsg msg={otpErr} />
            {!canResend
              ? <p className="text-xs text-slate-400 mt-2">Resend OTP in {otpTimer}s</p>
              : <button className="text-xs text-cyan-400 mt-2 hover:underline" onClick={handleResendOtp}>Resend OTP</button>}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleVerifyOtp} disabled={enteredOtp.length < 6 || otpLoading}>
                {otpLoading ? "Verifying…" : "Verify OTP"}
              </Button>
              <Button variant="ghost" onClick={() => { setStep("create_form"); setOtpErr(""); setEnteredOtp(""); }}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {/* ── PROFILE ── */}
        {step === "profile" && (
          <SectionCard title="Profile Details" description="Tell us about yourself">
            <Input placeholder="Full Name" value={name}
              onChange={(e) => { setName(e.target.value); setNameErr(""); }}
              className={nameErr ? "border-red-500" : ""} />
            <ErrorMsg msg={nameErr} />
            <label className="mt-4 mb-2 block text-sm text-slate-300">Where are you studying?</label>
            <Select className="w-full rounded-lg px-4 py-2 bg-slate-900 border border-slate-700 text-white"
              value={studyType} onChange={(e) => setStudyType(e.target.value)}>
              {studyOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
            <Button className="mt-4" disabled={!name.trim()} onClick={saveProfile}>Continue</Button>
          </SectionCard>
        )}

        {/* ── SAFETY ── */}
        {step === "safety" && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">
              No harmful, abusive, or vulgar content. Violations lead to immediate suspension.
            </p>
            <Button onClick={() => router.push("/theme")}>I Accept → Choose Theme</Button>
          </SectionCard>
        )}

        {/* ── FORGOT PASSWORD — Step 1: Enter Email ── */}
        {step === "forgot_email" && (
          <SectionCard title="Reset Password" description="Enter your TraceX account email. We'll send a 6-digit OTP to verify it's you.">
            <label className="text-sm text-slate-300 mb-1 block">Email Address</label>
            <Input
              type="email"
              placeholder="you@gmail.com"
              value={fpEmail}
              onChange={(e) => { setFpEmail(e.target.value); setFpEmailErr(""); }}
              className={fpEmailErr ? "border-red-500" : ""}
            />
            <ErrorMsg msg={fpEmailErr} />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleForgotSendOtp} disabled={fpLoading}>
                {fpLoading ? "Sending OTP…" : "Send OTP"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("signin")}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {/* ── FORGOT PASSWORD — Step 2: Verify OTP ── */}
        {step === "forgot_otp" && (
          <SectionCard title="Verify OTP 🔐" description={`A 6-digit OTP has been sent to ${fpEmail}. Enter it below to reset your password.`}>
            <Input
              placeholder="Enter 6-digit OTP"
              value={enteredOtp}
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, "")); setOtpErr(""); }}
              className={otpErr ? "border-red-500" : ""}
            />
            <ErrorMsg msg={otpErr} />
            {!canResend
              ? <p className="text-xs text-slate-400 mt-2">Resend OTP in {otpTimer}s</p>
              : <button className="text-xs text-cyan-400 mt-2 hover:underline" onClick={handleResendOtp}>Resend OTP</button>}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleForgotVerifyOtp} disabled={enteredOtp.length < 6 || otpLoading}>
                {otpLoading ? "Verifying…" : "Verify OTP"}
              </Button>
              <Button variant="ghost" onClick={() => { setStep("forgot_email"); setEnteredOtp(""); setOtpErr(""); }}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {/* ── FORGOT PASSWORD — Step 3: Set New Password ── */}
        {step === "forgot_newpass" && (
          <SectionCard title="Set New Password 🔑" description="Create a strong new password for your TraceX account.">
            <label className="text-sm text-slate-300 mb-1 block">New Password</label>
            <Input
              type="password"
              placeholder="Min. 6 characters"
              value={fpNewPass}
              onChange={(e) => { setFpNewPass(e.target.value); setFpPassErr(""); }}
              className={fpPassErr ? "border-red-500" : ""}
            />
            <label className="text-sm text-slate-300 mt-3 mb-1 block">Re-enter New Password</label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={fpNewPass2}
              onChange={(e) => { setFpNewPass2(e.target.value); setFpPassErr(""); }}
              className={fpPassErr ? "border-red-500" : ""}
            />
            <ErrorMsg msg={fpPassErr} />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleForgotSetPassword}
                disabled={fpSaving || !fpNewPass || !fpNewPass2}
              >
                {fpSaving ? "Saving…" : "Continue"}
              </Button>
              <Button variant="ghost" onClick={() => setStep("forgot_otp")}>← Back</Button>
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  );
}