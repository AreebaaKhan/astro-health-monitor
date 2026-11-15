"use client";

import { useEffect, useMemo, useState } from "react";
import CheckInTab from "./CheckInTab";
import { benchmark } from "@/lib/validation";
import { ALPHA, CAL, EVENTS, I, KEYS, MISSION_DAYS, Z_ALERT, Z_LIMIT, analyze, buildAlert, eventEnd, simulate, statusAt, validate, worst } from "@/lib/health";
import type { Key, Status } from "@/lib/health";
import BodyFigure, { REGIONS } from "./BodyFigure";
import TrendChart from "./TrendChart";
import EarthGlobe from "./EarthGlobe";
import { ACCENT, DOT, GLOW, HEX, LABEL, NUM, TXT } from "./status";

const pad = (n: number, w = 3) => String(n).padStart(w, "0");
const card = "surface";
const tealCard = "surface";
const head = "text-sm font-semibold text-slate-800";
const tag = "text-[13px] font-semibold text-slate-600";
const col = (s: Status) => HEX[s];

type Tab = "home" | "checkin" | "vitals" | "body" | "validation";
const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "checkin", label: "Check-in" },
  { id: "vitals", label: "Vitals" },
  { id: "body", label: "Body" },
  { id: "validation", label: "Validation" },
];

// Marker positions around the globe, in percent of the globe wrapper.
const MARKERS: Record<Key, [number, number]> = {
  sleep: [18, 20],
  mood: [80, 16],
  hr: [8, 52],
  bp: [92, 50],
  glucose: [24, 84],
  temp: [76, 86],
};

