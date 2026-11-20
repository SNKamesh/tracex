"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home, LayoutDashboard, Timer, CalendarCheck, Users, FileStack, Bot,
  GraduationCap, ShieldOff, Palette, Settings, MoreHorizontal, X, ArrowUpRight
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/home", icon: Home, group: "Workspace" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Workspace" },
  { name: "Study Sessions", href: "/sessions", icon: Timer, group: "Workspace" },
  { name: "Study Plans", href: "/study-plans", icon: CalendarCheck, group: "Workspace" },
  { name: "Friends", href: "/friends", icon: Users, group: "Workspace" },
  { name: "NoteX", href: "/notex", icon: Bot, group: "Tools" },
  { name: "Classroom", href: "/classroom", icon: GraduationCap, group: "Tools" },
  { name: "File Converter", href: "/converter", icon: FileStack, group: "Tools" },
  { name: "Blocker", href: "/blocker", icon: ShieldOff, group: "Tools" },
  { name: "Theme", href: "/theme", icon: Palette, group: "Manage" },
  { name: "Settings", href: "/settings", icon: Settings, group: "Manage" },
];

const primaryMobile = ["/home", "/sessions", "/study-plans", "/notex"];

export default function Sidebar() {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) => router.pathname === href;
  const mobileMoreItems = navItems.filter((item) => !primaryMobile.includes(item.href));

  return (
    <>
      <aside
        className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r px-4 py-7 lg:flex lg:flex-col"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Link href="/home" className="mb-10 block px-3" aria-label="TraceX home">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] text-sm font-black text-white" style={{ background: "var(--primary)" }}>T</span>
            <span className="text-[21px] font-semibold tracking-[-.06em]">Trace<span style={{ color: "var(--primary)" }}>X</span></span>
          </div>
          <p className="mt-2 pl-10 text-[10px] font-medium uppercase tracking-[.16em]" style={{ color: "var(--muted)" }}>Study with intention</p>
        </Link>

        <nav className="flex-1 space-y-7 overflow-y-auto" aria-label="Main navigation">
          {(["Workspace", "Tools", "Manage"] as const).map((group) => (
            <div key={group}>
              <p className="tx-eyebrow mb-2 px-3">{group}</p>
              <div className="space-y-1">
                {navItems.filter((item) => item.group === group).map(({ name, href, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className="group relative flex items-center gap-3 rounded-[11px] px-3 py-[10px] text-[13px] font-medium transition-colors"
                      style={{
                        color: active ? "var(--text)" : "var(--muted)",
                        background: active ? "color-mix(in srgb, var(--primary), transparent 90%)" : "transparent",
                      }}
                    >
                      {active && <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full" style={{ background: "var(--primary)" }} />}
                      <Icon size={17} strokeWidth={active ? 2.2 : 1.8} style={{ color: active ? "var(--primary)" : "currentColor" }} />
                      <span>{name}</span>
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)" }} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--background-soft)" }}>
          <p className="text-xs font-semibold">A little progress adds up.</p>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>Make room for focused work, one session at a time.</p>
        </div>
        <a href="https://github.com/SNKamesh/tracex" target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 px-3 text-[11px]" style={{ color: "var(--muted)" }}>
          TraceX project <ArrowUpRight size={12} />
        </a>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-4 lg:hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Link href="/home" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white" style={{ background: "var(--primary)" }}>T</span>
          Trace<span style={{ color: "var(--primary)" }}>X</span>
        </Link>
        <span className="text-[10px] uppercase tracking-[.14em]" style={{ color: "var(--muted)" }}>Study workspace</span>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[68px] items-center justify-around border-t px-2 pb-[env(safe-area-inset-bottom)] lg:hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }} aria-label="Mobile navigation">
        {primaryMobile.map((href) => {
          const item = navItems.find((entry) => entry.href === href)!;
          const Icon = item.icon;
          const active = isActive(href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className="flex min-w-[62px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium" style={{ color: active ? "var(--primary)" : "var(--muted)" }}>
              <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
              {item.name === "Study Plans" ? "Plans" : item.name === "Study Sessions" ? "Focus" : item.name}
            </Link>
          );
        })}
        <button type="button" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen} aria-label="More navigation" className="flex min-w-[62px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium" style={{ color: moreOpen || mobileMoreItems.some((item) => isActive(item.href)) ? "var(--primary)" : "var(--muted)" }}>
          {moreOpen ? <X size={19} /> : <MoreHorizontal size={19} />}
          More
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-x-3 bottom-[76px] z-[60] rounded-2xl border p-3 shadow-xl lg:hidden" style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow)" }}>
          <div className="grid grid-cols-3 gap-2">
            {mobileMoreItems.map(({ name, href, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMoreOpen(false)} className="flex flex-col items-center gap-2 rounded-xl px-2 py-3 text-[11px]" style={{ color: isActive(href) ? "var(--primary)" : "var(--text)", background: isActive(href) ? "color-mix(in srgb, var(--primary), transparent 90%)" : "var(--background-soft)" }}>
                <Icon size={18} />{name}
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="h-14 shrink-0 lg:hidden" aria-hidden="true" />
    </>
  );
}
