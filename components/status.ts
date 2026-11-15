import type { Status } from "@/lib/health";

// Palette: teal/cyan on near-black. Peach-red for alerts, soft amber for caution.
export const PEACH = "#ff8f7a";

export const BOX: Record<Status, string> = {
  ok: "border-cyan-300/30 bg-cyan-300/[0.06]",
  watch: "border-amber-300/40 bg-amber-300/[0.07]",
  alert: "border-[#ff8f7a]/50 bg-[#ff8f7a]/[0.08]",
};
export const TXT: Record<Status, string> = { ok: "text-cyan-300", watch: "text-amber-200", alert: "text-[#ffb09f]" };
export const DOT: Record<Status, string> = { ok: "bg-cyan-300", watch: "bg-amber-300", alert: "bg-[#ff8f7a]" };
export const LABEL: Record<Status, string> = { ok: "NOMINAL", watch: "CAUTION", alert: "ALERT" };
export const HEX: Record<Status, string> = { ok: "#2dd4e8", watch: "#f6c177", alert: PEACH };
export const ACCENT = "#2dd4e8";

export const GLOW: Record<Status, string> = {
  ok: "border-cyan-300/20 shadow-[0_0_18px_rgba(45,212,232,0.12)]",
  watch: "border-amber-300/40 shadow-[0_0_18px_rgba(246,193,119,0.22)]",
  alert: "border-[#ff8f7a]/55 shadow-[0_0_20px_rgba(255,143,122,0.28)]",
};
export const NUM: Record<Status, string> = {
  ok: "text-cyan-200 [text-shadow:0_0_12px_rgba(45,212,232,0.55)]",
  watch: "text-amber-200 [text-shadow:0_0_12px_rgba(246,193,119,0.5)]",
  alert: "text-[#ffa08c] [text-shadow:0_0_12px_rgba(255,143,122,0.55)]",
};
