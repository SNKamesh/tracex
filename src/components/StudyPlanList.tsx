"use client";

import { useState } from "react";

export default function StudyPlanList() {
  const [items, setItems] = useState(["Math", "Physics", "Chemistry"]);

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm"
        >
          {item}
        </div>
      ))}
    </div>
  );
}