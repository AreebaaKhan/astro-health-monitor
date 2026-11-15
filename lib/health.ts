// Health logic for the Astronaut Health Monitor.
// All mission data is SIMULATED. Ranges are demo values for a healthy adult, not medical advice.
// Logic in /lib with no UI code.

export type Key = "hr" | "bp" | "glucose" | "temp" | "sleep" | "mood";
export type Status = "ok" | "watch" | "alert";
export type Day = Record<Key, number> & { day: number };

export const KEYS: Key[] = ["hr", "bp", "glucose", "temp", "sleep", "mood"];
export const MISSION_DAYS = 180; // simulated Mars transit
export const CAL = 14; // calibration period in days used to learn the astronaut's own baseline
export const ALPHA = 0.25; // EWMA smoothing weight
export const BASE_RATE = 0.005; // slow baseline adaptation rate during quiet nominal days
export const Z_LIMIT = 1.2; // smoothed z-score threshold for caution drift (Watch)
export const Z_ALERT = 3.5; // smoothed z-score threshold for critical alert (Alert)

export type Info = {
  label: string;
  short: string;
  unit: string;
  dp: number;
  base: number; // typical healthy baseline for this astronaut
  lo: number;
  hi: number; // population normal reference range
  alo: number;
  ahi: number; // population alert limits
  sd: number; // typical day to day physiological variance
  hazard: string;
  why: string;
  action: string;
};

export const I: Record<Key, Info> = {
  hr: {
    label: "Heart rate",
    short: "HR",
    unit: "bpm",
    dp: 0,
    base: 68,
    lo: 55,
    hi: 95,
    alo: 45,
    ahi: 110,
    sd: 3,
    hazard: "Gravity fields",
    why: "Changes in gravity can affect the heart and circulation. A lasting change in resting pulse is worth reviewing.",
    action: "Rest quietly and repeat the measurement. Follow your prescribed hydration and activity plan.",
  },
  bp: {
    label: "Blood pressure (systolic)",
    short: "BP",
    unit: "mmHg",
    dp: 0,
    base: 112,
    lo: 95,
    hi: 125,
    alo: 85,
    ahi: 145,
    sd: 4,
    hazard: "Gravity fields",
    why: "Changes in gravity redistribute body fluids. Blood pressure helps track changes in circulation.",
    action: "Sit quietly for 5 minutes, check the cuff placement, and repeat the measurement.",
  },
  glucose: {
    label: "Blood sugar",
    short: "GLU",
    unit: "mg/dL",
    dp: 0,
    base: 92,
    lo: 70,
    hi: 110,
    alo: 60,
    ahi: 140,
    sd: 5,
    hazard: "Hostile and closed environment",
    why: "Changes in food, activity and stress can affect blood sugar.",
    action: "Check when you last ate and repeat the reading using your mission protocol. Do not change medication based on this app.",
  },
  temp: {
    label: "Body temperature",
    short: "TEMP",
    unit: "C",
    dp: 2,
    base: 36.7,
    lo: 36.1,
    hi: 37.2,
    alo: 35.5,
    ahi: 38.0,
    sd: 0.15,
    hazard: "Hostile and closed environment",
    why: "Cabin conditions and illness can affect body temperature.",
    action: "Check the thermometer and cabin conditions, then repeat the reading according to your mission protocol.",
  },
  sleep: {
    label: "Sleep",
    short: "SLEEP",
    unit: "hours",
    dp: 1,
    base: 7.8,
    lo: 6.5,
    hi: 9.0,
    alo: 4.5,
    ahi: 11.0,
    sd: 0.5,
    hazard: "Isolation and confinement",
    why: "Noise, lighting and isolation can disrupt sleep and make concentration harder.",
    action: "Keep a regular sleep schedule. Reduce light and noise before rest and record how you feel.",
  },
  mood: {
    label: "Mood (1 to 10)",
    short: "MOOD",
    unit: "/10",
    dp: 1,
    base: 7.5,
    lo: 6.0,
    hi: 10.0,
    alo: 3.5,
    ahi: 11.0,
    sd: 0.6,
    hazard: "Isolation and confinement",
    why: "Isolation and distance from home can affect mood and wellbeing.",
    action: "Take a break and talk with a trusted crewmate or your ground support team.",
  },
};

// ---------- Simulated mission ----------

export type MissionEvent = {
  id: string;
  name: string;
  hazard: string;
  start: number;
  rise: number;
  hold: number;
  fall: number; // days
  delta: Partial<Record<Key, number>>; // peak shift added to healthy value
};

