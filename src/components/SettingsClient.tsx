"use client";

import { useState } from "react";

import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import Toggle from "@/components/Toggle";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function SettingsClient() {
  const [notifications, setNotifications] = useState(true);
  const [backup, setBackup] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [mic, setMic] = useState(false);
  const [theme, setTheme] = useState("Dark");

  // --------------------------
  // FIXED — Select uses event
  // --------------------------
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  // --------------------------
  // FIXED — Toggle DOES NOT use event!
  // Toggle passes (value: boolean), not (event)
  // --------------------------
  const handleNotificationsChange = (value: boolean) => {
    setNotifications(value);
  };

  const handleBackupChange = (value: boolean) => {
    setBackup(value);
  };

  const handlePrivacyChange = (value: boolean) => {
    setPrivacyMode(value);
  };

  const handleMicChange = (value: boolean) => {
    setMic(value);
  };

  return (
    <AppShell>
      <PageHeader title="Settings" />

      <SectionCard title="Theme" description="Choose your interface theme">
        <Select value={theme} onChange={handleThemeChange}>
          <option value="Dark">Dark</option>
          <option value="Light">Light</option>
          <option value="AMOLED">AMOLED</option>
        </Select>
      </SectionCard>

      <SectionCard title="Notifications">
        <Toggle checked={notifications} onChange={handleNotificationsChange} />
      </SectionCard>

      <SectionCard title="Cloud Backup">
        <Toggle checked={backup} onChange={handleBackupChange} />
      </SectionCard>

      <SectionCard title="Privacy Mode">
        <Toggle checked={privacyMode} onChange={handlePrivacyChange} />
      </SectionCard>

      <SectionCard title="Mic Access">
        <Toggle checked={mic} onChange={handleMicChange} />
      </SectionCard>

      <Button>Save Settings</Button>
    </AppShell>
  );
}