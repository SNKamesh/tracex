"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Globe2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { onSnapshot, doc, setDoc } from "firebase/firestore";
import AppShell from "./AppShell";
import PageHeader from "./PageHeader";
import Button from "./Button";
import Input from "./Input";
import SectionCard from "./SectionCard";
import { auth, db } from "@/lib/firebase";

type ExtensionMessage = { source?: string; type?: string; state?: { blockedSites?: string[]; beastMode?: boolean } };

function normalizeDomain(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : "https://" + trimmed);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!hostname.includes(".") || hostname.startsWith(".") || hostname.endsWith(".")) return "";
    return hostname;
  } catch {
    return "";
  }
}

export default function BlockerClient() {
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [sites, setSites] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [extensionConnected, setExtensionConnected] = useState(false);
  const sitesRef = useRef<string[]>([]);
  const cloudLoadedRef = useRef(false);
  const cloudHasDocumentRef = useRef(false);
  const extensionConnectedRef = useRef(false);
  const blockerDocRef = useRef<ReturnType<typeof doc> | null>(null);

  useEffect(() => { sitesRef.current = sites; }, [sites]);
  useEffect(() => { extensionConnectedRef.current = extensionConnected; }, [extensionConnected]);

  useEffect(() => {
    let unsubscribeCloud: (() => void) | undefined;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      unsubscribeCloud?.();
      unsubscribeCloud = undefined;
      cloudLoadedRef.current = false;
      cloudHasDocumentRef.current = false;
      setCloudReady(false);
      setUid(user?.uid ?? null);
      setSites([]);
      if (!user) {
        setAuthReady(true);
        setError("Sign in to sync your blocked-site list across devices.");
        return;
      }
      const blockerRef = doc(db, "users", user.uid, "settings", "blocker");
      blockerDocRef.current = blockerRef;
      unsubscribeCloud = onSnapshot(blockerRef, (snapshot) => {
        const nextSites = snapshot.exists() && Array.isArray(snapshot.data().blockedSites)
          ? snapshot.data().blockedSites.filter((value: unknown): value is string => typeof value === "string")
          : [];
        cloudHasDocumentRef.current = snapshot.exists();
        cloudLoadedRef.current = true;
        setSites(nextSites);
        setCloudReady(true);
        setError("");
        if (extensionConnectedRef.current) {
          window.postMessage({ source: "tracex-web", type: "SET_BLOCKER_STATE", state: { blockedSites: nextSites } }, window.location.origin);
        }
      }, (syncError) => {
        console.error("Blocker list sync failed", syncError);
        setError("Could not sync your blocked sites. Check your Firestore access and connection.");
        setCloudReady(true);
      });
      setAuthReady(true);
    });
    return () => {
      unsubscribeAuth();
      unsubscribeCloud?.();
    };
  }, []);

  useEffect(() => {
    function handleExtensionMessage(event: MessageEvent<ExtensionMessage>) {
      if (event.source !== window || event.origin !== window.location.origin || event.data?.source !== "tracex-extension") return;
      if (event.data.type === "READY") {
        setExtensionConnected(true);
        extensionConnectedRef.current = true;
        window.postMessage({ source: "tracex-web", type: "GET_BLOCKER_STATE" }, window.location.origin);
        return;
      }
      if (event.data.type === "BLOCKER_STATE") {
        const extensionSites = Array.isArray(event.data.state?.blockedSites)
          ? event.data.state.blockedSites.filter((value): value is string => typeof value === "string")
          : [];
        if (!cloudLoadedRef.current) return;
        if (!cloudHasDocumentRef.current && extensionSites.length && blockerDocRef.current) {
          void setDoc(blockerDocRef.current, { blockedSites: extensionSites, updatedAt: Date.now() }, { merge: true });
        } else {
          window.postMessage({ source: "tracex-web", type: "SET_BLOCKER_STATE", state: { blockedSites: sitesRef.current } }, window.location.origin);
        }
      }
      if (event.data.type === "SYNC_SAVED") {
        setNotice("Your blocked-site list is synced with the Chrome extension.");
      }
    }

    window.addEventListener("message", handleExtensionMessage);
    // The content script may run before the React page is hydrated, so retry the handshake briefly.
    window.postMessage({ source: "tracex-web", type: "GET_BLOCKER_STATE" }, window.location.origin);
    const handshake = window.setInterval(() => {
      if (extensionConnectedRef.current) {
        window.clearInterval(handshake);
        return;
      }
      window.postMessage({ source: "tracex-web", type: "GET_BLOCKER_STATE" }, window.location.origin);
    }, 1500);
    return () => {
      window.clearInterval(handshake);
      window.removeEventListener("message", handleExtensionMessage);
    };
  }, []);

  async function persistSites(nextSites: string[]) {
    if (!uid || !blockerDocRef.current) {
      setError("Sign in to save your blocked-site list.");
      return false;
    }
    setSites(nextSites);
    setError("");
    try {
      await setDoc(blockerDocRef.current, { blockedSites: nextSites, updatedAt: Date.now() }, { merge: true });
      setNotice(extensionConnected
        ? "Blocked sites saved and sent to the connected Chrome extension."
        : "Blocked sites saved to your TraceX account. Connect the Chrome extension to enforce them in your browser.");
      return true;
    } catch (writeError) {
      console.error("Could not save blocked sites", writeError);
      setError("Could not save this list. Please try again.");
      return false;
    }
  }

  async function addSite() {
    const domain = normalizeDomain(input);
    if (!domain) { setError("Enter a valid domain, such as youtube.com."); setNotice(""); return; }
    if (sites.includes(domain)) { setError("That domain is already in this list."); setNotice(""); return; }
    const saved = await persistSites([...sites, domain]);
    if (saved) setInput("");
  }

  async function removeSite(site: string) {
    await persistSites(sites.filter((item) => item !== site));
  }

  const siteCount = useMemo(() => sites.length, [sites]);

  return (
    <AppShell>
      <PageHeader title="Website blocker" subtitle="Manage the sites you want to keep out of your study time." />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <SectionCard title="Blocked domains" description="Changes sync to your TraceX account and, when installed, the Chrome extension.">
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void addSite(); }}>
            <Input value={input} onChange={(event) => { setInput(event.target.value); setError(""); }} placeholder="youtube.com" aria-label="Website domain" />
            <Button type="submit" className="shrink-0" disabled={!authReady || !uid || !cloudReady}><Plus size={15} /> Add domain</Button>
          </form>
          {error && <p role="alert" className="mt-2 text-[12px]" style={{ color: "var(--danger)" }}>{error}</p>}
          {notice && <p aria-live="polite" className="mt-2 text-[12px]" style={{ color: "var(--success)" }}>{notice}</p>}
          {!authReady || !cloudReady ? <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>Loading your synced blocker list…</p> : null}
          <div className="mt-5 divide-y rounded-xl border" style={{ borderColor: "var(--border)" }}>
            {sites.length === 0 ? <div className="px-4 py-10 text-center">
              <Globe2 size={24} className="mx-auto" style={{ color: "var(--muted)" }} />
              <p className="mt-3 text-[13px] font-semibold">Your list is empty</p>
              <p className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>Add a domain to start building your distraction list.</p>
            </div> : sites.map((site) => <div key={site} className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderColor: "var(--border)" }}>
              <span className="flex min-w-0 items-center gap-2 break-all text-[13px]"><Globe2 size={15} className="shrink-0" style={{ color: "var(--muted)" }} />{site}</span>
              <button type="button" onClick={() => void removeSite(site)} aria-label={"Remove " + site} className="rounded-lg p-2 transition-colors hover:bg-[var(--surface-hover)]" style={{ color: "var(--muted)" }}><Trash2 size={15} /></button>
            </div>)}
          </div>
        </SectionCard>
        <div className="space-y-4">
          <div className="tx-card p-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold"><ShieldCheck size={17} style={{ color: "var(--primary)" }} /> Blocker status</div>
            <p className="mt-4 text-[30px] font-semibold tracking-tight">{siteCount}</p>
            <p className="text-[11px]" style={{ color: "var(--muted)" }}>domains saved to your account</p>
            <div className="mt-4 flex items-center gap-2 text-[11px]" style={{ color: extensionConnected ? "var(--success)" : "var(--muted)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: extensionConnected ? "var(--success)" : "var(--muted)" }} />
              {extensionConnected ? "Chrome extension connected" : "Chrome extension not detected"}
            </div>
          </div>
          <div className="rounded-xl border p-4 text-[12px] leading-relaxed" style={{ borderColor: "var(--border)", background: "var(--background-soft)", color: "var(--muted)" }}>
            <p className="font-semibold" style={{ color: "var(--text)" }}>How enforcement works</p>
            <p className="mt-2">Your list is stored in Firestore and synced to the TraceX Chrome extension when it is installed, reloaded and active on this website. Blocking happens in the extension, not inside this page.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
