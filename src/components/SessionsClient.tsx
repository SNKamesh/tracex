"use client";

import AppShell from "./AppShell";
import PageHeader from "./PageHeader";
import FocusLobby from "./session/FocusLobby";

export default function SessionsClient() {
  return (
    <AppShell>
      <PageHeader
        title="Study sessions"
        subtitle="Choose a personal focus environment, run your timer, and save your completed session."
      />
      <FocusLobby />
    </AppShell>
  );
}
