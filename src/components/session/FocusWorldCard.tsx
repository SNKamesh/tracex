"use client";

interface Props {
  id: string;
  name: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function WorldArtwork({ id }: { id: string }) {
  if (id === "orbit") {
    return (
      <svg viewBox="0 0 320 150" role="img" aria-label="Orbit station illustration" className="h-[116px] w-full">
        <circle cx="160" cy="74" r="29" fill="#D7A16F" opacity=".2" />
        <circle cx="160" cy="74" r="19" fill="#D7A16F" opacity=".75" />
        <ellipse cx="160" cy="74" rx="86" ry="30" fill="none" stroke="#A5B38D" strokeWidth="1.5" transform="rotate(-18 160 74)" />
        <ellipse cx="160" cy="74" rx="110" ry="48" fill="none" stroke="currentColor" opacity=".3" strokeWidth="1" />
        <circle cx="84" cy="49" r="4" fill="#D17A55" />
        <circle cx="234" cy="92" r="3" fill="#A5B38D" />
        <path d="M46 120H274M70 120V128M250 120V128" stroke="currentColor" opacity=".22" />
        <path d="M128 74H192M160 45V103" stroke="#F1F0E9" opacity=".35" />
        <circle cx="56" cy="30" r="1.8" fill="currentColor" /><circle cx="270" cy="34" r="1.8" fill="currentColor" /><circle cx="280" cy="106" r="1.4" fill="currentColor" />
      </svg>
    );
  }
  if (id === "rain") {
    return (
      <svg viewBox="0 0 320 150" role="img" aria-label="Rainy library illustration" className="h-[116px] w-full">
        <rect x="69" y="15" width="182" height="105" rx="7" fill="#91A9A8" opacity=".14" stroke="#91A9A8" strokeWidth="1.5" />
        <path d="M160 16V120M70 70H250" stroke="#91A9A8" strokeWidth="1.2" opacity=".6" />
        <path d="M90 32L83 43M116 27L108 40M139 37L132 49M190 29L182 42M218 41L210 54M235 24L227 37M99 84L92 96M127 82L119 95M194 84L186 97M223 81L215 94" stroke="#91A9A8" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 122H282" stroke="currentColor" opacity=".25" />
        <path d="M111 111V124M208 111V124" stroke="#D17A55" strokeWidth="3" />
        <path d="M112 106C124 96 146 96 159 106L159 121H112Z" fill="#D17A55" opacity=".72" />
        <path d="M161 106C175 96 196 96 208 106V121H161Z" fill="#A5B38D" opacity=".75" />
        <path d="M121 110L151 110M171 110L199 110" stroke="#F1F0E9" opacity=".8" />
      </svg>
    );
  }
  if (id === "exam") {
    return (
      <svg viewBox="0 0 320 150" role="img" aria-label="Focused study desk illustration" className="h-[116px] w-full">
        <path d="M55 119H265" stroke="currentColor" opacity=".25" />
        <path d="M92 119L103 130H217L228 119" fill="none" stroke="currentColor" opacity=".3" />
        <path d="M110 39V104H220V39" fill="none" stroke="#D17A55" strokeWidth="2" />
        <path d="M110 39L165 15L220 39" fill="#D17A55" opacity=".16" stroke="#D17A55" strokeWidth="1.5" />
        <path d="M143 59H190M143 71H182M143 83H188" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".65" />
        <circle cx="82" cy="48" r="18" fill="#A5B38D" opacity=".22" />
        <path d="M82 37V48L90 53" stroke="#A5B38D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M72 25L76 19M92 25L96 19" stroke="#A5B38D" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M243 88L255 76L269 90L257 102Z" fill="#D17A55" opacity=".7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 150" role="img" aria-label="Zen garden illustration" className="h-[116px] w-full">
      <path d="M32 116C86 104 116 130 163 116S246 106 288 116" fill="none" stroke="#A5B38D" strokeWidth="2" opacity=".8" />
      <path d="M35 129C87 117 114 139 161 127S244 117 286 128" fill="none" stroke="currentColor" opacity=".22" />
      <path d="M160 111V45M160 74C137 38 112 47 118 70C135 82 148 82 160 74ZM160 87C184 45 209 56 202 81C188 96 174 97 160 87Z" fill="#A5B38D" opacity=".65" stroke="#A5B38D" strokeWidth="1.5" />
      <path d="M160 56C144 26 163 15 178 29C180 42 171 52 160 56Z" fill="#D17A55" opacity=".72" />
      <circle cx="69" cy="44" r="13" fill="#D17A55" opacity=".18" />
      <path d="M57 44H81M69 32V56" stroke="#D17A55" opacity=".65" />
      <path d="M47 100C72 91 92 93 111 100M210 98C231 91 252 91 274 99" stroke="currentColor" opacity=".25" strokeWidth="1.5" />
    </svg>
  );
}

export default function FocusWorldCard({ id, name, description, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group overflow-hidden rounded-[18px] border p-4 text-left transition-colors duration-200 sm:p-5"
      style={{
        background: active ? "color-mix(in srgb, var(--primary), var(--surface) 93%)" : "var(--surface)",
        borderColor: active ? "var(--primary)" : "var(--border)",
        boxShadow: active ? "var(--shadow-sm)" : "none",
      }}
    >
      <div className="mb-3 overflow-hidden rounded-xl" style={{ background: "var(--background-soft)", color: "var(--muted)" }}>
        <WorldArtwork id={id} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">{name}</h3>
        {active && <span className="rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em]" style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary), transparent 88%)" }}>Selected</span>}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>{description}</p>
    </button>
  );
}
