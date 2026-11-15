"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { ALPHA, CAL, EVENTS, I, KEYS, MISSION_DAYS, Z_ALERT, Z_LIMIT, analyze, buildAlert, eventEnd, simulate, statusAt, validate, worst } from "@/lib/health";
import type { Key, Status } from "@/lib/health";
import BodyFigure, { REGIONS } from "./BodyFigure";
import TrendChart from "./TrendChart";
import EarthGlobe from "./EarthGlobe";
import { ACCENT, DOT, GLOW, HEX, LABEL, NUM, TXT } from "./status";

// Public-domain NASA photos hosted on Wikimedia Commons. Gradients show if an image fails to load.
const IMG = (file: string, w: number) => `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${w}`;
const PIC_ASTRONAUT = IMG("Michael_Gernhardt_in_space_during_STS-69_in_1995.jpg", 600);
const PIC_ISS = IMG("Iss018e009339.jpg", 600);

const photo = (url: string, shade = 0.7): CSSProperties => ({
  backgroundImage: `linear-gradient(180deg, rgba(4,10,16,0.1), rgba(4,10,16,${shade})), url(${url}), linear-gradient(135deg,#0f4a55,#06141b)`,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

const pad = (n: number, w = 3) => String(n).padStart(w, "0");
const card = "rounded-2xl border border-white/10 bg-[#080d12]/80 backdrop-blur-xl shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)]";
const tealCard = "rounded-2xl border border-cyan-300/20 bg-gradient-to-b from-[#0e4350]/70 to-[#071b24]/85 backdrop-blur-xl shadow-[0_10px_40px_-18px_rgba(45,212,232,0.35)]";
const head = "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200";
const tag = "font-mono text-[10px] uppercase tracking-widest text-cyan-200/60";
const col = (s: Status) => (s === "ok" ? ACCENT : HEX[s]);

type Tab = "home" | "vitals" | "body" | "validation";
const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "HOME" },
  { id: "vitals", label: "VITALS" },
  { id: "body", label: "BODY" },
  { id: "validation", label: "VALIDATION" },
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
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
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
    <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/50 px-3 py-2 backdrop-blur">
      <button onClick={() => { if (day >= MISSION_DAYS) setDay(1); setPlaying(!running); }}
        className="w-20 rounded-full border border-cyan-300/60 px-3 py-1 font-mono text-[11px] text-cyan-100 shadow-[0_0_14px_rgba(45,212,232,0.3)] hover:bg-cyan-300/10">
        {running ? "PAUSE" : "PLAY"}
      </button>
      <label htmlFor="day" className="sr-only">Mission day</label>
      <input id="day" type="range" min={1} max={MISSION_DAYS} value={day} onChange={(e) => { setDay(Number(e.target.value)); setPlaying(false); }} className="w-full" />
      <span className="w-14 text-right font-mono text-xs text-slate-300">D+{pad(day)}</span>
    </div>
  );

  const alertsPanel = (
    <section className={`${tealCard} flex max-h-[520px] flex-col p-4 ${flagged.length ? GLOW[overall] : ""}`}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className={`${head} ${TXT[overall]}`}>Alerts · day {day}</h2>
        <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${GLOW[overall]} ${TXT[overall]}`}>{flagged.length} FLAGGED</span>
      </div>
      <p className="mb-2 text-[11px] text-slate-300/80">Ground replies take time. Check yourself first, escalate early.</p>
      <div className="neon-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {alerts.length === 0 && <p className="text-sm text-slate-300">All indicators are close to this astronaut&apos;s own baseline.</p>}
        {alerts.map((a) => {
          const rows: [string, string][] = [["1 What changed", a.what], ["2 Why it matters in space", a.why], ["3 What to do now", a.action], ["4 When to escalate", a.escalate]];
          return (
            <article key={a.k} className={`rounded-xl border bg-black/30 p-3 ${GLOW[a.status]}`}>
              <div className={`mb-1.5 flex items-center gap-2 font-mono text-[11px] font-bold ${TXT[a.status]}`}>
                <span className={`h-2 w-2 rounded-full ${DOT[a.status]}`} />[{LABEL[a.status]}] {I[a.k].label}
              </div>
              <dl className="space-y-1.5 text-xs">
                {rows.map(([t, v]) => <div key={t}><dt className={tag}>{t}</dt><dd className="text-slate-100">{v}</dd></div>)}
              </dl>
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
        <section className={`${card} relative h-[470px] overflow-hidden`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(14,90,130,0.45),transparent_62%)]" />
          <div className="absolute left-5 top-4 z-10">
            <div className={head}>Crew health · live globe</div>
            <div className="font-mono text-[10px] text-slate-400">Tap a marker to inspect an indicator</div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-[400px] w-[400px]">
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
                      <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] backdrop-blur ${on ? "border-cyan-300 bg-cyan-300/15 text-cyan-100" : "border-white/15 bg-black/55 text-slate-200"}`}>
                        {I[k].short} {data[i][k].toFixed(I[k].dp)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected indicator card (like the NORAD card) */}
          <aside className={`absolute right-4 top-4 z-10 w-60 p-3 ${card} ${GLOW[sel.status]}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className={head}>{info.short}</div>
                <div className="font-mono text-[10px] text-slate-400">{info.label}</div>
              </div>
              <span className={`font-mono text-[10px] ${TXT[sel.status]}`}>{sel.status === "watch" && sel.drift && sel.fixed === "ok" ? "DRIFTING" : LABEL[sel.status]}</span>
            </div>
            <div className={`mt-1 font-mono text-3xl font-semibold ${NUM[sel.status]}`}>{data[i][key].toFixed(info.dp)} <span className="text-xs font-normal text-slate-400">{info.unit}</span></div>
            <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-400">
              <div><div className="text-slate-500">Baseline</div><div className="text-slate-200">{base[key].series[i].toFixed(info.dp)}</div></div>
              <div><div className="text-slate-500">Normal range</div><div className="text-slate-200">{info.lo} to {info.hi}</div></div>
            </div>
            <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-slate-400">Hazard: <span className="text-cyan-200">{info.hazard}</span></div>
          </aside>

          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-3">
            <button onClick={() => setTab("body")} className="rounded-full border border-cyan-300/70 bg-black/50 px-5 py-2 font-mono text-[11px] tracking-widest text-cyan-100 shadow-[0_0_18px_rgba(45,212,232,0.4)] hover:bg-cyan-300/10">OPEN BODY SCAN</button>
            <div className="flex-1">{scrub}</div>
          </div>
        </section>

        {/* Bottom three cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <section className={`${card} p-4`}>
            <div className="flex items-start justify-between">
              <h2 className={head}>{info.short} · last 12 days</h2>
              <span className="font-mono text-[10px] text-slate-400">{info.unit}</span>
            </div>
            <div className={`mt-1 font-mono text-3xl ${NUM[sel.status]}`}>{data[i][key].toFixed(info.dp)}</div>
            <div className="mt-3"><Bars v={recent(key, 12)} color={col(sel.status)} /></div>
          </section>

          <section className={`${card} p-4`}>
            <h2 className={head}>Mission events</h2>
            <ul className="mt-3 space-y-2.5">
              {EVENTS.map((e) => {
                const active = day >= e.start && day <= eventEnd(e);
                return (
                  <li key={e.id} className="flex items-start gap-3">
                    <div className={`w-14 shrink-0 rounded-md border px-1.5 py-1 text-center font-mono text-[10px] ${active ? "border-amber-300/60 text-amber-200" : "border-white/10 text-slate-400"}`}>D{e.start}</div>
                    <div className="min-w-0">
                      <div className="truncate text-xs text-slate-100">{e.name}</div>
                      <div className="font-mono text-[10px] text-slate-500">{e.hazard} · to D{eventEnd(e)}{active ? " · ACTIVE" : ""}</div>
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
                  <li key={k} className="flex items-center gap-2 font-mono text-[10px] text-slate-300">
                    <span className="w-12 shrink-0 text-slate-400">{I[k].short}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(1, zz / Z_ALERT) * 100}%`, background: col(s.status), boxShadow: `0 0 8px ${col(s.status)}` }} />
                    </div>
                    <span className="w-8 text-right">{zz.toFixed(1)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 font-mono text-[10px] text-slate-500">Smoothed z-score. Caution above {Z_LIMIT}, alert above {Z_ALERT}.</p>
          </section>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {alertsPanel}

        <section className={`${tealCard} overflow-hidden`}>
          <div className="h-24" style={photo(PIC_ASTRONAUT, 0.75)} />
          <div className="p-4">
            <div className={head}>Mission clock</div>
            <div className={`font-mono text-4xl font-semibold ${NUM.ok}`}>D+{pad(day)}</div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(45,212,232,0.8)]" style={{ width: `${progress * 100}%` }} /></div>
            <p className="mt-2 font-mono text-[11px] text-slate-300">Crew CDR-01 (simulated) · {pad((day - 1) * 24, 4)} h · Mars transit</p>
            <p className="font-mono text-[11px] text-slate-400">Ground link delay: ~{delay} min (illustrative)</p>
          </div>
        </section>

        <section className={`${tealCard} overflow-hidden`}>
          <div className="h-24" style={photo(PIC_ISS, 0.75)} />
          <div className="p-4">
            <div className={head}>Recommendation · {info.short}</div>
            <p className="mt-1 text-xs text-slate-200">{sel.status === "ok" ? "Readings are close to your baseline. Keep up routine measurements and daily exercise." : info.action}</p>
          </div>
        </section>
      </div>
    </div>
  );

  const vitals = (
    <div className="space-y-4">
      {scrub}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {KEYS.map((k) => {
          const s = stOf(k);
          return (
            <button key={k} onClick={() => setKey(k)} aria-label={I[k].label}
              className={`${card} p-3 text-left transition hover:bg-white/[0.05] ${GLOW[s.status]} ${key === k ? "ring-2 ring-cyan-300/80" : ""}`}>
              <div className={head}>{I[k].short}</div>
              <div className={`mt-1 font-mono text-2xl font-semibold ${NUM[s.status]}`}>{data[i][k].toFixed(I[k].dp)}</div>
              <div className="font-mono text-[10px] text-slate-400">{I[k].unit}</div>
              <div className="mt-2"><Spark v={recent(k, 30)} color={col(s.status)} /></div>
              <div className="flex justify-between font-mono text-[10px]">
                <span className={TXT[s.status]}>{s.status === "watch" && s.drift && s.fixed === "ok" ? "DRIFTING" : LABEL[s.status]}</span>
                <span className="text-slate-500">base {base[k].series[i].toFixed(I[k].dp)}</span>
              </div>
            </button>
          );
        })}
      </div>
      <section className={`${card} p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={head}>{info.label} · base-vs-current over the mission</h2>
          <p className="font-mono text-[10px] text-slate-400"><span className="text-slate-200">white</span> readings · <span className="text-cyan-300">cyan dashed</span> your baseline · <span className="text-amber-200">amber</span> fixed limits and drift flags · <span className="text-[#ffa08c]">peach</span> alert limits · grey is the future</p>
        </div>
        <div className="mt-2"><TrendChart data={data} z={z} base={base} k={key} day={day} /></div>
      </section>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {KEYS.map((k) => (
          <button key={k} onClick={() => setKey(k)} className={`${card} p-3 text-left ${key === k ? "ring-2 ring-cyan-300/80" : ""}`} aria-label={`${I[k].label} chart`}>
            <div className={head}>{I[k].short}</div>
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
            <h2 className={head}>Body hologram · live status</h2>
            {rid && <button onClick={() => pickRegion(null)} className="font-mono text-[11px] tracking-widest text-cyan-300 hover:underline">SHOW ALL</button>}
          </div>
          <div className="h-[520px]"><BodyFigure selected={rid} statusOf={regionStatus} onSelect={pickRegion} /></div>
        </section>
        <div className="space-y-4">
          <section className={`${tealCard} p-5`}>
            {region ? (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: ACCENT }}>{region.label}</h3>
                <div className={`${tag} mt-1`}>NASA hazard: {region.hazards.join(", ")}</div>
                <p className="mt-2 text-xs text-slate-200">{region.text}</p>
                {region.keys.length > 0 && (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {region.keys.map((k) => {
                        const s = stOf(k);
                        return (
                          <div key={k} className={`rounded-xl border bg-black/30 p-2.5 ${GLOW[s.status]}`}>
                            <div className="text-[11px] text-slate-300">{I[k].label}</div>
                            <div className={`font-mono text-xl ${NUM[s.status]}`}>{data[i][k].toFixed(I[k].dp)} <span className="text-[10px] text-slate-400">{I[k].unit}</span></div>
                            <div className={`font-mono text-[10px] ${TXT[s.status]}`}>{LABEL[s.status]}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-xs text-slate-200"><span className="text-slate-400">Advice: </span>
                      {region.keys.some((k) => stOf(k).status !== "ok")
                        ? region.keys.filter((k) => stOf(k).status !== "ok").map((k) => I[k].action).join(" ")
                        : "Readings are close to your baseline. Keep up routine measurements and exercise."}
                    </p>
                  </>
                )}
              </>
            ) : <p className="text-sm text-slate-300">Click a glowing node, a body part or the dashed radiation ring. Node colors show the worst status of the linked indicators.</p>}
          </section>
          {alertsPanel}
        </div>
      </div>
    </div>
  );

  const validation = (
    <div className="space-y-4">
      <section className={`${card} p-5`}>
        <h2 className={head}>Does personal baseline detection help?</h2>
        <p className="mt-1 text-xs text-slate-400">
          {val.rows.length} injected drifts on the simulated mission. The first {CAL} days set your baseline, which then follows quiet days slowly. An EWMA (alpha {ALPHA}) of the z-score flags drift above {Z_LIMIT}, and alert above {Z_ALERT}. False alarms: baseline {S.baselineFlags} of {S.quietDays} quiet indicator days, fixed {S.fixedFlags}.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            [`${S.meanEarlier >= 0 ? "+" : ""}${S.meanEarlier.toFixed(1)} d`, "average lead"],
            [`${S.caughtBaseline}/${S.total}`, `drifts caught (fixed ${S.caughtFixed})`],
            [`${S.baselineRate.toFixed(1)}%`, "false alarms, baseline"],
            [`${S.fixedRate.toFixed(1)}%`, "false alarms, fixed"],
          ].map(([big, small]) => (
            <div key={small} className="rounded-xl border border-cyan-300/20 bg-black/30 p-3">
              <div className={`font-mono text-2xl ${NUM.ok}`}>{big}</div>
              <div className="text-[11px] text-slate-400">{small}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead className={tag}><tr><th className="py-1 font-normal">Indicator</th><th className="font-normal">Starts</th><th className="font-normal">Baseline</th><th className="font-normal">Fixed</th><th className="font-normal">Result</th></tr></thead>
            <tbody className="font-mono text-[11px]">
              {val.rows.map((v) => (
                <tr key={v.k} className="border-t border-white/10">
                  <td className="py-2 font-sans text-xs">{I[v.k].label}</td><td>D{v.start}</td><td>{v.baseline === null ? "never" : `D${v.baseline}`}</td><td>{v.fixed === null ? "never" : `D${v.fixed}`}</td>
                  <td style={{ color: v.earlier === null || v.earlier > 0 ? ACCENT : HEX.watch }}>
                    {v.earlier === null ? (v.baseline !== null ? "only baseline" : "-") : v.earlier > 0 ? `${v.earlier} d earlier` : v.earlier === 0 ? "same day" : `${-v.earlier} d later`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-slate-500">Honest note: the baseline method raises more flags on quiet days than a fixed range. That is the price of catching slow drift early. A fixed range can also fire first on one noisy reading.</p>
      </section>
    </div>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070b] text-slate-100">
      <div className="stars pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-[520px] w-[520px] rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[460px] w-[460px] rounded-full bg-blue-700/15 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] space-y-4 p-4 md:p-5">
        <header className="flex flex-wrap items-center gap-4 px-2 py-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/60 font-mono text-xs font-bold text-cyan-200 shadow-[0_0_15px_rgba(45,212,232,0.4)]">AH</div>
            <div className="text-lg font-bold uppercase tracking-[0.25em]">Astro<span style={{ color: ACCENT }}>Health</span></div>
          </div>
          <nav className="mx-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur" aria-label="Sections">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}
                className={`rounded-full px-5 py-1.5 font-mono text-[11px] tracking-[0.2em] transition ${tab === t.id ? "border border-cyan-300 text-cyan-100 shadow-[0_0_16px_rgba(45,212,232,0.5)]" : "border border-transparent text-slate-400 hover:text-slate-100"}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div role="status" className={`flex items-center gap-2 rounded-full border bg-black/30 px-3 py-1.5 font-mono text-[11px] ${GLOW[overall]} ${TXT[overall]}`}>
              <span className={`h-2 w-2 rounded-full ${DOT[overall]}`} />
              {overall === "ok" ? "ALL NOMINAL" : `${LABEL[overall]} · ${flagged.length} FLAGGED`}
            </div>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40" aria-label={`${flagged.length} alerts`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
              {flagged.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff8f7a]" />}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-blue-600 font-mono text-[10px] font-bold text-black" title="Crew CDR-01 (simulated)">CDR</div>
          </div>
        </header>

        {tab === "home" && home}
        {tab === "vitals" && vitals}
        {tab === "body" && body}
        {tab === "validation" && validation}

        <footer className="pb-4 text-center font-mono text-[11px] text-slate-500">
          Guidance only, not a medical diagnosis. All data is simulated and ranges are general adult demo values. Hazards follow the NASA Human Research Program pages on the five hazards of human spaceflight. Photos: NASA, public domain (Wikimedia Commons).
        </footer>
      </div>
    </main>
  );
}