// Three realistic drifts injected across the 180-day mission.
export const EVENTS: MissionEvent[] = [
  {
    id: "isolation",
    name: "Circadian disruption and mood decline",
    hazard: "Isolation and confinement",
    start: 40,
    rise: 45,
    hold: 20,
    fall: 25,
    delta: { sleep: -2.3, mood: -2.8 },
  },
  {
    id: "gravity",
    name: "Microgravity fluid shift and cardiovascular deconditioning",
    hazard: "Gravity fields",
    start: 95,
    rise: 40,
    hold: 15,
    fall: 20,
    delta: { bp: 26, hr: 14 },
  },
  {
    id: "closed",
    name: "Cabin atmospheric and metabolic stress",
    hazard: "Hostile and closed environment",
    start: 140,
    rise: 25,
    hold: 15,
    fall: 15,
    delta: { temp: 0.9, glucose: 22 },
  },
];

const GRACE = 7; // grace period after event ends before considering days quiet again
export const eventEnd = (e: MissionEvent) => e.start + e.rise + e.hold + e.fall;

const ramp = (d: number, s: number, len: number) =>
  len <= 0 ? (d >= s ? 1 : 0) : Math.min(1, Math.max(0, (d - s) / len));

export const effect = (e: MissionEvent, day: number) =>
  ramp(day, e.start, e.rise) * (1 - ramp(day, e.start + e.rise + e.hold, e.fall));

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (x: number, n: number) => Math.round(x * 10 ** n) / 10 ** n;

export function simulate(days = MISSION_DAYS, seed = 5): Day[] {
  const r = rng(seed);
  const gauss = () =>
    Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const PHI = 0.3; // autoregressive correlation for realistic physiological continuity
  const noise = {} as Record<Key, number>;
  for (const k of KEYS) noise[k] = 0;

  return Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const row = { day } as Day;
    for (const k of KEYS) {
      noise[k] = PHI * noise[k] + Math.sqrt(1 - PHI * PHI) * gauss();
      let v = I[k].base + I[k].sd * noise[k];
      for (const e of EVENTS) v += (e.delta[k] ?? 0) * effect(e, day);
      if (k === "mood") v = Math.min(10, Math.max(1, v));
      row[k] = round(Math.max(0, v), I[k].dp);
    }
    return row;
  });
}

// ---------- Anomaly Detection & Baseline Engine ----------

export function fixedStatus(k: Key, v: number): Status {
  const r = I[k];
  if (v < r.alo || v > r.ahi) return "alert";
  if (v < r.lo || v > r.hi) return "watch";
  return "ok";
}

export type Baseline = {
  mu: number;
  sd: number;
  series: number[]; // series[i] = baseline used for day index i
};

export type Z = Record<Key, number[]>;

// Rolling personal baseline plus an EWMA of the z-score.
// 1. Initial baseline mean (mu0) and variance (sd) learned during first CAL days.
// 2. Daily z-score calculated: z = (reading - mu) / sd.
// 3. EWMA filter smooths transient noise: ewma = ALPHA * z + (1 - ALPHA) * ewma.
// 4. Baseline mean tracks gently (BASE_RATE) only during non-drift periods to avoid baseline absorption.
export function analyze(data: Day[]) {
  const z = {} as Z;
  const base = {} as Record<Key, Baseline>;

  for (const k of KEYS) {
    const calData = data.slice(0, Math.min(CAL, data.length));
    const vals = calData.map((d) => d[k]);
    const mu0 = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    const sample =
      vals.length > 1
        ? Math.sqrt(
            vals.reduce((a, b) => a + (b - mu0) ** 2, 0) / (vals.length - 1)
          )
        : I[k].sd;
    const sd = Math.max(sample, I[k].sd);

    let mu = mu0;
    let e = 0;
    const series: number[] = [];

    z[k] = data.map((d, i) => {
      series.push(mu);
      const instantZ = (d[k] - mu) / sd;
      e = ALPHA * instantZ + (1 - ALPHA) * e;
      if (i >= CAL && Math.abs(e) <= Z_LIMIT * 0.4) {
        mu += BASE_RATE * (d[k] - mu);
      }
      return e;
    });

    base[k] = { mu: mu0, sd, series };
  }

  return { z, base };
}

export function statusAt(data: Day[], z: Z, k: Key, i: number) {
  const fixed = fixedStatus(k, data[i][k]);
  const zz = i >= CAL ? Math.abs(z[k][i]) : 0;
  const drift = zz > Z_LIMIT;
  const status: Status =
    fixed === "alert" || zz > Z_ALERT
      ? "alert"
      : fixed === "watch" || drift
      ? "watch"
      : "ok";
  return { k, status, drift, fixed, z: z[k][i] };
}

export const worst = (list: Status[]): Status =>
  list.includes("alert") ? "alert" : list.includes("watch") ? "watch" : "ok";

