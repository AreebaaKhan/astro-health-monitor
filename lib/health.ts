// Demo health logic. All data is SIMULATED. Ranges are demo values for a healthy adult, not medical advice.
export type Key = "hr" | "bp" | "glucose" | "temp" | "sleep" | "mood";
export type Status = "ok" | "watch" | "alert";
export type Day = Record<Key, number> & { day: number };

export const KEYS: Key[] = ["hr", "bp", "glucose", "temp", "sleep", "mood"];
export const CAL = 14; // days used to learn the astronaut's own baseline
export const ALPHA = 0.3; // EWMA smoothing
export const Z_LIMIT = 1.5; // smoothed z-score limit for a drift flag

type Info = {
  label: string; unit: string;
  lo: number; hi: number; // normal range
  alo: number; ahi: number; // alert limits
  sd: number; // typical day to day variation
  hazard: string; why: string; action: string;
};

export const I: Record<Key, Info> = {
  hr: { label: "Heart rate", unit: "bpm", lo: 55, hi: 95, alo: 45, ahi: 110, sd: 3, hazard: "Gravity fields",
    why: "Long periods in microgravity change how the heart and blood vessels work, so a rising resting heart rate can be an early sign of strain.",
    action: "Rest, drink water and measure again after 10 minutes. Keep the planned exercise session." },
  bp: { label: "Blood pressure (systolic)", unit: "mmHg", lo: 95, hi: 125, alo: 85, ahi: 145, sd: 4, hazard: "Gravity fields",
    why: "Fluid shifts in space can change blood pressure, and a pressure that stays high raises cardiovascular risk.",
    action: "Sit calmly for 5 minutes and measure again. Review salt intake and exercise." },
  glucose: { label: "Blood sugar", unit: "mg/dL", lo: 70, hi: 110, alo: 60, ahi: 140, sd: 5, hazard: "Closed environment and limited supplies",
    why: "Food choices are limited in a closed spacecraft and stress can change blood sugar.",
    action: "Check meal timing and food type, then measure again." },
  temp: { label: "Body temperature", unit: "C", lo: 36.1, hi: 37.2, alo: 35.5, ahi: 38, sd: 0.15, hazard: "Hostile and closed environment",
    why: "Cabin temperature and illness both change body temperature, and the immune system can behave differently in space.",
    action: "Check cabin temperature and clothing, rest, and measure again in an hour." },
  sleep: { label: "Sleep", unit: "hours", lo: 6.5, hi: 9, alo: 4.5, ahi: 11, sd: 0.5, hazard: "Isolation and confinement",
    why: "Lighting, noise and a fixed routine in a small space can cut sleep, which affects mood and performance.",
    action: "Keep a fixed sleep time, dim the lights before bed and reduce noise." },
  mood: { label: "Mood (1 to 10)", unit: "/10", lo: 6, hi: 10, alo: 3.5, ahi: 11, sd: 0.6, hazard: "Isolation and confinement",
    why: "Long isolation far from home can lower mood over time. Early support helps.",
    action: "Talk to a crewmate or book a call with ground support. Take a short break." },
};

// Two drifts are injected into the simulated mission.
export const EVENTS: { name: string; start: number; keys: Key[] }[] = [
  { name: "Sleep and mood decline (isolation)", start: 30, keys: ["sleep", "mood"] },
  { name: "Blood pressure and heart rate rise (gravity)", start: 55, keys: ["bp", "hr"] },
];

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rd = (x: number, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
const ramp = (day: number, start: number, len: number) => Math.min(1, Math.max(0, (day - start) / len));

export function simulate(days = 90, seed = 7): Day[] {
  const r = rng(seed);
  const g = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  return Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const s = ramp(day, EVENTS[0].start, 25);
    const c = ramp(day, EVENTS[1].start, 25);
    return {
      day,
      hr: rd(68 + 3 * g() + 12 * c),
      bp: rd(112 + 4 * g() + 24 * c),
      glucose: rd(92 + 5 * g()),
      temp: rd(36.7 + 0.15 * g(), 2),
      sleep: rd(7.4 + 0.5 * g() - 2.2 * s),
      mood: rd(Math.min(10, Math.max(1, 7.5 + 0.6 * g() - 2.5 * s))),
    };
  });
}

export function fixedStatus(k: Key, v: number): Status {
  const r = I[k];
  if (v < r.alo || v > r.ahi) return "alert";
  if (v < r.lo || v > r.hi) return "watch";
  return "ok";
}

// Personal baseline from the first CAL days, then an EWMA of the z-score.
export function analyze(data: Day[]) {
  const z = {} as Record<Key, number[]>;
  const base = {} as Record<Key, { mu: number; sd: number }>;
  for (const k of KEYS) {
    const v = data.slice(0, CAL).map((d) => d[k]);
    const mu = v.reduce((a, b) => a + b, 0) / v.length;
    const sd = Math.max(Math.sqrt(v.reduce((a, b) => a + (b - mu) ** 2, 0) / (v.length - 1)), I[k].sd * 0.7);
    base[k] = { mu, sd };
    let e = 0;
    z[k] = data.map((d) => {
      e = ALPHA * ((d[k] - mu) / sd) + (1 - ALPHA) * e;
      return e;
    });
  }
  return { z, base };
}

export function statusAt(data: Day[], z: Record<Key, number[]>, k: Key, i: number) {
  const fs = fixedStatus(k, data[i][k]);
  const drift = i >= CAL && Math.abs(z[k][i]) > Z_LIMIT;
  const status: Status = fs === "alert" ? "alert" : fs === "watch" || drift ? "watch" : "ok";
  return { status, drift };
}

function firstDay(data: Day[], start: number, test: (i: number) => boolean) {
  for (let i = start - 1; i < data.length; i++) if (test(i)) return data[i].day;
  return null;
}

// Compare the personal baseline method with a fixed threshold on the injected drifts.
export function validate(data: Day[], z: Record<Key, number[]>) {
  return EVENTS.flatMap((ev) =>
    ev.keys.map((k) => {
      const baseline = firstDay(data, ev.start, (i) => i >= CAL && Math.abs(z[k][i]) > Z_LIMIT);
      const fixed = firstDay(data, ev.start, (i) => fixedStatus(k, data[i][k]) !== "ok");
      return { k, start: ev.start, baseline, fixed, earlier: baseline !== null && fixed !== null ? fixed - baseline : null };
    })
  );
}

// Flags raised on quiet days (before the first drift starts).
export function falseAlarms(data: Day[], z: Record<Key, number[]>) {
  let b = 0, f = 0;
  const end = EVENTS[0].start - 1;
  for (let i = CAL; i < end; i++)
    for (const k of KEYS) {
      if (Math.abs(z[k][i]) > Z_LIMIT) b++;
      if (fixedStatus(k, data[i][k]) !== "ok") f++;
    }
  return { b, f, days: end - CAL };
}
