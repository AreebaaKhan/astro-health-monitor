"use client";

import type { Key, Status } from "@/lib/health";
import { ACCENT, HEX } from "./status";

export type Region = { id: string; label: string; keys: Key[]; hazards: string[]; text: string };

export const REGIONS: Region[] = [
  { id: "head", label: "Head and mind", keys: ["mood", "sleep"], hazards: ["Isolation and confinement"],
    text: "Months in a small space far from home can lower mood and disturb sleep. These changes are easy to miss when you are the one living them." },
  { id: "heart", label: "Heart and blood vessels", keys: ["hr", "bp"], hazards: ["Gravity fields"],
    text: "Without normal gravity the body shifts fluid, and the heart and vessels adapt. Pulse and pressure show how well the body is coping." },
  { id: "abdomen", label: "Metabolism", keys: ["glucose"], hazards: ["Hostile and closed environment"],
    text: "Food choices and routines are limited on a spacecraft. Blood sugar is a quick check of how the body is handling them." },
  { id: "limbs", label: "Whole body and limbs", keys: ["temp"], hazards: ["Gravity fields", "Hostile and closed environment"],
    text: "Cabin temperature, air and microbes affect the whole body, and low gravity affects bones and muscles. Body temperature is a simple sign that something is off. Daily exercise is a main countermeasure." },
  { id: "radiation", label: "Radiation", keys: [], hazards: ["Space radiation"],
    text: "NASA lists radiation as one of the most hazardous parts of spaceflight. You cannot feel it, and these six indicators cannot measure it. A real system would add dose monitoring." },
];

type Props = { selected: string | null; statusOf: (id: string) => Status | null; onSelect: (id: string | null) => void };
type Paint = { fill?: string; stroke?: string; strokeWidth?: number; filter?: string };

const Limbs = (p: Paint) => (
  <>
    <rect x="70" y="100" width="22" height="86" rx="11" transform="rotate(7 81 100)" {...p} />
    <rect x="56" y="178" width="20" height="94" rx="10" transform="rotate(6 66 178)" {...p} />
    <rect x="208" y="100" width="22" height="86" rx="11" transform="rotate(-7 219 100)" {...p} />
    <rect x="224" y="178" width="20" height="94" rx="10" transform="rotate(-6 234 178)" {...p} />
    <rect x="112" y="250" width="33" height="112" rx="16" {...p} />
    <rect x="155" y="250" width="33" height="112" rx="16" {...p} />
    <rect x="115" y="352" width="28" height="124" rx="14" {...p} />
    <rect x="157" y="352" width="28" height="124" rx="14" {...p} />
  </>
);
const Body = (p: Paint) => (
  <>
    <ellipse cx="150" cy="48" rx="25" ry="31" {...p} />
    <rect x="140" y="76" width="20" height="20" rx="6" {...p} />
    <rect x="100" y="92" width="100" height="80" rx="32" {...p} />
    <rect x="108" y="160" width="84" height="68" rx="26" {...p} />
    <rect x="110" y="218" width="80" height="42" rx="21" {...p} />
    <Limbs {...p} />
  </>
);

const OFF = 110; // body is drawn in a 300 wide box, centred in a 520 wide view
const CALLS: { id: string; x: number; y: number; side: "l" | "r"; label: string }[] = [
  { id: "head", x: 150, y: 46, side: "r", label: "MIND" },
  { id: "heart", x: 132, y: 125, side: "r", label: "HEART" },
  { id: "limbs", x: 176, y: 300, side: "r", label: "LIMBS" },
  { id: "abdomen", x: 150, y: 195, side: "l", label: "METABOLISM" },
];

