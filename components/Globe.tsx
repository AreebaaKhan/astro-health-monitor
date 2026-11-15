import type { Status } from "@/lib/health";
import { ACCENT, HEX } from "./status";

const NODES: [number, number][] = [[150, 140], [255, 120], [290, 205], [125, 225], [215, 275], [185, 185], [240, 165]];
const LATS = [-60, -30, 0, 30, 60];
const MERIDIANS = [0, 30, 60, 90, 120, 150];

// Glowing planet with an orbit ring. The marker moves along the ring as the mission day advances.
export default function Globe({ progress, status }: { progress: number; status: Status }) {
  const th = Math.PI - progress * Math.PI;
  const mx = 200 + 185 * Math.cos(th);
  const my = 200 + 55 * Math.sin(th);
  return (
    <svg viewBox="0 0 400 400" className="h-full w-auto max-w-full" aria-label="Mission progress globe" role="img">
      <defs>
        <radialGradient id="gl-sphere" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#38bdf8" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#0c4a6e" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="gl-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0.68" stopColor={ACCENT} stopOpacity="0.4" />
          <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
        <clipPath id="gl-clip"><circle cx="200" cy="200" r="130" /></clipPath>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#gl-halo)" />
      <circle cx="200" cy="200" r="130" fill="url(#gl-sphere)" />
      <g clipPath="url(#gl-clip)" stroke="#67e8f9" strokeOpacity="0.22" fill="none">
        {LATS.map((l) => {
          const rx = 130 * Math.cos((l * Math.PI) / 180);
          return <ellipse key={l} cx="200" cy={200 + 130 * Math.sin((l * Math.PI) / 180)} rx={rx} ry={rx * 0.18} />;
        })}
        {MERIDIANS.map((m) => <ellipse key={m} cx="200" cy="200" rx={Math.max(1, 130 * Math.abs(Math.cos((m * Math.PI) / 180)))} ry="130" />)}
      </g>
      {NODES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="#a5f3fc" opacity="0.9" />)}
      <circle cx="200" cy="200" r="130" fill="none" stroke={ACCENT} strokeOpacity="0.5" />
      <g transform="rotate(-20 200 200)">
        <ellipse cx="200" cy="200" rx="185" ry="55" fill="none" stroke="#67e8f9" strokeOpacity="0.45" strokeDasharray="3 6" />
        <circle cx={mx} cy={my} r="14" fill={HEX[status]} opacity="0.25">
          <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={mx} cy={my} r="5" fill={HEX[status]} stroke="#020617" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