function Spark({ v, color }: { v: number[]; color: string }) {
  const mn = Math.min(...v), r = Math.max(...v) - mn || 1;
  const pts = v.map((x, j) => [(j / (v.length - 1 || 1)) * 200, 52 - ((x - mn) / r) * 46]);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 200 56" preserveAspectRatio="none" className="h-12 w-full" aria-hidden>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke"  />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

function Bars({ v, color, h = "h-24" }: { v: number[]; color: string; h?: string }) {
  const mn = Math.min(...v), r = Math.max(...v) - mn || 1;
  return (
    <div className={`flex ${h} items-end gap-1.5`} aria-hidden>
      {v.map((x, j) => (
        <div key={j} className="flex-1 rounded-sm" style={{ height: `${18 + ((x - mn) / r) * 82}%`, background: `linear-gradient(180deg, ${color}, ${color}33)`, opacity: 0.45 + 0.55 * (j / v.length), boxShadow: `0 0 10px ${color}44` }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const data = useMemo(() => simulate(), []);
  const { z, base } = useMemo(() => analyze(data), [data]);
  const batch = useMemo(() => benchmark(), []);
  const val = useMemo(() => validate(data, z), [data, z]);
  const [tab, setTab] = useState<Tab>("home");
  const [day, setDay] = useState(75);
  const [key, setKey] = useState<Key>("sleep");
  const [rid, setRid] = useState<string | null>("head");
  const [playing, setPlaying] = useState(false);
  const running = playing && day < MISSION_DAYS;
  const i = day - 1;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setDay((d) => Math.min(MISSION_DAYS, d + 1)), 110);
    return () => clearInterval(t);
  }, [running]);

  const st = KEYS.map((k) => statusAt(data, z, k, i));
  const stOf = (k: Key) => st.find((s) => s.k === k)!;
  const overall = worst(st.map((s) => s.status));
  const flagged = st.filter((s) => s.status !== "ok");
  const region = REGIONS.find((r) => r.id === rid) ?? null;
  const regionStatus = (id: string): Status | null => {
    const r = REGIONS.find((x) => x.id === id);
    return r && r.keys.length ? worst(r.keys.map((k) => stOf(k).status)) : null;
  };
  const alerts = flagged
    .sort((a, b) => (a.status === "alert" ? 0 : 1) - (b.status === "alert" ? 0 : 1))
    .map((s) => buildAlert(data, z, base, s.k, i));
  const info = I[key];
  const sel = stOf(key);
  const progress = i / (MISSION_DAYS - 1);
  const delay = Math.round(3 + 19 * progress); // illustrative one-way signal delay in minutes
  const S = val.summary;
  const recent = (k: Key, n: number) => data.slice(Math.max(0, i - n + 1), i + 1).map((d) => d[k]);

  const pickRegion = (id: string | null) => {
    setRid(id);
    const r = REGIONS.find((x) => x.id === id);
    if (r && r.keys.length && !r.keys.includes(key)) setKey(r.keys[0]);
  };

  // Day scrubber styled like the search bar in the reference
  const scrub = (
    <div className="flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
      <button onClick={() => { if (day >= MISSION_DAYS) setDay(1); setPlaying(!running); }}
        className="w-20 shrink-0 rounded-full border border-blue-200 px-3 py-1 font-sans text-[13px] text-blue-700 shadow-sm hover:bg-blue-600/10">
        {running ? "Pause" : "Play"}
      </button>
      <label htmlFor="day" className="sr-only">Mission day</label>
      <input id="day" type="range" min={1} max={MISSION_DAYS} value={day} onChange={(e) => { setDay(Number(e.target.value)); setPlaying(false); }} className="w-full" />
      <span className="w-14 shrink-0 text-right font-sans text-sm text-slate-600">D+{pad(day)}</span>
    </div>
  );

  const alertsPanel = (
    <section className={`${tealCard} flex max-h-[600px] flex-col p-4 ${flagged.length ? GLOW[overall] : ""}`}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className={`${head} ${TXT[overall]}`}>Alerts · day {day}</h2>
        <span className={`rounded-full border px-2 py-0.5 font-sans text-[13px] ${GLOW[overall]} ${TXT[overall]}`}>{flagged.length} flagged</span>
      </div>
      <p className="mb-2 text-[13px] text-slate-600">Ground replies take time. Check yourself first, escalate early.</p>
      <div className="app-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {alerts.length === 0 && <p className="text-sm text-slate-600">All indicators are close to this astronaut&apos;s own baseline.</p>}
        {alerts.map((a) => {
          const rows: [string, string][] = [["What changed", a.what], ["What to do", a.action], ["When to escalate", a.escalate]];
          return (
            <article key={a.k} className={`rounded-xl border bg-white p-3 ${GLOW[a.status]}`}>
              <div className={`mb-1.5 flex items-center gap-2 font-sans text-[13px] font-bold ${TXT[a.status]}`}>
                <span className={`h-2 w-2 rounded-full ${DOT[a.status]}`} />[{LABEL[a.status]}] {I[a.k].label}
              </div>
              <dl className="space-y-1.5 text-sm">
                {rows.map(([t, v]) => <div key={t}><dt className={tag}>{t}</dt><dd className="text-slate-900">{v}</dd></div>)}
              </dl>
              <details className="mt-3 text-sm"><summary>Why it matters</summary><p className="mt-2 text-slate-600">{a.why}</p></details>
            </article>
          );
        })}
      </div>
    </section>
  );

  const home = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_350px]">
      <div className="space-y-4">
        {/* Hero with Earth */}
        <section className={`${card} mission-hero`}>
          <div className="hero-wash" />
          <div className="hero-heading">
            <div className={head}>Crew health · live globe</div>
            <div className="font-sans text-[13px] text-slate-600">Simulated Mars transit: select a vital to explore</div>
          </div>

          <div className="globe-stage">
            <div className="globe-canvas relative h-[400px] w-[400px]">
              <svg viewBox="0 0 400 400" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                <g transform="rotate(-18 200 200)">
                  <ellipse cx="200" cy="200" rx="196" ry="70" fill="none" stroke={ACCENT} strokeOpacity="0.45" strokeDasharray="3 6" />
                  <circle cx={200 + 196 * Math.cos(Math.PI - progress * Math.PI)} cy={200 + 70 * Math.sin(Math.PI - progress * Math.PI)} r="5" fill={HEX[overall]} stroke="#04070b" strokeWidth="1.5">
                    <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                  </circle>
                </g>
              </svg>
              <EarthGlobe size={330} />
              {KEYS.map((k) => {
                const s = stOf(k);
                const [x, y] = MARKERS[k];
                const c = col(s.status);
                const on = key === k;
                return (
                  <button key={k} onClick={() => setKey(k)} aria-label={I[k].label}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-left outline-none"
                    style={{ left: `${x}%`, top: `${y}%` }}>
                    <span className="relative flex items-center gap-2">
                      <span className="relative flex h-5 w-5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40" style={{ background: c }} />
                        <span className="relative h-3 w-3 rounded-full border-2 border-black" style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
                      </span>
                      <span className={`rounded-md border px-2 py-0.5 font-sans text-[13px] backdrop-blur ${on ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-900"}`}>
                        {I[k].short} {data[i][k].toFixed(I[k].dp)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected indicator card (like the NORAD card) */}
          <aside className={`hero-reading ${GLOW[sel.status]}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={head}>{info.short}</div>
                <div className="font-sans text-[13px] text-slate-600">{info.label}</div>
              </div>
              <span className={`font-sans text-[13px] ${TXT[sel.status]}`}>{sel.status === "watch" && sel.drift && sel.fixed === "ok" ? "Drifting" : LABEL[sel.status]}</span>
            </div>
            <div className={`mt-1 font-sans text-3xl font-semibold ${NUM[sel.status]}`}>{data[i][key].toFixed(info.dp)} <span className="text-sm font-normal text-slate-600">{info.unit}</span></div>
            <div className="mt-1 grid grid-cols-2 gap-2 font-sans text-[13px] text-slate-600">
              <div><div className="text-slate-500">Baseline</div><div className="text-slate-900">{base[key].series[i].toFixed(info.dp)}</div></div>
              <div><div className="text-slate-500">Normal range</div><div className="text-slate-900">{info.lo} to {info.hi}</div></div>
            </div>
            <div className="mt-2 border-t border-slate-200 pt-2 text-[13px] text-slate-600">Hazard: <span className="text-blue-700">{info.hazard}</span></div>
          </aside>

          <div className="hero-controls">
            <button onClick={() => setTab("body")} className="rounded-full border border-blue-200 bg-white px-5 py-2 font-sans text-[13px] tracking-normal text-blue-700 shadow-sm hover:bg-blue-600/10">Explore body</button>
            <div className="min-w-0 flex-1">{scrub}</div>
          </div>
        </section>

        {/* Bottom three cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <section className={`${card} p-4`}>
            <div className="flex items-start justify-between">
              <h2 className={head}>{info.short} · last 12 days</h2>
              <span className="font-sans text-[13px] text-slate-600">{info.unit}</span>
            </div>
            <div className={`mt-1 font-sans text-3xl ${NUM[sel.status]}`}>{data[i][key].toFixed(info.dp)}</div>
            <div className="mt-3"><Bars v={recent(key, 12)} color={col(sel.status)} /></div>
          </section>

          <section className={`${card} p-4`}>
            <h2 className={head}>Mission events</h2>
            <ul className="mt-3 space-y-2.5">
              {EVENTS.map((e) => {
                const active = day >= e.start && day <= eventEnd(e);
                return (
                  <li key={e.id} className="flex items-start gap-3">
                    <div className={`w-14 shrink-0 rounded-md border px-1.5 py-1 text-center font-sans text-[13px] ${active ? "border-amber-300/60 text-amber-700" : "border-slate-200 text-slate-600"}`}>D{e.start}</div>
                    <div className="min-w-0">
                      <div className="truncate text-sm text-slate-900">{e.name}</div>
                      <div className="font-sans text-[13px] text-slate-500">{e.hazard} · to D{eventEnd(e)}{active ? " · ACTIVE" : ""}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={`${card} p-4`}>
            <h2 className={head}>Deviation from baseline</h2>
            <ul className="mt-3 space-y-2">
              {KEYS.map((k) => {
                const s = stOf(k);
                const zz = Math.abs(z[k][i]);
                return (
                  <li key={k} className="flex items-center gap-2 font-sans text-[13px] text-slate-600">
                    <span className="w-12 shrink-0 text-slate-600">{I[k].short}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(1, zz / Z_ALERT) * 100}%`, background: col(s.status), boxShadow: `0 0 8px ${col(s.status)}` }} />
                    </div>
                    <span className="w-8 text-right">{zz.toFixed(1)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 font-sans text-[13px] text-slate-500">Smoothed z-score. Caution above {Z_LIMIT}, alert above {Z_ALERT}.</p>
          </section>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {alertsPanel}

        <section className={`${tealCard} overflow-hidden`}>
          <div className="mission-illustration" aria-hidden="true" />
          <div className="p-4">
            <div className={head}>Mission clock</div>
            <div className={`font-sans text-4xl font-semibold ${NUM.ok}`}>D+{pad(day)}</div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 shadow-sm" style={{ width: `${progress * 100}%` }} /></div>
            <p className="mt-2 font-sans text-[13px] text-slate-600">Crew CDR-01 (simulated) · {pad((day - 1) * 24, 4)} h · Mars transit</p>
            <p className="font-sans text-[13px] text-slate-600">Ground link delay: ~{delay} min (illustrative)</p>
          </div>
        </section>

        <section className={`${tealCard} overflow-hidden`}>
          <div className="care-illustration" aria-hidden="true"><svg viewBox="0 0 300 50"><path d="M0 28 H75 L90 28 L101 15 L112 40 L127 5 L140 28 H180 L191 21 L202 28 H300" fill="none" stroke="currentColor" strokeWidth="2" /></svg></div>
          <div className="p-4">
            <div className={head}>Recommendation · {info.short}</div>
            <p className="mt-1 text-sm text-slate-900">{sel.status === "ok" ? "Readings are close to your baseline. Keep up routine measurements and daily exercise." : info.action}</p>
          </div>
        </section>
      </div>
    </div>
  );

  const vitals = (
    <div className="space-y-4">
      {scrub}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {KEYS.map((k) => {
          const s = stOf(k);
          return (
            <button key={k} onClick={() => setKey(k)} aria-label={I[k].label}
              className={`${card} p-3 text-left transition hover:bg-blue-50 ${GLOW[s.status]} ${key === k ? "ring-2 ring-blue-500/50" : ""}`}>
              <div className={head}>{k === "hr" && <span className="text-red-600" aria-hidden="true">&#9829; </span>}{I[k].label}</div>
              <div className={`mt-1 font-sans text-2xl font-semibold ${k === "hr" ? NUM.alert : NUM[s.status]}`}>{data[i][k].toFixed(I[k].dp)}</div>
              <div className="font-sans text-[13px] text-slate-600">{I[k].unit}</div>
              <div className="mt-2"><Spark v={recent(k, 30)} color={k === "hr" ? HEX.alert : col(s.status)} /></div>
              <div className="flex justify-between font-sans text-[13px]">
                <span className={TXT[s.status]}>{s.status === "watch" && s.drift && s.fixed === "ok" ? "Drifting" : LABEL[s.status]}</span>
                <span className="text-slate-500">base {base[k].series[i].toFixed(I[k].dp)}</span>
              </div>
            </button>
          );
        })}
      </div>
      <section className={`${card} p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={head}>{info.label} · base-vs-current over the mission</h2>
          <p className="font-sans text-[13px] text-slate-600"><span className="text-slate-900">slate</span> readings · <span className="text-blue-700">blue dashed</span> your baseline · <span className="text-amber-700">amber</span> drift flags · <span className="text-red-600">red</span> alert limits · grey is the future</p>
        </div>
        <div className="mt-2"><TrendChart data={data} z={z} base={base} k={key} day={day} /></div>
      </section>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {KEYS.map((k) => (
          <button key={k} onClick={() => setKey(k)} className={`${card} p-3 text-left ${key === k ? "ring-2 ring-blue-500/50" : ""}`} aria-label={`${I[k].label} chart`}>
            <div className={head}>{k === "hr" && <span className="text-red-600" aria-hidden="true">&#9829; </span>}{I[k].label}</div>
            <TrendChart data={data} z={z} base={base} k={k} day={day} compact />
          </button>
        ))}
      </div>
    </div>
  );

  const body = (
    <div className="space-y-4">
      {scrub}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className={`${card} p-5`}>
          <div className="flex items-center justify-between">
            <h2 className={head}>Body health map · live status</h2>
            {rid && <button onClick={() => pickRegion(null)} className="font-sans text-[13px] tracking-normal text-blue-700 hover:underline">Show all</button>}
          </div>
          <div className="h-[520px]"><BodyFigure selected={rid} statusOf={regionStatus} onSelect={pickRegion} /></div>
        </section>
        <div className="space-y-4">
          <section className={`${tealCard} p-5`}>
            {region ? (
              <>
                <h3 className="text-sm font-bold tracking-normal" style={{ color: ACCENT }}>{region.label}</h3>
                <div className={`${tag} mt-1`}>NASA hazard: {region.hazards.join(", ")}</div>
                <p className="mt-2 text-sm text-slate-900">{region.text}</p>
                {region.keys.length > 0 && (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {region.keys.map((k) => {
                        const s = stOf(k);
                        return (
                          <div key={k} className={`rounded-xl border bg-white p-2.5 ${GLOW[s.status]}`}>
                            <div className="text-[13px] text-slate-600">{I[k].label}</div>
                            <div className={`font-sans text-xl ${NUM[s.status]}`}>{data[i][k].toFixed(I[k].dp)} <span className="text-[13px] text-slate-600">{I[k].unit}</span></div>
                            <div className={`font-sans text-[13px] ${TXT[s.status]}`}>{LABEL[s.status]}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-sm text-slate-900"><span className="text-slate-600">Advice: </span>
                      {region.keys.some((k) => stOf(k).status !== "ok")
                        ? region.keys.filter((k) => stOf(k).status !== "ok").map((k) => I[k].action).join(" ")
                        : "Readings are close to your baseline. Keep up routine measurements and exercise."}
                    </p>
                  </>
                )}
              </>
            ) : <p className="text-sm text-slate-600">Click a glowing node, a body part or the dashed radiation ring. Node colors show the worst status of the linked indicators.</p>}
          </section>
          {alertsPanel}
        </div>
      </div>
    </div>
  );

  const validation = (
    <div className="space-y-4">
      <section className={`${card} p-5`}>
        <h2 className="text-2xl font-semibold">Does personal baseline detection help?</h2>
        <p className="mt-2 text-slate-600">Reproducible benchmark: 40 simulated missions, seeds 1 to 40.</p>
        <div className="benchmark-grid">
          <div><strong>{batch.mean.toFixed(1)} days</strong><span>Average earlier detection</span></div>
          <div><strong>{batch.baselineCaught}/{batch.total}</strong><span>Drifts caught by baseline</span></div>
          <div><strong>{batch.baselineRate.toFixed(1)}%</strong><span>Quiet-day flags, baseline</span></div>
          <div><strong>{batch.fixedRate.toFixed(1)}%</strong><span>Quiet-day flags, fixed ranges</span></div>
        </div>
        <p className="text-sm text-slate-600">Mission lead times: median {batch.median.toFixed(1)}, range {batch.min.toFixed(1)} to {batch.max.toFixed(1)} days. Fixed ranges caught {batch.fixedCaught}/{batch.total} drifts. Lead time includes only drifts caught by both methods. These synthetic tests are not clinical validation.</p>
        <h3 className="mt-6 border-t border-slate-200 pt-5 font-semibold">Selected demo mission (seed 5)</h3>
        <p className="mt-1 text-sm text-slate-600">
          {val.rows.length} indicator drifts across 3 injected events on the simulated mission. The first {CAL} days set your baseline, which then follows quiet days slowly. An EWMA (alpha {ALPHA}) of the z-score flags drift above {Z_LIMIT}, and alert above {Z_ALERT}. False alarms: baseline {S.baselineFlags} of {S.quietDays} quiet indicator days, fixed {S.fixedFlags}.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            [`${S.meanEarlier >= 0 ? "+" : ""}${S.meanEarlier.toFixed(1)} d`, "average lead"],
            [`${S.caughtBaseline}/${S.total}`, `drifts caught (fixed ${S.caughtFixed})`],
            [`${S.baselineRate.toFixed(1)}%`, "false alarms, baseline"],
            [`${S.fixedRate.toFixed(1)}%`, "false alarms, fixed"],
          ].map(([big, small]) => (
            <div key={small} className="rounded-xl border border-blue-200 bg-white p-3">
              <div className={`font-sans text-2xl ${NUM.ok}`}>{big}</div>
              <div className="text-[13px] text-slate-600">{small}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead className={tag}><tr><th className="py-1 font-normal">Indicator</th><th className="font-normal">Starts</th><th className="font-normal">Baseline</th><th className="font-normal">Fixed</th><th className="font-normal">Result</th></tr></thead>
            <tbody className="font-sans text-[13px]">
              {val.rows.map((v) => (
                <tr key={v.k} className="border-t border-slate-200">
                  <td className="py-2 font-sans text-sm">{I[v.k].label}</td><td>D{v.start}</td><td>{v.baseline === null ? "never" : `D${v.baseline}`}</td><td>{v.fixed === null ? "never" : `D${v.fixed}`}</td>
                  <td style={{ color: v.earlier === null || v.earlier > 0 ? ACCENT : HEX.watch }}>
                    {v.earlier === null ? (v.baseline !== null ? "only baseline" : "-") : v.earlier > 0 ? `${v.earlier} d earlier` : v.earlier === 0 ? "same day" : `${-v.earlier} d later`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-slate-500">Honest note: the baseline method raises more flags on quiet days than a fixed range. That is the price of catching slow drift early. A fixed range can also fire first on one noisy reading.</p>
      </section>
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6F8FB] text-slate-900">

      <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-[520px] w-[520px] rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[460px] w-[460px] rounded-full bg-blue-700/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] space-y-6 p-4 md:p-7">
        <header className="flex flex-wrap items-center gap-4 px-2 py-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 font-sans text-sm font-bold text-blue-700 shadow-sm">AH</div>
            <div className="text-lg font-bold tracking-normal">Astro<span style={{ color: ACCENT }}>Health</span></div>
          </div>
          <nav className="main-nav" aria-label="Sections">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); if (t.id === "checkin") setPlaying(false); }} aria-current={tab === t.id ? "page" : undefined}
                className={`rounded-full px-5 py-1.5 font-sans text-[13px] tracking-normal transition ${tab === t.id ? "border border-blue-200 text-blue-700 shadow-sm" : "border border-transparent text-slate-600 hover:text-slate-900"}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div role="status" className={`flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 font-sans text-[13px] ${GLOW[overall]} ${TXT[overall]}`}>
              <span className={`h-2 w-2 rounded-full ${DOT[overall]}`} />
              {tab === "checkin" ? "Personal check-in" : overall === "ok" ? "All normal" : `${LABEL[overall]} · ${flagged.length} flagged`}
            </div>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white" aria-label={`${flagged.length} alerts`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
              {flagged.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-600" />}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 font-sans text-[13px] font-bold text-black" title="Crew CDR-01 (simulated)">CDR</div>
          </div>
        </header>

        {tab !== "checkin" && <div className="page-intro"><div><p className="eyebrow">Mission health overview</p><h1 className="page-title">{overall === "ok" ? "Looking steady today." : "A few changes worth checking."}</h1><p className="muted mt-2">{flagged.length ? `${flagged.length} indicators need attention. Review the next steps below.` : "Your readings are close to your usual pattern."}</p></div><button className="primary-button" onClick={() => { setPlaying(false); setTab("checkin"); }}>+ Daily check-in</button></div>}
        {tab === "home" && home}
        {tab === "checkin" && <CheckInTab />}
        {tab === "vitals" && vitals}
        {tab === "body" && body}
        {tab === "validation" && validation}

        <footer className="pb-4 text-center font-sans text-[13px] text-slate-500">
          Guidance only, not a medical diagnosis. Mission data is simulated. Check-in entries are user-entered and stored only in this browser. Reference ranges are demo values. Hazards follow the NASA Human Research Program pages on the five hazards of human spaceflight.
        </footer>
      </div>
    </main>
  );
}
