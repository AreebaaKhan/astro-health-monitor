"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CAL, I, KEYS, Z_LIMIT, analyze, falseAlarms, simulate, statusAt, validate } from "@/lib/health";
import type { Key, Status } from "@/lib/health";

const BOX: Record<Status, string> = {
  ok: "border-emerald-500/40 bg-emerald-500/10",
  watch: "border-amber-500/50 bg-amber-500/10",
  alert: "border-rose-500/60 bg-rose-500/10",
};
const TXT: Record<Status, string> = { ok: "text-emerald-300", watch: "text-amber-300", alert: "text-rose-300" };
const LABEL: Record<Status, string> = { ok: "Normal", watch: "Watch", alert: "Alert" };

type Region = { id: string; label: string; keys: Key[]; hazard: string; text: string };
const REGIONS: Region[] = [
  { id: "head", label: "Head and mind", keys: ["mood", "sleep"], hazard: "Isolation and confinement",
    text: "Months in a small space far from home can lower mood and disturb sleep. These changes are easy to miss when you are the one living them." },
  { id: "chest", label: "Heart and blood vessels", keys: ["hr", "bp"], hazard: "Gravity fields",
    text: "Without normal gravity the body shifts fluid, and the heart and vessels adapt. Pulse and pressure show how well the body is coping." },
  { id: "abdomen", label: "Metabolism", keys: ["glucose"], hazard: "Closed environment and limited supplies",
    text: "Food choices and routines are limited on a spacecraft. Blood sugar is a quick check of how the body is handling them." },
  { id: "body", label: "Whole body", keys: ["temp"], hazard: "Hostile and closed environment",
    text: "Cabin temperature, air and microbes all affect the body. Body temperature is a simple sign that something is off." },
  { id: "radiation", label: "Radiation", keys: [], hazard: "Space radiation",
    text: "NASA lists radiation as one of the most hazardous parts of spaceflight. It cannot be felt, and these six indicators cannot measure it. A real system would add dose monitoring." },
];

