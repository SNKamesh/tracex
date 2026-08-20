"use client";

import React, { useEffect, useState, useRef } from "react";
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
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const getApp_ = () => getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const getAuth_ = () => { try { return getAuth(getApp_()); } catch { return null; } };
const getDb_ = () => getFirestore(getApp_());

const SESSION_KEY = "tracex_session_token";
const BANNED_WORDS = ["fuck","f**k","fuk","shit","slut","bitch","b**ch","b1tch","ass","a**","a55","bastard","dick","d**k","pussy","nigga","nigger","whore","idiot","stupid","moron","retard","kill","rape","r*pe","sex","porn","xxx"];
const studyOptions = ["School", "University", "College", "Other"];

function genToken() { return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`; }
function genOtp() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function genTracexId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "TRX-" + Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
}

function hasAbuse(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return BANNED_WORDS.some(w => {
    const clean = w.replace(/\*/g, ".");
    const regex = new RegExp(`\\b${clean}\\b`, "i");
    return regex.test(lower);
  });
}

async function sendOtp(email: string, otp: string) {
  try {
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    let data = null;
    try { data = await response.json(); } catch {}

    if (!response.ok) {
      console.error("OTP SERVER ERROR:", data);
      throw new Error(data?.error || "Failed to send OTP");
    }

    return true;
  } catch (error) {
    console.error("SEND OTP FAILED:", error);
    throw error;
  }
}

function Err({ msg }: { msg: string }) {
  return msg ? <p className="mt-1 text-xs text-red-500 font-medium">{msg}</p> : null;
}

type Step = "start"|"signin"|"create_form"|"create_otp"|"profile"|"safety"|"forgot_email"|"forgot_otp"|"forgot_newpass";

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");

  const [siEmail, setSiEmail] = useState(""); const [siPass, setSiPass] = useState("");
  const [siEmailErr, setSiEmailErr] = useState(""); const [siPassErr, setSiPassErr] = useState("");
  const [siLoading, setSiLoading] = useState(false); const [pwResetOk, setPwResetOk] = useState(false);

  const [caEmail, setCaEmail] = useState(""); const [caPass, setCaPass] = useState(""); const [caPass2, setCaPass2] = useState("");
  const [caEmailErr, setCaEmailErr] = useState(""); const [caPassErr, setCaPassErr] = useState("");
  const [caLoading, setCaLoading] = useState(false);

  const [generatedOtp, setGeneratedOtp] = useState(""); const [enteredOtp, setEnteredOtp] = useState("");
  const [otpErr, setOtpErr] = useState(""); const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60); const [canResend, setCanResend] = useState(false);

  const [name, setName] = useState(""); const [nameErr, setNameErr] = useState("");
  const [studyType, setStudyType] = useState(studyOptions[0]);

  const [fpEmail, setFpEmail] = useState(""); const [fpEmailErr, setFpEmailErr] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpNewPass, setFpNewPass] = useState(""); const [fpNewPass2, setFpNewPass2] = useState("");
  const [fpPassErr, setFpPassErr] = useState(""); const [fpSaving, setFpSaving] = useState(false);

  const sessionUnsubRef = useRef<(()=>void)|null>(null);
  const forcedOutRef = useRef(false);

  useEffect(() => {
    if (step !== "create_otp" && step !== "forgot_otp") return;
    setOtpTimer(60); setCanResend(false);
    const iv = setInterval(() => setOtpTimer(t => { if(t<=1){clearInterval(iv);setCanResend(true);return 0;} return t-1; }), 1000);
    return () => clearInterval(iv);
  }, [step]);

  useEffect(() => () => { sessionUnsubRef.current?.(); }, []);

  useEffect(() => {
    const auth = getAuth_(); if(!auth) return;
    const unsub = onAuthStateChanged(auth, user => {
      if(user){ const t = sessionStorage.getItem(SESSION_KEY); if(t) startSessionWatcher(user.uid, t); }
    });
    return () => unsub();
  }, []);

  async function forceLogout(reason: string) {
    if(forcedOutRef.current) return; forcedOutRef.current = true;
    sessionUnsubRef.current?.();
    const auth = getAuth_(); if(auth) await signOut(auth);
    sessionStorage.removeItem(SESSION_KEY);
    alert(reason); router.replace("/signup");
  }

  async function writeSession(uid: string) {
    const token = genToken();
    await setDoc(doc(getDb_(), "sessions", uid), { token, loginAt: Date.now(), userAgent: navigator.userAgent });
    sessionStorage.setItem(SESSION_KEY, token);
    return token;
  }

  function startSessionWatcher(uid: string, myToken: string) {
    sessionUnsubRef.current?.();
    const unsub = onSnapshot(doc(getDb_(), "sessions", uid), async snap => {
      if(!snap.exists()) return;
      if(snap.data()?.token && snap.data().token !== myToken)
        await forceLogout("⚠️ Your TraceX account was signed in on another device.\n\nYou have been logged out for security.");
    });
    sessionUnsubRef.current = unsub;
  }

  async function handleSignIn() {
    setSiEmailErr(""); setSiPassErr(""); setPwResetOk(false);
    const email = siEmail.toLowerCase().trim();
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setSiEmailErr("Enter a valid email."); return; }
    if(!siPass) { setSiPassErr("Enter your password."); return; }
    setSiLoading(true);
    try {
      const auth = getAuth_(); if(!auth) throw new Error("Firebase not ready");
      forcedOutRef.current = false;
      const cred = await signInWithEmailAndPassword(auth, email, siPass);
      try { const t = await writeSession(cred.user.uid); startSessionWatcher(cred.user.uid, t); } catch (sessionError) { console.error("Session write failed:", sessionError); }
      router.push("/home");
    } catch(err: any) {
      const c = err?.code||"";
      if(c==="auth/user-not-found") setSiEmailErr("Account doesn't exist.");
      else if(["auth/wrong-password","auth/invalid-login-credentials","auth/invalid-credential"].includes(c)) setSiPassErr("Invalid password.");
      else if(c==="auth/too-many-requests") setSiPassErr("Too many attempts. Try again later.");
      else if(c==="auth/network-request-failed") setSiPassErr("Network error. Check your internet connection and try again.");
      else setSiPassErr(`Error: ${err?.code||err?.message||"Unknown error"}`);
    } finally { setSiLoading(false); }
  }

  async function handleSendOtp() {
    setCaEmailErr("");
    setCaPassErr("");

    const cleanEmail = caEmail.toLowerCase().trim();

    if(!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setCaEmailErr("Enter a valid email.");
      return;
    }

    if(caPass.length < 6) {
      setCaPassErr("Password must be at least 6 characters.");
      return;
    }

    if(caPass !== caPass2) {
      setCaPassErr("Passwords don't match.");
      return;
    }

    setCaLoading(true);

    try {
      // Do not query Firestore to decide whether an auth account exists.
      // Firebase Authentication is the source of truth. The Firestore users
      // document is only the TraceX profile created after Auth signup succeeds.
      const otp = genOtp();
      await sendOtp(cleanEmail, otp);

      setCaEmail(cleanEmail);
      setGeneratedOtp(otp);
      setEnteredOtp("");
      setOtpErr("");
      setStep("create_otp");
    } catch(err: any) {
      console.error("Signup OTP error:", err);
      setCaEmailErr(err?.message || "Unable to send OTP. Please try again.");
    } finally {
      setCaLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setOtpErr("");
    if(enteredOtp.length < 6) { setOtpErr("Enter the 6-digit OTP."); return; }
    if(enteredOtp !== generatedOtp) { setOtpErr("Incorrect OTP."); return; }

    setOtpLoading(true);

    try {
      const auth = getAuth_();
      if(!auth) throw new Error("Firebase authentication is not initialized.");

      forcedOutRef.current = false;
      const email = caEmail.toLowerCase().trim();
      const cred = await createUserWithEmailAndPassword(auth, email, caPass);

      // Create the profile only after Firebase Auth account creation succeeds.
      await setDoc(doc(getDb_(), "users", cred.user.uid), {
        name: "",
        studyType: "",
        email,
        tracexId: "",
        createdAt: Date.now(),
      });

      try {
        const t = await writeSession(cred.user.uid);
        startSessionWatcher(cred.user.uid, t);
      } catch (sessionError) {
        console.error("Session write failed:", sessionError);
      }

      setStep("profile");
    } catch(err: any) {
      console.error("CREATE ACCOUNT FAILED:", err);
      const code = err?.code || "";

      if(code === "auth/email-already-in-use") {
        setStep("signin");
        setSiEmail(caEmail);
        setSiPass("");
        setSiEmailErr("An account with this email already exists. Please sign in.");
      } else if(code === "auth/weak-password") {
        setOtpErr("Password must be at least 6 characters.");
      } else if(code === "auth/invalid-email") {
        setOtpErr("Invalid email address.");
      } else if(code === "auth/operation-not-allowed") {
        setOtpErr("Email/password sign-in is not enabled in Firebase Authentication.");
      } else if(code === "auth/network-request-failed") {
        setOtpErr("Network error. Check your internet connection and try again.");
      } else if(code === "permission-denied" || code === "firestore/permission-denied") {
        setOtpErr("Account was created, but the TraceX profile could not be saved. Check Firestore rules.");
      } else {
        setOtpErr(`Account creation failed: ${code || err?.message || "Unknown error"}`);
      }
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    try {
      const otp = genOtp();
      const email = step === "forgot_otp" ? fpEmail : caEmail;
      await sendOtp(email, otp);
      setGeneratedOtp(otp);
      setEnteredOtp("");
      setOtpErr("");
      setCanResend(false);
      setOtpTimer(60);
    } catch(err: any) {
      setOtpErr(err?.message || "Unable to resend OTP. Please try again.");
    }
  }

  async function saveProfile() {
    setNameErr("");
    if(!name.trim()) { setNameErr("Enter your name."); return; }
    if(hasAbuse(name)) { setNameErr("Please use a respectful name."); return; }
    const auth = getAuth_(); const user = auth?.currentUser; if(!user) { setNameErr("Your session expired. Please sign in again."); return; }
    const db = getDb_();

    let tracexId = genTracexId(); let unique = false;
    while(!unique) {
      const snap = await getDocs(query(collection(db,"users"), where("tracexId","==",tracexId)));
      if(snap.empty) unique = true; else tracexId = genTracexId();
    }

    await updateDoc(doc(db,"users",user.uid), { name, studyType, tracexId, updatedAt: Date.now() });
    localStorage.setItem(`tracex:onboarding:${user.uid}`, JSON.stringify({name, studyType, tracexId}));
    setStep("safety");
  }

  async function handleForgotSendOtp() {
    setFpEmailErr("");
    const email = fpEmail.toLowerCase().trim();
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFpEmailErr("Enter a valid email."); return; }
    setFpLoading(true);
    try {
      const otp = genOtp(); setGeneratedOtp(otp);
      await sendOtp(email, otp);
      setFpEmail(email);
      setEnteredOtp(""); setOtpErr(""); setStep("forgot_otp");
    } catch(err: any) {
      setFpEmailErr(err?.message || "Unable to send OTP. Please try again.");
    } finally { setFpLoading(false); }
  }

  async function handleForgotVerifyOtp() {
    setOtpErr("");
    if(enteredOtp.length < 6) { setOtpErr("Enter the 6-digit OTP."); return; }
    if(enteredOtp !== generatedOtp) { setOtpErr("Incorrect OTP."); return; }
    setFpNewPass(""); setFpNewPass2(""); setFpPassErr(""); setStep("forgot_newpass");
  }

  async function handleForgotSetPassword() {
    setFpPassErr("");
    if(fpNewPass.length < 6) { setFpPassErr("Password must be at least 6 characters."); return; }
    if(fpNewPass !== fpNewPass2) { setFpPassErr("Passwords don't match."); return; }
    setFpSaving(true);
    try {
      const r = await fetch("/api/reset-password", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({email:fpEmail, newPassword:fpNewPass}) });
      if(!r.ok) throw new Error();
      setSiEmail(fpEmail); setSiPass(""); setSiEmailErr(""); setSiPassErr(""); setPwResetOk(true); setStep("signin");
    } catch { setFpPassErr("Failed to update password. Please try again."); }
    finally { setFpSaving(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg">
        {step === "start" && (
          <div style={{backgroundColor:"#1e2433",borderRadius:"16px",padding:"40px 32px",maxWidth:"440px",margin:"0 auto",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
            <h1 className="text-center text-3xl font-black mb-2">Welcome to <span style={{color:"#00d8ff"}}>TraceX</span></h1>
            <p className="text-center text-slate-400 italic mb-8 text-sm">Where chaos turns into clarity</p>
            <p className="text-center font-semibold mb-1">Get Started</p>
            <p className="text-center text-slate-400 text-sm mb-6">Sign in or create a new account to continue.</p>
            <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
              <Button onClick={() => { setStep("signin"); setSiEmailErr(""); setSiPassErr(""); setSiEmail(""); setSiPass(""); setPwResetOk(false); }}>Continue with Email</Button>
              <p className="text-center mt-2 cursor-pointer text-slate-500 hover:text-slate-300 transition text-sm underline" onClick={() => { setStep("create_form"); setCaEmailErr(""); setCaPassErr(""); setCaEmail(""); setCaPass(""); setCaPass2(""); }}>Create a full TraceX account</p>
            </div>
          </div>
        )}

        {step === "signin" && (
          <SectionCard title="Sign In" description="Enter your TraceX email and password.">
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <Input type="email" placeholder="you@gmail.com" value={siEmail} onChange={e=>{setSiEmail(e.target.value);setSiEmailErr("");setPwResetOk(false);}} className={siEmailErr?"border-red-500":""} />
            <Err msg={siEmailErr} />
            <label className="text-sm text-slate-300 mt-4 mb-1 block">Password</label>
            <Input type="password" placeholder="Password" value={siPass} onChange={e=>{setSiPass(e.target.value);setSiPassErr("");setPwResetOk(false);}} className={siPassErr?"border-red-500":""} />
            <Err msg={siPassErr} />
            {pwResetOk && <p className="mt-1 text-xs text-green-400 font-medium">✅ Password reset! Sign in with your new password.</p>}
            <p className="text-xs mt-2 text-right"><span className="text-cyan-400 cursor-pointer hover:underline" onClick={()=>{setFpEmail("");setFpEmailErr("");setPwResetOk(false);setStep("forgot_email");}}>Forgot password?</span></p>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSignIn} disabled={siLoading}>{siLoading?"Signing in…":"Sign In"}</Button>
              <Button variant="ghost" onClick={()=>{setStep("start");setPwResetOk(false);}}>← Back</Button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">Don't have an account? <span className="text-cyan-400 cursor-pointer hover:underline" onClick={()=>{setStep("create_form");setCaEmailErr("");setCaPassErr("");}}>Create one here</span></p>
          </SectionCard>
        )}

        {step === "create_form" && (
          <SectionCard title="Create Your TraceX Account" description="Enter your email and set a password. A 6-digit OTP will be sent to verify.">
            <label className="text-sm text-slate-300 mb-1 block">Email Address</label>
            <Input type="email" placeholder="you@gmail.com" value={caEmail} onChange={e=>{setCaEmail(e.target.value);setCaEmailErr("");}} className={caEmailErr?"border-red-500":""} />
            <Err msg={caEmailErr} />
            <label className="text-sm text-slate-300 mt-4 mb-1 block">Password</label>
            <Input type="password" placeholder="Min. 6 characters" value={caPass} onChange={e=>{setCaPass(e.target.value);setCaPassErr("");}} className={caPassErr?"border-red-500":""} />
            <label className="text-sm text-slate-300 mt-3 mb-1 block">Confirm Password</label>
            <Input type="password" placeholder="Re-enter password" value={caPass2} onChange={e=>{setCaPass2(e.target.value);setCaPassErr("");}} className={caPassErr?"border-red-500":""} />
            <Err msg={caPassErr} />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSendOtp} disabled={caLoading}>{caLoading?"Sending OTP…":"Send OTP to Email"}</Button>
              <Button variant="ghost" onClick={()=>setStep("start")}>← Back</Button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">Already have an account? <span className="text-cyan-400 cursor-pointer hover:underline" onClick={()=>{setStep("signin");setSiEmailErr("");setSiPassErr("");}}>Sign in here</span></p>
          </SectionCard>
        )}

        {step === "create_otp" && (
          <SectionCard title="Enter OTP 📧" description={`A 6-digit OTP has been sent to ${caEmail}. Check your inbox.`}>
            <Input placeholder="Enter 6-digit OTP" value={enteredOtp} inputMode="numeric" maxLength={6} onChange={e=>{setEnteredOtp(e.target.value.replace(/\D/g,""));setOtpErr("");}} className={otpErr?"border-red-500":""} />
            <Err msg={otpErr} />
            {!canResend ? <p className="text-xs text-slate-400 mt-2">Resend OTP in {otpTimer}s</p> : <button className="text-xs text-cyan-400 mt-2 hover:underline" onClick={handleResendOtp}>Resend OTP</button>}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleVerifyOtp} disabled={enteredOtp.length<6||otpLoading}>{otpLoading?"Verifying…":"Verify OTP"}</Button>
              <Button variant="ghost" onClick={()=>{setStep("create_form");setOtpErr("");setEnteredOtp("");}}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {step === "profile" && (
          <SectionCard title="Profile Details" description="Tell us about yourself">
            <Input placeholder="Full Name" value={name} onChange={e=>{setName(e.target.value);setNameErr("");}} className={nameErr?"border-red-500":""} />
            <Err msg={nameErr} />
            <label className="mt-4 mb-2 block text-sm text-slate-300">Where are you studying?</label>
            <Select className="w-full rounded-lg px-4 py-2 bg-slate-900 border border-slate-700 text-white" value={studyType} onChange={e=>setStudyType(e.target.value)}>
              {studyOptions.map(o=><option key={o} value={o}>{o}</option>)}
            </Select>
            <Button className="mt-4" disabled={!name.trim()} onClick={saveProfile}>Continue</Button>
          </SectionCard>
        )}

        {step === "safety" && (
          <SectionCard title="Safety First" description="Accept to continue">
            <p className="text-sm text-slate-300 mb-4">No harmful, abusive, or vulgar content. Violations lead to immediate suspension.</p>
            <Button onClick={()=>router.push("/theme")}>I Accept → Choose Theme</Button>
          </SectionCard>
        )}

        {step === "forgot_email" && (
          <SectionCard title="Reset Password" description="Enter your TraceX account email. We'll send a 6-digit OTP to verify it's you.">
            <label className="text-sm text-slate-300 mb-1 block">Email Address</label>
            <Input type="email" placeholder="you@gmail.com" value={fpEmail} onChange={e=>{setFpEmail(e.target.value);setFpEmailErr("");}} className={fpEmailErr?"border-red-500":""} />
            <Err msg={fpEmailErr} />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleForgotSendOtp} disabled={fpLoading}>{fpLoading?"Sending OTP…":"Send OTP"}</Button>
              <Button variant="ghost" onClick={()=>setStep("signin")}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {step === "forgot_otp" && (
          <SectionCard title="Verify OTP 🔐" description={`A 6-digit OTP has been sent to ${fpEmail}. Enter it below.`}>
            <Input placeholder="Enter 6-digit OTP" value={enteredOtp} inputMode="numeric" maxLength={6} onChange={e=>{setEnteredOtp(e.target.value.replace(/\D/g,""));setOtpErr("");}} className={otpErr?"border-red-500":""} />
            <Err msg={otpErr} />
            {!canResend ? <p className="text-xs text-slate-400 mt-2">Resend OTP in {otpTimer}s</p> : <button className="text-xs text-cyan-400 mt-2 hover:underline" onClick={handleResendOtp}>Resend OTP</button>}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleForgotVerifyOtp} disabled={enteredOtp.length<6||otpLoading}>{otpLoading?"Verifying…":"Verify OTP"}</Button>
              <Button variant="ghost" onClick={()=>{setStep("forgot_email");setEnteredOtp("");setOtpErr("");}}>← Back</Button>
            </div>
          </SectionCard>
        )}

        {step === "forgot_newpass" && (
          <SectionCard title="Set New Password 🔑" description="Create a strong new password for your TraceX account.">
            <label className="text-sm text-slate-300 mb-1 block">New Password</label>
            <Input type="password" placeholder="Min. 6 characters" value={fpNewPass} onChange={e=>{setFpNewPass(e.target.value);setFpPassErr("");}} className={fpPassErr?"border-red-500":""} />
            <label className="text-sm text-slate-300 mt-3 mb-1 block">Re-enter New Password</label>
            <Input type="password" placeholder="Confirm new password" value={fpNewPass2} onChange={e=>{setFpNewPass2(e.target.value);setFpPassErr("");}} className={fpPassErr?"border-red-500":""} />
            <Err msg={fpPassErr} />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleForgotSetPassword} disabled={fpSaving||!fpNewPass||!fpNewPass2}>{fpSaving?"Saving…":"Continue"}</Button>
              <Button variant="ghost" onClick={()=>setStep("forgot_otp")}>← Back</Button>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
