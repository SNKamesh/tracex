"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Bell, Download, EyeOff, LogOut, Mic, Palette, ShieldCheck } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import Select from "@/components/Select";
import { auth, db } from "@/lib/firebase";
import { api } from "@/lib/api";

const THEME_KEY = "tracex:theme";

function applyTheme(themeKey: string) {
  const safeTheme = ["amoled", "dark", "light"].includes(themeKey) ? themeKey : "amoled";
  document.documentElement.dataset.theme = safeTheme;
  document.documentElement.style.colorScheme = safeTheme === "light" ? "light" : "dark";
  document.body.classList.remove("tracex-theme-amoled", "tracex-theme-dark", "tracex-theme-light");
  document.body.classList.add(`tracex-theme-${safeTheme}`);
  window.dispatchEvent(new CustomEvent("tracex-theme-change", { detail: safeTheme }));
}

function PreferenceRow({ icon: Icon, title, description, children }: { icon: typeof Bell; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: "var(--background-soft)", color: "var(--primary)" }}><Icon size={17} /></span>
        <span><span className="block text-[13px] font-semibold">{title}</span><span className="mt-1 block max-w-lg text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>{description}</span></span>
      </div>
      <div className="sm:min-w-[180px] sm:max-w-[250px]">{children}</div>
    </div>
  );
}

export default function SettingsClient() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [micStatus, setMicStatus] = useState<"unknown" | "granted" | "denied" | "unsupported">("unknown");
  const [theme, setTheme] = useState("amoled");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || "amoled";
    setTheme(savedTheme);
    applyTheme(savedTheme);
    if ("Notification" in window) setNotifications(Notification.permission === "granted");

    let profileUnsubscribe: (() => void) | undefined;
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      profileUnsubscribe?.();
      profileUnsubscribe = undefined;
      setUid(user?.uid ?? null);
      if (!user) return;
      try {
        const snapshot = await getDoc(doc(db, "users", user.uid));
        setPrivacyMode(Boolean(snapshot.data()?.hideOnlineStatus));
      } catch (error) {
        console.error("Could not load privacy setting", error);
      }
    });
    return () => {
      authUnsubscribe();
      profileUnsubscribe?.();
    };
  }, []);

  async function handleNotificationToggle(next: boolean) {
    if (!("Notification" in window)) {
      setMessage("This browser does not support desktop notifications.");
      return;
    }
    if (!next) {
      setMessage("To revoke notification permission, use TraceX's browser site settings.");
      setNotifications(Notification.permission === "granted");
      return;
    }
    try {
      const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      setNotifications(permission === "granted");
      setMessage(permission === "granted"
        ? "Browser notifications are allowed. Keep TraceX open for scheduled reminders."
        : "Notification permission was not granted.");
    } catch (error) {
      console.error("Notification permission request failed", error);
      setMessage("Could not request notification permission. Check your browser's site settings.");
    }
  }

  function handleThemeChange(value: string) {
    setTheme(value);
    localStorage.setItem(THEME_KEY, value);
    applyTheme(value);
    setMessage("Theme updated.");
  }

  async function handlePrivacyToggle(next: boolean) {
    if (!uid) {
      setMessage("Sign in again to update your privacy setting.");
      return;
    }
    const previous = privacyMode;
    setPrivacyMode(next);
    setMessage("");
    try {
      await setDoc(doc(db, "users", uid), { hideOnlineStatus: next }, { merge: true });
      setMessage(next
        ? "Online status is hidden from your TraceX friends."
        : "Your online status can be shown to your TraceX friends.");
    } catch (error) {
      console.error("Could not update online visibility", error);
      setPrivacyMode(previous);
      setMessage("Could not save your privacy setting. Please try again.");
    }
  }

  async function checkMicrophoneAccess() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("unsupported");
      setMessage("Microphone access is not available in this browser or page context.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus("granted");
      setMessage("Microphone permission is granted. TraceX did not record or upload audio.");
    } catch (error) {
      console.error("Microphone permission check failed", error);
      setMicStatus("denied");
      setMessage("Microphone access was not granted. Check the browser's site permissions.");
    }
  }

  async function exportData() {
    if (!uid || busy) {
      setMessage("Sign in before exporting your TraceX data.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const [profileSnapshot, plansSnapshot] = await Promise.all([
        getDoc(doc(db, "users", uid)),
        getDocs(query(collection(db, "users", uid, "studyPlans"), orderBy("order"))),
      ]);

      let sessions: unknown[] = [];
      let sessionHistoryNote = "";
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          const response = await api.get<{ sessions?: unknown[] }>("/api/sessions", token);
          sessions = Array.isArray(response.sessions) ? response.sessions : [];
        }
      } catch (sessionError) {
        console.error("Session history could not be included in export", sessionError);
        sessionHistoryNote = " Session history could not be retrieved from the session service.";
      }

      const payload = {
        product: "TraceX",
        formatVersion: 1,
        exportedAt: new Date().toISOString(),
        profile: profileSnapshot.exists() ? profileSnapshot.data() : null,
        studyPlans: plansSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        sessions,
        note: "This export contains your profile and study plans plus any session history returned by the session service. It is a data export, not an automatic cloud backup." + sessionHistoryNote,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tracex-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Your TraceX data export was generated." + sessionHistoryNote);
    } catch (error) {
      console.error("Data export failed", error);
      setMessage("Could not export your data. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
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
      <PageHeader title="Settings" subtitle="Manage your appearance, privacy, browser permissions and data." />
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
            <div className="flex items-center gap-2 text-[13px] font-semibold"><Bell size={16} style={{ color: "var(--primary)" }} /> Notifications</div>
          </div>
          <PreferenceRow icon={Bell} title="Browser notifications" description="Allow TraceX to show study reminders in this browser. Keep a TraceX tab open for scheduled reminders.">
            <Toggle checked={notifications} onChange={handleNotificationToggle} label={notifications ? "Allowed" : "Not enabled"} />
          </PreferenceRow>
        </section>

        <section className="tx-card overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 text-[13px] font-semibold"><ShieldCheck size={16} style={{ color: "var(--primary)" }} /> Privacy & access</div>
          </div>
          <PreferenceRow icon={EyeOff} title="Hide online status" description="When enabled, friends see you as offline. This setting is saved to your TraceX profile.">
            <Toggle checked={privacyMode} onChange={handlePrivacyToggle} label={privacyMode ? "Hidden" : "Visible"} />
          </PreferenceRow>
          <PreferenceRow icon={Mic} title="Microphone permission" description="Test browser permission. Audio is not recorded or uploaded by this check.">
            <Button variant="secondary" onClick={() => void checkMicrophoneAccess()} disabled={!uid}>{micStatus === "granted" ? "Permission granted" : micStatus === "denied" ? "Try again" : micStatus === "unsupported" ? "Not supported" : "Check microphone"}</Button>
          </PreferenceRow>
        </section>

        <section className="tx-card overflow-hidden">
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 text-[13px] font-semibold"><Download size={16} style={{ color: "var(--primary)" }} /> Your data</div>
          </div>
          <PreferenceRow icon={Download} title="Export TraceX data" description="Download a JSON copy of your profile, study plans and available saved session history. This is a manual export, not automatic cloud backup.">
            <Button onClick={() => void exportData()} disabled={busy || !uid}><Download size={15} />{busy ? "Preparing…" : "Download data"}</Button>
          </PreferenceRow>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 text-[11px]" style={{ color: "var(--muted)" }} aria-live="polite">{message}</div>
          <Button variant="secondary" onClick={handleSignOut}><LogOut size={15} />Sign out</Button>
        </div>
      </div>
    </AppShell>
  );
}