export default function Dashboard() {
  const data = useMemo(() => simulate(), []);
  const { z, base } = useMemo(() => analyze(data), [data]);
  const val = useMemo(() => validate(data, z), [data, z]);
  const fa = useMemo(() => falseAlarms(data, z), [data, z]);
  const [day, setDay] = useState(75);
  const [key, setKey] = useState<Key>("sleep");
  const [rid, setRid] = useState("head");
  const i = day - 1;

  const st = KEYS.map((k) => ({ k, ...statusAt(data, z, k, i) }));
  const alerts = st.filter((s) => s.status !== "ok").sort((a, b) => (a.status === "alert" ? 0 : 1) - (b.status === "alert" ? 0 : 1));
  const rows = data.slice(0, day).map((d, j) => ({
    day: d.day, value: d[key], flag: j >= CAL && Math.abs(z[key][j]) > Z_LIMIT ? d[key] : null,
  }));
  const reg = REGIONS.find((r) => r.id === rid) ?? REGIONS[0];
  const fill = (id: string) => (rid === id ? "#38bdf8" : "#475569");
  const info = I[key];
  const dayText = (d: number | null) => (d === null ? "never" : `Day ${d}`);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Astronaut Health Monitor</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            A self-check tool for long missions. It learns each astronaut&apos;s own baseline and warns when readings drift, before they cross a fixed limit.
            Simulated Mars transit data. Guidance only, not a medical diagnosis.
          </p>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <label htmlFor="day" className="text-sm text-slate-300">Mission day {day} of {data.length}</label>
          <input id="day" type="range" min={1} max={data.length} value={day} onChange={(e) => setDay(Number(e.target.value))} className="mt-2 w-full accent-sky-400" />
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {st.map((s) => (
            <button key={s.k} onClick={() => setKey(s.k)}
              className={`rounded-lg border p-3 text-left ${BOX[s.status]} ${key === s.k ? "ring-2 ring-sky-400" : ""}`}>
              <div className="text-xs text-slate-300">{I[s.k].label}</div>
              <div className="mt-1 text-xl font-semibold">{data[i][s.k]} <span className="text-xs font-normal text-slate-400">{I[s.k].unit}</span></div>
              <div className={`text-xs ${TXT[s.status]}`}>{s.drift && s.status === "watch" ? "Drifting from baseline" : LABEL[s.status]}</div>
              <div className="text-xs text-slate-500">Baseline {base[s.k].mu.toFixed(1)}</div>
            </button>
          ))}
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-medium">{info.label} over the mission</h2>
          <p className="text-xs text-slate-400">Green band is the normal range. Amber dots mark days flagged by the personal baseline method.</p>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="day" type="number" domain={[1, data.length]} stroke="#94a3b8" />
                <YAxis domain={["auto", "auto"]} stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <ReferenceArea y1={info.lo} y2={Math.min(info.hi, 10.5 * (key === "mood" ? 1 : 100))} fill="#10b981" fillOpacity={0.08} />
                <ReferenceLine x={day} stroke="#38bdf8" />
                <Line type="monotone" dataKey="value" stroke="#e2e8f0" dot={false} isAnimationActive={false} />
                <Line dataKey="flag" stroke="none" dot={{ r: 4, fill: "#f59e0b" }} activeDot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-medium">Alerts for day {day}</h2>
          <p className="text-xs text-slate-400">Help from Earth is delayed on long missions, so check yourself first and escalate early.</p>
          <div className="mt-3 space-y-3">
            {alerts.length === 0 && <p className="text-sm text-slate-400">All indicators are close to this astronaut&apos;s own baseline.</p>}
            {alerts.map((a) => (
              <div key={a.k} className={`rounded-lg border p-3 text-sm ${BOX[a.status]}`}>
                <div className={`font-medium ${TXT[a.status]}`}>{I[a.k].label}: {LABEL[a.status]}</div>
                <p className="mt-1 text-slate-200">What changed: {data[i][a.k]} {I[a.k].unit} today. Your baseline is {base[a.k].mu.toFixed(1)}.</p>
                <p className="text-slate-300">Why it matters ({I[a.k].hazard}): {I[a.k].why}</p>
                <p className="text-slate-300">What to do: {I[a.k].action}</p>
                <p className="text-slate-200">{a.status === "alert" ? "Contact the flight surgeon now." : "Measure again tomorrow. If it continues for 3 more days, contact the flight surgeon."}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[200px_1fr]">
          <svg viewBox="0 0 120 250" className="mx-auto h-72" role="img" aria-label="Clickable body figure">
            <g onClick={() => setRid("body")} className="cursor-pointer" fill={fill("body")}>
              <rect x="12" y="62" width="16" height="84" rx="8" />
              <rect x="92" y="62" width="16" height="84" rx="8" />
              <rect x="38" y="150" width="19" height="92" rx="9" />
              <rect x="63" y="150" width="19" height="92" rx="9" />
            </g>
            <circle cx="60" cy="30" r="22" fill={fill("head")} className="cursor-pointer" onClick={() => setRid("head")} />
            <rect x="34" y="58" width="52" height="42" rx="14" fill={fill("chest")} className="cursor-pointer" onClick={() => setRid("chest")} />
            <rect x="34" y="104" width="52" height="44" rx="14" fill={fill("abdomen")} className="cursor-pointer" onClick={() => setRid("abdomen")} />
          </svg>
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button key={r.id} onClick={() => setRid(r.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${rid === r.id ? "border-sky-400 text-sky-300" : "border-slate-700 text-slate-300"}`}>{r.label}</button>
              ))}
            </div>
            <h2 className="font-medium">{reg.label}</h2>
            <p className="text-xs text-sky-300">NASA hazard: {reg.hazard}</p>
            <p className="mt-2 text-sm text-slate-300">{reg.text}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {reg.keys.map((k) => {
                const s = st.find((x) => x.k === k)!;
                return <li key={k} className={TXT[s.status]}>{I[k].label}: {data[i][k]} {I[k].unit} ({LABEL[s.status]})</li>;
              })}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-medium">Does personal baseline detection help?</h2>
          <p className="text-xs text-slate-400">Tested on the simulated mission with two injected drifts. Compared with a fixed normal range.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-slate-400"><tr><th className="py-1">Indicator</th><th>Drift starts</th><th>Baseline method flags</th><th>Fixed range flags</th><th>Result</th></tr></thead>
              <tbody>
                {val.map((v) => (
                  <tr key={v.k} className="border-t border-slate-800">
                    <td className="py-1">{I[v.k].label}</td><td>Day {v.start}</td><td>{dayText(v.baseline)}</td><td>{dayText(v.fixed)}</td>
                    <td className="text-emerald-300">{v.earlier !== null ? `${v.earlier} days earlier` : v.baseline !== null ? "only baseline caught it" : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400">Flags on quiet days (days {CAL + 1} to {CAL + fa.days}): baseline method {fa.b}, fixed range {fa.f}.</p>
        </section>

        <footer className="pb-6 text-xs text-slate-500">
          Data is simulated. Ranges are demo values. Hazard information is based on the NASA Human Research Program pages on the five hazards of human spaceflight.
        </footer>
      </div>
    </main>
  );
}
