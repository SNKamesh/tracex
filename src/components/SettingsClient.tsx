"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";

const THEME_KEY = "tracex:theme";

// ─── UNIVERSAL GLASS COMPONENTS ───────────────────────────────────
// These adapt to any background to prevent "glitchy" hardcoded colors.

function Section({ title, children, isLight }: { title: string; children: React.ReactNode; isLight: boolean }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ 
        color: isLight ? "#6B7280" : "#9CA3AF", 
        fontSize: "11px", 
        fontWeight: 700, 
        letterSpacing: "0.05em", 
        marginBottom: "10px", 
        paddingLeft: "4px",
        textTransform: "uppercase" 
      }}>{title}</div>
      <div style={{
        // Uses translucency so it looks natural on both the Cyber Grid and White backgrounds
        backgroundColor: isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(15, 23, 42, 0.6)", 
        borderRadius: "18px", 
        overflow: "hidden", 
        border: `1px solid ${isLight ? "#E5E7EB" : "#1E293B"}`,
        backdropFilter: "blur(12px)", 
        transition: "all 0.3s ease",
        boxShadow: isLight ? "0 4px 12px rgba(0,0,0,0.05)" : "none"
      }}>{children}</div>
    </div>
  );
}

function SettingRow({ icon, title, description, children, last = false, isLight }: { 
  icon: string; title: string; description?: string; children: React.ReactNode; last?: boolean; isLight: boolean; 
}) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center", 
      padding: "18px", 
      borderBottom: last ? "none" : `1px solid ${isLight ? "#F3F4F6" : "#1E293B"}` 
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          borderRadius: "12px", 
          backgroundColor: isLight ? "#F3F4F6" : "#0F172A", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontSize: "20px" 
        }}>{icon}</div>
        <div>
          <div style={{ color: isLight ? "#111827" : "#F8FAFC", fontWeight: 600, fontSize: "14px" }}>{title}</div>
          {description && <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>{description}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, isLight }: { checked: boolean; onChange: (v: boolean) => void; isLight: boolean }) {
  return (
    <div 
      onClick={() => onChange(!checked)} 
      style={{ 
        width: "44px", 
        height: "24px", 
        borderRadius: "999px", 
        backgroundColor: checked ? "#10B981" : (isLight ? "#D1D5DB" : "#374151"), 
        position: "relative", 
        cursor: "pointer", 
        transition: "0.3s ease-in-out" 
      }}
    >
      <div style={{ 
        position: "absolute", 
        top: "2px", 
        left: checked ? "22px" : "2px", 
        width: "20px", 
        height: "20px", 
        borderRadius: "50%", 
        backgroundColor: "white", 
        transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
      }} />
    </div>
  );
}

// ─── MAIN SETTINGS CLIENT ─────────────────────────────────────────

export default function SettingsClient() {
  const [notifications, setNotifications] = useState(false);
  const [backup, setBackup] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [mic, setMic] = useState(false);
  const [theme, setTheme] = useState("amoled");
  const [saved, setSaved] = useState(false);

  const isLight = theme === "light";

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || "amoled";
    setTheme(savedTheme);

    if ("Notification" in window) {
      setNotifications(Notification.permission === "granted");
    }
  }, []);

  async function handleNotificationToggle() {
    if (!("Notification" in window)) return alert("Browser does not support notifications.");
    
    if (Notification.permission === "granted") {
      alert("To disable notifications, check your browser settings.");
      setNotifications(true);
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifications(true);
        new Notification("TraceX", { body: "Study reminders active! 🎉" });
      }
    }
  }

  function handleThemeChange(val: string) {
    setTheme(val);
    localStorage.setItem(THEME_KEY, val);
    window.dispatchEvent(new CustomEvent("tracex-theme-change", { detail: val }));
  }

  function handleSignOut() {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    const { initializeApp, getApps, getApp } = require("firebase/app");
    const { getAuth, signOut } = require("firebase/auth");
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    
    signOut(auth).finally(() => {
      localStorage.clear();
      window.location.replace("/");
    });
  }

  return (
    <AppShell>
      <div style={{ padding: "24px", maxWidth: "700px", margin: "0 auto" }}>
        <PageHeader title="Settings" />

        <Section title="Appearance" isLight={isLight}>
          <SettingRow icon="🌙" title="Theme" description="Choose your interface style" last isLight={isLight}>
            <select 
              value={theme} 
              onChange={(e) => handleThemeChange(e.target.value)} 
              style={{
                padding: "8px 12px", 
                backgroundColor: isLight ? "#F9FAFB" : "#1F2937", 
                color: isLight ? "#111827" : "white",
                border: `1px solid ${isLight ? "#E5E7EB" : "#374151"}`, 
                borderRadius: "8px", 
                fontSize: "14px", 
                cursor: "pointer", 
                outline: "none"
              }}
            >
              <option value="amoled">⚫ AMOLED</option>
              <option value="dark">🌑 Dark</option>
              <option value="light">☀️ Light</option>
            </select>
          </SettingRow>
        </Section>

        <Section title="Preferences" isLight={isLight}>
          <SettingRow icon="🔔" title="Notifications" description="Study reminders and alerts" isLight={isLight}>
            <ToggleSwitch checked={notifications} onChange={handleNotificationToggle} isLight={isLight} />
          </SettingRow>
          <SettingRow icon="☁️" title="Cloud Backup" description="Auto-sync your data" last isLight={isLight}>
            <ToggleSwitch checked={backup} onChange={setBackup} isLight={isLight} />
          </SettingRow>
        </Section>

        <Section title="Privacy & Security" isLight={isLight}>
          <SettingRow icon="🛡️" title="Privacy Mode" description="Hide activity from friends" isLight={isLight}>
            <ToggleSwitch checked={privacyMode} onChange={setPrivacyMode} isLight={isLight} />
          </SettingRow>
          <SettingRow icon="🎙️" title="Mic Access (18+)" description="Required for group sessions" last isLight={isLight}>
            <ToggleSwitch checked={mic} onChange={setMic} isLight={isLight} />
          </SettingRow>
        </Section>

        <button 
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} 
          style={{
            width: "100%", 
            padding: "14px",
            backgroundColor: saved ? "#10B981" : "#3B82F6",
            color: "white", 
            border: "none", 
            borderRadius: "14px",
            fontWeight: "bold", 
            fontSize: "16px", 
            cursor: "pointer",
            transition: "0.3s", 
            marginTop: "8px"
          }}
        >
          {saved ? "✅ Settings Saved!" : "Save Settings"}
        </button>

        <button 
          onClick={handleSignOut} 
          style={{
            width: "100%", 
            padding: "14px",
            backgroundColor: "transparent",
            color: "#EF4444", 
            border: `1px solid ${isLight ? "#FECACA" : "#7F1D1D"}`,
            borderRadius: "14px", 
            fontWeight: "bold", 
            fontSize: "16px", 
            cursor: "pointer", 
            marginTop: "12px",
            transition: "0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isLight ? "#FEF2F2" : "#450a0a"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          Sign Out
        </button>
      </div>
    </AppShell>
  );
}