export function driftDays(z: Z, k: Key, i: number) {
  let n = 0;
  for (let j = i; j >= CAL && Math.abs(z[k][j]) > Z_LIMIT; j--) n++;
  return n;
}

export type AlertText = {
  k: Key;
  status: Status;
  what: string;
  why: string;
  action: string;
  escalate: string;
};

// Every alert explicitly answers the four core spaceflight telemetry questions.
export function buildAlert(
  data: Day[],
  z: Z,
  base: Record<Key, Baseline>,
  k: Key,
  i: number
): AlertText {
  const info = I[k];
  const s = statusAt(data, z, k, i);
  const v = data[i][k];
  const mu = base[k].series[i] ?? base[k].mu;
  const days = driftDays(z, k, i);
  const learning = i < CAL;
  const what = learning
    ? `${info.label}: ${v.toFixed(info.dp)} ${info.unit}. Outside the demo reference range; personal baseline is still learning.`
    : `${info.label}: ${v.toFixed(info.dp)} ${info.unit}, compared with your baseline of ${mu.toFixed(info.dp)} ${info.unit}.${s.drift ? ` Trend flagged${days > 1 ? ` for ${days} days` : " today"}.` : " Outside the demo reference range."}`;
  const why = `Spaceflight hazard: ${info.hazard}. ${info.why}`;
  const action = info.action;
  const escalate = s.status === "alert"
    ? "Contact the flight surgeon promptly and follow your mission medical protocol. Do not wait for another app reading if you feel unwell."
    : days >= 3
    ? "This trend has continued for 3 or more days. Share your recent readings with the flight surgeon."
    : "Repeat the measurement. Contact the flight surgeon if it stays unusual or you feel unwell.";

  return { k, status: s.status, what, why, action, escalate };
}

// ---------- Validation Engine: Personal Baseline vs Fixed Thresholds ----------

export type ValRow = {
  k: Key;
  event: string;
  start: number;
  baseline: number | null;
  fixed: number | null;
  earlier: number | null;
};

export type ValidationSummary = {
  total: number;
  caughtBaseline: number;
  caughtFixed: number;
  onlyBaseline: number;
  meanEarlier: number;
  quietDays: number;
  baselineFlags: number;
  fixedFlags: number;
  baselineRate: number;
  fixedRate: number;
};

export type ValidationResult = {
  rows: ValRow[];
  summary: ValidationSummary;
};

function firstDay(
  data: Day[],
  from: number,
  to: number,
  test: (i: number) => boolean
) {
  for (let i = from - 1; i < Math.min(to, data.length); i++) {
    if (test(i)) return data[i].day;
  }
  return null;
}

const quiet = (k: Key, day: number) =>
  !EVENTS.some(
    (e) =>
      e.delta[k] !== undefined &&
      day >= e.start &&
      day <= eventEnd(e) + GRACE
  );

export function validate(data: Day[], z: Z): ValidationResult {
  const rows: ValRow[] = EVENTS.flatMap((e) =>
    (Object.keys(e.delta) as Key[]).map((k) => {
      const end = eventEnd(e) + GRACE;
      const baseline = firstDay(
        data,
        e.start,
        end,
        (i) => i >= CAL && Math.abs(z[k][i]) > Z_LIMIT
      );
      const fixed = firstDay(
        data,
        e.start,
        end,
        (i) => fixedStatus(k, data[i][k]) !== "ok"
      );
      return {
        k,
        event: e.name,
        start: e.start,
        baseline,
        fixed,
        earlier:
          baseline !== null && fixed !== null ? fixed - baseline : null,
      };
    })
  );

  let qd = 0;
  let b = 0;
  let f = 0;

  for (let i = CAL; i < data.length; i++) {
    for (const k of KEYS) {
      if (quiet(k, data[i].day)) {
        qd++;
        if (Math.abs(z[k][i]) > Z_LIMIT) b++;
        if (fixedStatus(k, data[i][k]) !== "ok") f++;
      }
    }
  }

  const both = rows.filter((r) => r.earlier !== null);

  return {
    rows,
    summary: {
      total: rows.length,
      caughtBaseline: rows.filter((r) => r.baseline !== null).length,
      caughtFixed: rows.filter((r) => r.fixed !== null).length,
      onlyBaseline: rows.filter(
        (r) => r.baseline !== null && r.fixed === null
      ).length,
      meanEarlier: both.length
        ? Math.round(
            (both.reduce((a, r) => a + (r.earlier ?? 0), 0) / both.length) * 10
          ) / 10
        : 0,
      quietDays: qd,
      baselineFlags: b,
      fixedFlags: f,
      baselineRate: qd ? Math.round((b / qd) * 1000) / 10 : 0,
      fixedRate: qd ? Math.round((f / qd) * 1000) / 10 : 0,
    },
  };
}
