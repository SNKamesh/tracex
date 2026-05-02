"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Input from "./Input";
import Button from "./Button";
import SectionCard from "./SectionCard";
import Select from "./Select";

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
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:             process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:         process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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

const BANNED_WORDS = ["fuck","shit","bitch","nigga","nigger","porn"]; // Minimal list for logic

function containsAbusiveContent(text: string): boolean {
  const lower = text.toLowerCase().replace(/\s+/g, "");
  return BANNED_WORDS.some((word) => lower.includes(word));
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

type Step = "start" | "signin" | "create_form" | "create_otp" | "profile" | "safety" | "forgot_email" | "forgot_otp" | "forgot_newpass";

const studyOptions = ["School", "University", "College", "Other"];

function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p>;
}

export default function SignupClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");

  // States
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [siEmailErr, setSiEmailErr] = useState("");
  const [siPassErr, setSiPassErr] = useState("");
  const [siLoading, setSiLoading] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const [caEmail, setCaEmail] = useState("");
  const [caPass, setCaPass] = useState("");
  const [caPass2, setCaPass2] = useState("");
  const [caEmailErr, setCaEmailErr] = useState("");
  const [caPassErr, setCaPassErr] = useState("");
  const [caLoading, setCaLoading] = useState(false);

  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [name, setName] = useState("");
  const [nameErr, setNameErr] = useState("");
  const [studyType, setStudyType] = useState(studyOptions[0]);

  const [fpEmail, setFpEmail] = useState("");
  const [fpEmailErr, setFpEmailErr] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpNewPass2, setFpNewPass2] = useState("");
  const [fpPassErr, setFpPassErr] = useState("");
  const [fpSaving, setFpSaving] = useState(false);

  const sessionUnsubRef = useRef<(() => void) | null>(null);
  const forcedOutRef = useRef(false);

  // OTP Countdown
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

  // Session Management
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storedToken = sessionStorage.getItem(SESSION_KEY);
        if (storedToken) startSessionWatcher(user.uid, storedToken);
      }
    });
    return () => { unsub(); sessionUnsubRef.current?.(); };
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

  function startSessionWatcher(uid: string, myToken: string) {
    sessionUnsubRef.current?.();
    const ref = doc(getDb(), "sessions", uid);
    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) return;
      const activeToken = snap.data()?.token;
      if (activeToken && activeToken !== myToken) {
        await forceLogout("⚠️ Your TraceX account was signed in on another device. Logged out for security.");
      }
    });
    sessionUnsubRef.current = unsub;
  }

  async function writeSession(uid: string): Promise<string> {
    const token = generateSessionToken();
    await setDoc(doc(getDb(), "sessions", uid), { token, loginAt: Date.now(), userAgent: navigator.userAgent });
    sessionStorage.setItem(SESSION_KEY, token);
    return token;
  }

  // Auth Handlers
  async function handleSignIn() {
    setSiEmailErr(""); setSiPassErr("");
    if (!siEmail.includes("@")) { setSiEmailErr("Enter a valid email."); return; }
    setSiLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) return;
      const cred = await signInWithEmailAndPassword(auth, siEmail, siPass);
      const token = await writeSession(cred.user.uid);
      startSessionWatcher(cred.user.uid, token);
      router.push("/home");
    } catch (err: any) {
      setSiPassErr("Invalid credentials.");
    } finally { setSiLoading(false); }
  }

  async function handleSendOtp() {
    setCaEmailErr(""); setCaPassErr("");
    if (!caEmail.includes("@")) { setCaEmailErr("Enter a valid email."); return; }
    if (caPass !== caPass2) { setCaPassErr("Passwords mismatch."); return; }
    setCaLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) return;
      const methods = await fetchSignInMethodsForEmail(auth, caEmail);
      if (methods.length > 0) { setCaEmailErr("Account exists. Sign in."); return; }
      const otp = generateOtp();
      setGeneratedOtp(otp);
      const sent = await sendOtpEmail(caEmail, otp);
      if (sent) setStep("create_otp");
    } finally { setCaLoading(false); }
  }

  async function handleVerifyOtp() {
    if (enteredOtp !== generatedOtp) { setOtpErr("Wrong OTP."); return; }
    setOtpLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) return;
      const cred = await createUserWithEmailAndPassword(auth, caEmail, caPass);
      const token = await writeSession(cred.user.uid);
      startSessionWatcher(cred.user.uid, token);
      setStep("profile");
    } finally { setOtpLoading(false); }
  }

  async function saveProfile() {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) return;
    const db = getDb();
    const tracexId = generateTracexId();
    await setDoc(doc(db, "users", user.uid), { name, studyType, email: user.email, tracexId, createdAt: Date.now() });
    setStep("safety");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 font-sans">
      <div className="w-full max-w-lg">

        {/* -- STEP: START (Matching Image 3) -- */}
        {step === "start" && (
          <div className="flex flex-col items-center">
            <h1 className="text-center text-5xl font-extrabold mb-2 tracking-tight">
              Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
            </h1>
            <p className="text-center text-slate-400 mb-12 text-xl font-medium">
              Sign in / Create a new account
            </p>
            
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <Button 
                onClick={() => { setStep("signin"); setSiEmailErr(""); setSiPassErr(""); }}
                className="py-4 text-lg font-bold"
              >
                Continue with Email
              </Button>
              
              <p 
                className="text-center mt-6 cursor-pointer text-slate-400 hover:text-white transition text-sm underline"
                onClick={() => { setStep("create_form"); setCaEmailErr(""); setCaPassErr(""); }}
              >
                Create a full TraceX account
              </p>
            </div>
          </div>
        )}

        {/* -- STEP: SIGN IN -- */}
        {step === "signin" && (
          <SectionCard title="Sign In" description="Enter your TraceX email and password.">
            <Input type="email" placeholder="Email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} />
            <ErrorMsg msg={siEmailErr} />
            <Input type="password" placeholder="Password" className="mt-4" value={siPass} onChange={(e) => setSiPass(e.target.value)} />
            <ErrorMsg msg={siPassErr} />
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSignIn} disabled={siLoading}>{siLoading ? "Signing in..." : "Sign In"}</Button>
              <Button variant="ghost" onClick={() => setStep("start")}>Back</Button>
            </div>
          </SectionCard>
        )}

        {/* -- STEP: CREATE FORM -- */}
        {step === "create_form" && (
          <SectionCard title="Create Account" description="Verify your email with a 6-digit code.">
            <Input type="email" placeholder="Email" value={caEmail} onChange={(e) => setCaEmail(e.target.value)} />
            <ErrorMsg msg={caEmailErr} />
            <Input type="password" placeholder="Password" className="mt-4" value={caPass} onChange={(e) => setCaPass(e.target.value)} />
            <Input type="password" placeholder="Confirm" className="mt-2" value={caPass2} onChange={(e) => setCaPass2(e.target.value)} />
            <ErrorMsg msg={caPassErr} />
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSendOtp} disabled={caLoading}>Send OTP</Button>
              <Button variant="ghost" onClick={() => setStep("start")}>Back</Button>
            </div>
          </SectionCard>
        )}

        {/* -- STEP: OTP -- */}
        {step === "create_otp" && (
          <SectionCard title="Enter OTP" description={`Sent to ${caEmail}`}>
            <Input placeholder="6-digit code" maxLength={6} value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} />
            <ErrorMsg msg={otpErr} />
            <Button onClick={handleVerifyOtp} className="mt-6" disabled={otpLoading}>Verify</Button>
          </SectionCard>
        )}

        {/* -- STEP: PROFILE -- */}
        {step === "profile" && (
          <SectionCard title="Profile" description="Finalize your setup">
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select className="mt-4 w-full" value={studyType} onChange={(e) => setStudyType(e.target.value)}>
              {studyOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </Select>
            <Button className="mt-6" onClick={saveProfile}>Complete</Button>
          </SectionCard>
        )}

        {/* -- STEP: SAFETY -- */}
        {step === "safety" && (
          <SectionCard title="Safety" description="Protocol initialization">
            <p className="text-slate-300">No harmful content allowed. Respect the workspace.</p>
            <Button className="mt-6" onClick={() => router.push("/home")}>I Accept</Button>
          </SectionCard>
        )}

      </div>
    </div>
  );
}