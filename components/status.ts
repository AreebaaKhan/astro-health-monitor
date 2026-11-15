import type { Status } from "@/lib/health";

export const BOX: Record<Status, string> = {
  ok: "border-emerald-500/30 bg-emerald-500/[0.06]",
  watch: "border-amber-400/50 bg-amber-400/[0.08]",
  alert: "border-rose-500/60 bg-rose-500/[0.10]",
};
export const TXT: Record<Status, string> = { ok: "text-emerald-300", watch: "text-amber-300", alert: "text-rose-300" };
export const DOT: Record<Status, string> = { ok: "bg-emerald-400", watch: "bg-amber-400", alert: "bg-rose-500" };
export const LABEL: Record<Status, string> = { ok: "NOMINAL", watch: "CAUTION", alert: "ALERT" };
export const HEX: Record<Status, string> = { ok: "#34d399", watch: "#fbbf24", alert: "#fb7185" };
export const ACCENT = "#22d3ee";

// Glowing borders for cards and neon numbers for telemetry.
export const GLOW: Record<Status, string> = {
  ok: "border-cyan-400/25 shadow-[0_0_18px_rgba(34,211,238,0.18)]",
  watch: "border-amber-400/50 shadow-[0_0_18px_rgba(251,191,36,0.35)]",
  alert: "border-rose-500/60 shadow-[0_0_20px_rgba(255,0,0,0.5)]",
};
export const NUM: Record<Status, string> = {
  ok: "text-cyan-300 [text-shadow:0_0_12px_rgba(34,211,238,0.6)]",
  watch: "text-amber-300 [text-shadow:0_0_12px_rgba(251,191,36,0.6)]",
  alert: "text-rose-400 [text-shadow:0_0_12px_rgba(255,60,60,0.7)]",
};
