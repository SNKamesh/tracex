"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";

const THEME_KEY = "tracex:theme";

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width: "48px", height: "26px", borderRadius: "999px",
      backgroundColor: checked ? "#3B82F6" : "#374151",
      position: "relative", cursor: "pointer",
      transition: "background-color 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: "3px",
        left: checked ? "25px" : "3px",
        width: "20px", height: "20px", borderRadius: "50%",
        backgroundColor: "white", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }} />
    </div>
  );
}

function SettingRow({ icon, title, description, children, last = false }: {
  icon: string; title: string; description?: string; children: React.ReactNode; last?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "16px", borderBottom: last ? "none" : "1px solid #1F2937",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          backgroundColor: "#1F2937", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "18px",
        }}>{icon}</div>
        <div>
          <div style={{ color: "white", fontWeight: 500 }}>{title}</div>
          {description && <div style={{ color: "#6B7280", fontSize: "12px", marginTop: "2px" }}>{description}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{
        color: "#6B7280", fontSize: "11px", fontWeight: 600,
        letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px",
      }}>{title}</div>
      <div style={{
        backgroundColor: "#111827", borderRadius: "14px",
        overflow: "hidden", border: "1px solid #1F2937",
      }}>{children}</div>
    </div>
  );
}

export default function SettingsClient() {
  const [notifications, setNotifications] = useState(true);
  const [backup, setBackup] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [mic, setMic] = useState(false);
  const [theme, setTheme] = useState("amoled");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || "amoled";
    setTheme(saved);
  }, []);

  function handleThemeChange(val: string) {
    setTheme(val);
    localStorage.setItem(THEME_KEY, val);
    window.dispatchEvent(new CustomEvent("tracex-theme-change", { detail: val }));
  }

  function handleSignOut() {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    import("firebase/auth").then(({ getAuth, signOut }) => {
      const auth = getAuth();
      signOut(auth).then(() => {
        localStorage.clear();
        window.location.replace("/");
      }).catch((err) => {
        console.error("Sign out error:", err);
        // Force redirect even if signOut fails
        localStorage.clear();
        window.location.replace("/");
      });
    });
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell>
      <div style={{ padding: "24px", maxWidth: "700px", margin: "0 auto" }}>
        <PageHeader title="Settings" />

        <Section title="APPEARANCE">
          <SettingRow icon="🌙" title="Theme" description="Choose your interface theme" last>
            <select value={theme} onChange={(e) => handleThemeChange(e.target.value)} style={{
              padding: "8px 12px", backgroundColor: "#1F2937", color: "white",
              border: "1px solid #374151", borderRadius: "8px", fontSize: "14px",
              cursor: "pointer", outline: "none",
            }}>
              <option value="amoled">⚫ AMOLED</option>
              <option value="dark">🌑 Dark</option>
              <option value="light">☀️ Light</option>
            </select>
          </SettingRow>
        </Section>

        <Section title="PREFERENCES">
          <SettingRow icon="🔔" title="Notifications" description="Study reminders and alerts">
            <ToggleSwitch checked={notifications} onChange={setNotifications} />
          </SettingRow>
          <SettingRow icon="☁️" title="Cloud Backup" description="Auto-sync your data" last>
            <ToggleSwitch checked={backup} onChange={setBackup} />
          </SettingRow>
        </Section>

        <Section title="PRIVACY & SECURITY">
          <SettingRow icon="🛡️" title="Privacy Mode" description="Hide your activity from friends">
            <ToggleSwitch checked={privacyMode} onChange={setPrivacyMode} />
          </SettingRow>
          <SettingRow icon="🎙️" title="Mic Access (18+)" description="Required for group sessions" last>
            <ToggleSwitch checked={mic} onChange={setMic} />
          </SettingRow>
        </Section>

        <Section title="ACCOUNT">
          <SettingRow icon="👤" title="Profile" description="Edit your name and study type">
            <span style={{ color: "#3B82F6", fontSize: "14px", cursor: "pointer" }}>Edit →</span>
          </SettingRow>
          <SettingRow icon="💎" title="Subscription" description="Freemium Plan">
            <span style={{
              backgroundColor: "#1D4ED8", color: "white",
              padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600,
            }}>Upgrade</span>
          </SettingRow>
          <SettingRow icon="🗑️" title="Clear Cache" description="Free up local storage" last>
            <span style={{ color: "#EF4444", fontSize: "14px", cursor: "pointer" }}>Clear</span>
          </SettingRow>
        </Section>

        <Section title="ABOUT">
          <SettingRow icon="ℹ️" title="Version" description="TraceX v1.0.0">
            <span style={{ color: "#6B7280", fontSize: "13px" }}>Beta</span>
          </SettingRow>
          <SettingRow icon="📄" title="Terms of Service" last>
            <span style={{ color: "#3B82F6", fontSize: "14px", cursor: "pointer" }}>View →</span>
          </SettingRow>
        </Section>

        <button onClick={handleSave} style={{
          width: "100%", padding: "14px",
          backgroundColor: saved ? "#16A34A" : "#3B82F6",
          color: "white", border: "none", borderRadius: "12px",
          fontWeight: "bold", fontSize: "16px", cursor: "pointer",
          transition: "background-color 0.3s", marginTop: "8px",
        }}>
          {saved ? "✅ Settings Saved!" : "Save Settings"}
        </button>

        <button onClick={handleSignOut} style={{
          width: "100%", padding: "14px",
          backgroundColor: "transparent",
          color: "#EF4444", border: "1px solid #EF4444",
          borderRadius: "12px", fontWeight: "bold",
          fontSize: "16px", cursor: "pointer", marginTop: "12px",
        }}>
          Sign Out
        </button>

      </div>
    </AppShell>
  );
}