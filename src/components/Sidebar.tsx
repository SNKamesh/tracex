"use client";

import Link from "next/link";

const menu = [
  "Home",
  "Dashboard",
  "Study Sessions",
  "Study Plans",
  "Friends",
  "File Converter",
  "NoteX Bot",
  "Activity",
  "Settings",
  "Trash",
];

export default function Sidebar() {
  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-950 p-5">
      <h1 className="text-xl font-bold mb-6">TraceX</h1>
      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase().replace(/ /g, "")}`}
            className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            {item}
          </Link>
        ))}
      </nav>
    </aside>
  );
}