export default function BodyFigure({ selected, statusOf, onSelect }: Props) {
  const tint = (id: string) => { const s = statusOf(id); return s ? HEX[s] : ACCENT; };
  const act = (id: string) => ({
    onClick: () => onSelect(selected === id ? null : id),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onSelect(selected === id ? null : id); },
    role: "button" as const, tabIndex: 0, className: "cursor-pointer outline-none",
  });
  const on = (id: string) => selected === id;
  const hint = (id: string) => REGIONS.find((r) => r.id === id)?.label;
  const lines = Array.from({ length: 62 }, (_, n) => n * 8 + 10);
  const cols = Array.from({ length: 11 }, (_, n) => 80 + n * 14);

  return (
    <svg viewBox="0 0 520 540" className="mx-auto h-full w-full" aria-label="Clickable hologram body figure">
      <defs>
        <filter id="hb-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="hb-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACCENT} stopOpacity="0.28" />
          <stop offset="1" stopColor="#2563eb" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="hb-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACCENT} stopOpacity="0" />
          <stop offset="1" stopColor={ACCENT} stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="hb-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={ACCENT} stopOpacity="0.35" />
          <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
        <clipPath id="hb-clip"><Body /></clipPath>
      </defs>

      <ellipse cx="260" cy="505" rx="130" ry="16" fill="url(#hb-floor)" />
      <ellipse cx="260" cy="505" rx="90" ry="9" fill="none" stroke={ACCENT} strokeOpacity="0.5" />

      <ellipse cx="260" cy="268" rx="190" ry="258" fill="none" strokeDasharray="3 7" strokeWidth={on("radiation") ? 2 : 1}
        stroke={on("radiation") ? ACCENT : "#475569"} strokeOpacity={on("radiation") ? 1 : 0.6} pointerEvents="stroke" {...act("radiation")}>
        <title>{hint("radiation")}</title>
      </ellipse>

      <g transform={`translate(${OFF} 0)`}>
        <g filter="url(#hb-glow)"><Body fill="url(#hb-fill)" stroke={ACCENT} strokeWidth={1.4} /></g>
        <g clipPath="url(#hb-clip)" fill="none" stroke={ACCENT} strokeOpacity="0.22" strokeWidth="0.6">
          {lines.map((y) => <path key={y} d={`M0 ${y} Q150 ${y + 6} 300 ${y}`} />)}
          {cols.map((x) => <path key={x} d={`M${x} 0 Q${x + (x - 150) * 0.12} 260 ${x} 520`} />)}
          <rect x="0" y="0" width="300" height="70" fill="url(#hb-scan)" stroke="none">
            <animate attributeName="y" values="-70;520;-70" dur="7s" repeatCount="indefinite" />
          </rect>
        </g>

        <ellipse cx="150" cy="48" rx="25" ry="31" fill={tint("head")} fillOpacity={on("head") ? 0.5 : 0.22} {...act("head")}><title>{hint("head")}</title></ellipse>
        <circle cx="132" cy="125" r="23" fill={tint("heart")} fillOpacity={on("heart") ? 0.55 : 0.25} {...act("heart")}><title>{hint("heart")}</title></circle>
        <circle cx="150" cy="195" r="27" fill={tint("abdomen")} fillOpacity={on("abdomen") ? 0.5 : 0.2} {...act("abdomen")}><title>{hint("abdomen")}</title></circle>
        <g fill={tint("limbs")} fillOpacity={on("limbs") ? 0.4 : 0.1} {...act("limbs")}><title>{hint("limbs")}</title><Limbs /></g>
      </g>

      {CALLS.map((c) => {
        const x = c.x + OFF, color = tint(c.id), sel = on(c.id), right = c.side === "r";
        const x2 = right ? 420 : 100;
        return (
          <g key={c.id} {...act(c.id)}>
            <line x1={x} y1={c.y} x2={x2} y2={c.y} stroke={color} strokeOpacity={sel ? 0.95 : 0.55} strokeWidth="1" />
            <circle cx={x} cy={c.y} r={sel ? 12 : 8} fill={color} opacity="0.25">
              <animate attributeName="r" values={sel ? "9;15;9" : "6;10;6"} dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={c.y} r="4.5" fill={color} stroke="#02050f" strokeWidth="1.5" filter="url(#hb-glow)" />
            <text x={right ? x2 + 8 : x2 - 8} y={c.y + 4} textAnchor={right ? "start" : "end"} fontSize="12" letterSpacing="2"
              fontFamily="ui-monospace, monospace" fill={sel ? ACCENT : "#cbd5e1"}>{c.label}</text>
          </g>
        );
      })}

      <g {...act("radiation")}>
        <circle cx="108" cy="420" r="4.5" fill={on("radiation") ? ACCENT : "#94a3b8"} stroke="#02050f" strokeWidth="1.5" filter="url(#hb-glow)" />
        <text x="96" y="424" textAnchor="end" fontSize="12" letterSpacing="2" fontFamily="ui-monospace, monospace" fill={on("radiation") ? ACCENT : "#cbd5e1"}>RADIATION</text>
      </g>
    </svg>
  );
}
