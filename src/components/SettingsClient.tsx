"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Bell, Cloud, EyeOff, LogOut, Mic, Palette, Save, ShieldCheck } from "lucide-react";
import { signOut } from "firebase/auth";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import Select from "@/components/Select";
import { auth } from "@/lib/firebase";

const THEME_KEY = "tracex:theme";
const PREFS_KEY = "tracex:preferences";

type Preferences = { backup: boolean; privacyMode: boolean; mic: boolean };

function applyTheme(themeKey: string) {
  document.documentElement.dataset.theme = themeKey;
  document.documentElement.style.colorScheme = themeKey === "light" ? "light" : "dark";
  document.body.classList.remove("tracex-theme-amoled", "tracex-theme-dark", "tracex-theme-light");
  document.body.classList.add(\`tracex-theme-\${themeKey}\`);
  window.dispatchEvent(new CustomEvent("tracex-theme-change", { detail: themeKey }));
}

function PreferenceRow({ icon: Icon, title, description, children }: { icon: typeof Bell; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: "var(--background-soft)", color: "var(--primary)" }}><Icon size={17} /></span>
        <span><span className="block text-[13px] font-semibold">{title}</span><span className="mt-1 block max-w-lg text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>{description}</span></span>
      </div>
      <div className="sm:min-w-[180px] sm:max-w-[230px]">{children}</div>
    </div>
  );
}

export default function SettingsClient() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(false);
  const [backup, setBackup] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [mic, setMic] = useState(false);
  const [theme, setTheme] = useState("amoled");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || "amoled";
    setTheme(savedTheme);
    applyTheme(savedTheme);
    try {
      const stored = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") as Partial<Preferences>;
      setBackup(Boolean(stored.backup));
      setPrivacyMode(Boolean(stored.privacyMode));
      setMic(Boolean(stored.mic));
    } catch {
      localStorage.removeItem(PREFS_KEY);
    }
    if ("Notification" in window) setNotifications(Notification.permission === "granted");
  }, []);

  async function handleNotificationToggle(next: boolean) {
    if (!("Notification" in window)) {
      setMessage("This browser does not support notifications.");
      return;
    }
    if (!next) {
      setMessage("To revoke notification permission, use your browser's site settings.");
      setNotifications(Notification.permission === "granted");
      return;
    }
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    setNotifications(permission === "granted");
    setMessage(permission === "granted" ? "Study reminders are allowed in this browser." : "Notification permission was not granted.");
  }

  function handleThemeChange(value: string) {
    setTheme(value);
    localStorage.setItem(THEME_KEY, value);
    applyTheme(value);
  }

  function savePreferences() {
    const preferences: Preferences = { backup, privacyMode, mic };
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
    setSaved(true);
    setMessage("Preferences saved in this browser.");
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function handleSignOut() {
    if (!window.confirm("Are you sure you want to sign out?")) return;
    try {
      await signOut(auth);
      await router.replace("/");
    } catch (error) {
      console.error("Unable to sign out", error);
      setMessage("Sign out failed. Please try again.");
    }
  }

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Shape your workspace and manage local preferences." />
      <div className="mx-auto max-w-[850px] space-y-5">
        <section className="tx-card overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 text-[13px] font-semibold"><Palette size={16} style={{ color: "var(--primary)" }} /> Appearance</div>
          </div>
          <PreferenceRow icon={Palette} title="Theme" description="Choose the visual palette used across TraceX.">
            <Select value={theme} onChange={(event) => handleThemeChange(event.target.value)}>
              <option value="amoled">AMOLED</option><option value="dark">Dark charcoal</option><option value="light">Warm light</option>
            </Select>
          </PreferenceRow>
        </section>

        <section className="tx-card overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 text-[13px] font-semibold"><Bell size={16} style={{ color: "var(--primary)" }} /> Preferences</div>
          </div>
          <PreferenceRow icon={Bell} title="Notifications" description="Browser permission for study reminders.">
            <Toggle checked={notifications} onChange={handleNotificationToggle} label={notifications ? "Allowed" : "Not enabled"} />
          </PreferenceRow>
          <PreferenceRow icon={Cloud} title="Cloud backup" description="This preference is stored locally; automated backup syncing is not connected yet.">
            <Toggle checked={backup} onChange={setBackup} label={backup ? "Preference on" : "Preference off"} />
          </PreferenceRow>
        </section>

        <section className="tx-card overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 text-[13px] font-semibold"><ShieldCheck size={16} style={{ color: "var(--primary)" }} /> Privacy & access</div>
          </div>
          <PreferenceRow icon={EyeOff} title="Privacy mode" description="Saved as a local preference only; friend-visibility enforcement is not connected yet.">
            <Toggle checked={privacyMode} onChange={setPrivacyMode} label={privacyMode ? "Preference on" : "Preference off"} />
          </PreferenceRow>
          <PreferenceRow icon={Mic} title="Microphone preference" description="This is a saved preference only. Microphone permission is requested when a feature needs it.">
            <Toggle checked={mic} onChange={setMic} label={mic ? "Preference on" : "Preference off"} />
          </PreferenceRow>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 text-[11px]" style={{ color: "var(--muted)" }} aria-live="polite">{message}</div>
          <div className="flex gap-2">
            <Button onClick={savePreferences}><Save size={15} />{saved ? "Saved" : "Save preferences"}</Button>
            <Button variant="secondary" onClick={handleSignOut}><LogOut size={15} />Sign out</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
