"use client";

import { useMemo, useState } from "react";
import { Globe2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import AppShell from "./AppShell";
import PageHeader from "./PageHeader";
import Button from "./Button";
import Input from "./Input";
import SectionCard from "./SectionCard";

function normalizeDomain(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : \`https://\${trimmed}\`);
    return parsed.hostname.replace(/^www\\./, "");
  } catch {
    return "";
  }
}

export default function BlockerClient() {
  const [sites, setSites] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const addSite = () => {
    const domain = normalizeDomain(input);
    if (!domain) { setError("Enter a valid domain, such as youtube.com."); setNotice(""); return; }
    if (sites.includes(domain)) { setError("That domain is already in this list."); setNotice(""); return; }
    setSites((current) => [...current, domain]);
    setInput("");
    setError("");
    setNotice(\`\${domain} added to this page's list.\`);
  };

  const removeSite = (site: string) => {
    setSites((current) => current.filter((item) => item !== site));
    setNotice(\`\${site} removed.\`);
  };

  const siteCount = useMemo(() => sites.length, [sites]);

  return (
    <AppShell>
      <PageHeader title="Website blocker" subtitle="Keep distracting websites out of your study time." />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <SectionCard title="Blocked domains" description="Build a list of sites you want to avoid during a focus block.">
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); addSite(); }}>
            <Input value={input} onChange={(event) => { setInput(event.target.value); setError(""); }} placeholder="youtube.com" aria-label="Website domain" />
            <Button type="submit" className="shrink-0"><Plus size={15} /> Add domain</Button>
          </form>
          {error && <p role="alert" className="mt-2 text-[12px]" style={{ color: "var(--danger)" }}>{error}</p>}
          {notice && <p aria-live="polite" className="mt-2 text-[12px]" style={{ color: "var(--success)" }}>{notice}</p>}
          <div className="mt-5 divide-y rounded-xl border" style={{ borderColor: "var(--border)" }}>
            {sites.length === 0 ? <div className="px-4 py-10 text-center">
              <Globe2 size={24} className="mx-auto" style={{ color: "var(--muted)" }} />
              <p className="mt-3 text-[13px] font-semibold">Your list is empty</p>
              <p className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>Add a domain to start building your distraction list.</p>
            </div> : sites.map((site) => <div key={site} className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderColor: "var(--border)" }}>
              <span className="flex items-center gap-2 text-[13px]"><Globe2 size={15} style={{ color: "var(--muted)" }} />{site}</span>
              <button type="button" onClick={() => removeSite(site)} aria-label={\`Remove \${site}\`} className="rounded-lg p-2 transition-colors hover:bg-[var(--surface-hover)]" style={{ color: "var(--muted)" }}><Trash2 size={15} /></button>
            </div>)}
          </div>
        </SectionCard>
        <div className="space-y-4">
          <div className="tx-card p-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold"><ShieldCheck size={17} style={{ color: "var(--primary)" }} /> List status</div>
            <p className="mt-4 text-[30px] font-semibold tracking-tight">{siteCount}</p>
            <p className="text-[11px]" style={{ color: "var(--muted)" }}>domains in this page's current list</p>
          </div>
          <div className="rounded-xl border p-4 text-[12px] leading-relaxed" style={{ borderColor: "var(--border)", background: "var(--background-soft)", color: "var(--muted)" }}>
            <p className="font-semibold" style={{ color: "var(--text)" }}>Extension connection</p>
            <p className="mt-2">This screen currently manages a temporary in-page list. It does not yet sync changes to the Chrome extension or actively block sites. I won't show a connected status until that integration is implemented.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
