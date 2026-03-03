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

// ── Session token stored per tab in sessionStorage (not localStorage)
// sessionStorage is tab-isolated, so each tab has its own token
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

type Step = "start" | "signin" | "create_form" | "create_otp" | "profile" | "safety";
const studyOptions = ["School", "University", "College", "Other"];

function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");

  const [siEmail, setSiEmail]       = useState("");
  const [siPass, setSiPass]         = useState("");
  const [siEmailErr, setSiEmailErr] = useState("");
  const [siPassErr, setSiPassErr]   = useState("");
  const [siLoading, setSiLoading]   = useState(false);

  const [caEmail, setCaEmail]       = useState("");
  const [caPass, setCaPass]         = useState("");
  const [caPass2, setCaPass2]       = useState("");
  const [caEmailErr, setCaEmailErr] = useState("");
  const [caPassErr, setCaPassErr]   = useState("");
  const [caLoading, setCaLoading]   = useState(false);

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp]     = useState("");
  const [otpErr, setOtpErr]             = useState("");
  const [otpLoading, setOtpLoading]     = useState(false);
  const [otpTimer, setOtpTimer]         = useState(60);
  const [canResend, setCanResend]       = useState(false);

  const [name, setName]           = useState("");
  const [nameErr, setNameErr]     = useState("");
  const [studyType, setStudyType] = useState(studyOptions[0]);

  const sessionUnsubRef = useRef<(() => void) | null>(null);
  const forcedOutRef    = useRef(false);

  // ── OTP countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "create_otp") return;
    setOtpTimer(60); setCanResend(false);
    const interval = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // ── Cleanup watcher on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => { sessionUnsubRef.current?.(); };
  }, []);

  // ── If already logged in on this device, start watching immediately ───────
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storedToken = sessionStorage.getItem(SESSION_KEY);
        if (storedToken) {
          startSessionWatcher(user.uid, storedToken);
        }
      }
    });
    return () => unsub();
  }, []);

  // ── Force logout helper ───────────────────────────────────────────────────
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

  // ── Write session token to Firestore ─────────────────────────────────────
  async function writeSession(uid: string): Promise<string> {
    const token = generateSessionToken();
    await setDoc(doc(getDb(), "sessions", uid), {
      token,
      loginAt:   Date.now(),
      userAgent: navigator.userAgent,     // device info (optional, useful for debugging)
    });
    sessionStorage.setItem(SESSION_KEY, token); // tab-isolated storage
    return token;
  }

  // ── Session watcher — detects login from another tab OR device ────────────
  function startSessionWatcher(uid: string, myToken: string) {
    sessionUnsubRef.current?.(); // clean up previous watcher
    const ref   = doc(getDb(), "sessions", uid);
    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) return;
      const activeToken = snap.data()?.token;
      // Token mismatch means someone else logged in (another tab or device)
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
    setSiEmailErr(""); setSiPassErr("");
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
      // Write new session — this instantly kicks out any other active session
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

  // ── VERIFY OTP ────────────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    setOtpErr("");
    if (enteredOtp.length < 6) { setOtpErr("Enter the 6-digit OTP."); return; }
    if (enteredOtp !== generatedOtp) { setOtpErr("Incorrect OTP. Please try again."); return; }

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
      if (code === "auth/email-already-in-use") { setOtpErr("Account already exists. Please sign in."); }
      else { setOtpErr("Something went wrong. Please try again."); }
    } finally { setOtpLoading(false); }
  }

  async function handleResendOtp() {
    const otp = generateOtp();
    setGeneratedOtp(otp); setEnteredOtp(""); setOtpErr(""); setCanResend(false); setOtpTimer(60);
    await sendOtpEmail(caEmail, otp);
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

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg">

        {step === "start" && (
          <>
            <h1 className="text-center text-4xl font-bold mb-2">
              Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-10">Sign in / Create a new account</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => { setStep("signin"); setSiEmailErr(""); setSiPassErr(""); setSiEmail(""); setSiPass(""); }}>
                Continue with Email
              </Button>
              <p className="text-center mt-4 cursor-pointer text-slate-400 hover:text-white transition text-sm"
                onClick={() => { setStep("create_form"); setCaEmailErr(""); setCaPassErr(""); setCaEmail(""); setCaPass(""); setCaPass2(""); }}>
                Create a full TraceX account
              </p>
            </div>
          </>
        )}

        {step === "signin" && (
          <SectionCard title="Sign In" description="Enter your TraceX email and password.">
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <Input type="email" placeholder="you@gmail.com" value={siEmail}
              onChange={(e) => { setSiEmail(e.target.value); setSiEmailErr(""); }}
              className={siEmailErr ? "border-red-500" : ""} />
            <ErrorMsg msg={siEmailErr} />
            <label className="text-sm text-slate-300 mt-4 mb-1 block">Password</label>
            <Input type="password" placeholder="Password" value={siPass}
              onChange={(e) => { setSiPass(e.target.value); setSiPassErr(""); }}
              className={siPassErr ? "border-red-500" : ""} />
            <ErrorMsg msg={siPassErr} />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSignIn} disabled={siLoading}>{siLoading ? "Signing in…" : "Sign In"}</Button>
              <Button variant="ghost" onClick={() => setStep("start")}>← Back</Button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Don't have an account?{" "}
              <span className="text-cyan-400 cursor-pointer hover:underline"
                onClick={() => { setStep("create_form"); setCaEmailErr(""); setCaPassErr(""); }}>
                Create one here
              </span>
            </p>
          </SectionCard>
        )}

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

        {step === "safety" && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">
              No harmful, abusive, or vulgar content. Violations lead to immediate suspension.
            </p>
            <Button onClick={() => router.push("/theme")}>I Accept → Choose Theme</Button>
          </SectionCard>
        )}

      </div>
    </div>
  );
}