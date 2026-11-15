"use client";

import { useEffect, useMemo, useState } from "react";
import { ALPHA, CAL, EVENTS, I, KEYS, MISSION_DAYS, Z_ALERT, Z_LIMIT, analyze, buildAlert, eventEnd, simulate, statusAt, validate, worst } from "@/lib/health";
import type { Key, Status } from "@/lib/health";
import BodyFigure, { REGIONS } from "./BodyFigure";
import TrendChart from "./TrendChart";
import { ACCENT, DOT, GLOW, HEX, LABEL, NUM, TXT } from "./status";

const pad = (n: number, w = 3) => String(n).padStart(w, "0");
const glass = "rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl";
const head = "text-xs font-bold uppercase tracking-wider text-slate-300";
const tag = "font-mono text-[10px] uppercase tracking-widest text-slate-400";
const col = (s: Status) => (s === "ok" ? ACCENT : HEX[s]);

function Spark({ v, color }: { v: number[]; color: string }) {
  const mn = Math.min(...v), r = Math.max(...v) - mn || 1;
  const pts = v.map((x, j) => [(j / (v.length - 1 || 1)) * 200, 52 - ((x - mn) / r) * 46]);
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 200 56" preserveAspectRatio="none" className="h-14 w-full" aria-hidden>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

function Bars({ v, color }: { v: number[]; color: string }) {
  const mn = Math.min(...v), r = Math.max(...v) - mn || 1;
  return (
    <div className="flex h-12 items-end gap-1" aria-hidden>
      {v.map((x, j) => <div key={j} className="flex-1 rounded-sm" style={{ height: `${20 + ((x - mn) / r) * 80}%`, background: color, opacity: 0.35 + 0.65 * (j / v.length), boxShadow: `0 0 8px ${color}55` }} />)}
    </div>
  );
}

function Gauge({ value, min, max, color }: { value: number; min: number; max: number; color: string }) {
  const f = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const a = Math.PI * (1 - f);
  return (
    <svg viewBox="0 0 120 70" className="h-20 w-full" aria-hidden>
      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${f * 157.08} 157.08`} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
      <line x1="60" y1="60" x2={60 + 38 * Math.cos(a)} y2={60 - 38 * Math.sin(a)} stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="60" r="4" fill="#e2e8f0" />
    </svg>
  );
}

export default function Dashboard() {
  const data = useMemo(() => simulate(), []);
  const { z, base } = useMemo(() => analyze(data), [data]);
  const val = useMemo(() => validate(data, z), [data, z]);
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
  const linked = (k: Key) => !region || region.keys.includes(k);
  const regionStatus = (id: string): Status | null => {
    const r = REGIONS.find((x) => x.id === id);
    return r && r.keys.length ? worst(r.keys.map((k) => stOf(k).status)) : null;
  };
  const alerts = flagged
    .filter((s) => linked(s.k))
    .sort((a, b) => (a.status === "alert" ? 0 : 1) - (b.status === "alert" ? 0 : 1))
    .map((s) => buildAlert(data, z, base, s.k, i));
  const info = I[key];
  const progress = i / (MISSION_DAYS - 1);
  const delay = Math.round(3 + 19 * progress); // illustrative one-way signal delay in minutes
  const when = (d: number | null) => (d === null ? "never flagged" : `Day ${d}`);
  const S = val.summary;
  const recent = (k: Key, n: number) => data.slice(Math.max(0, i - n + 1), i + 1).map((d) => d[k]);

  const pickRegion = (id: string | null) => {
    setRid(id);
    const r = REGIONS.find((x) => x.id === id);
    if (r && r.keys.length && !r.keys.includes(key)) setKey(r.keys[0]);
  };

  const vital = (k: Key, viz: "spark" | "gauge" | "bars" | "num") => {
    const s = stOf(k);
    const c = col(s.status);
    const mu = base[k].series[i];
    return (
      <button key={k} onClick={() => setKey(k)} aria-label={I[k].label}
        className={`${glass} w-full p-4 text-left transition hover:bg-white/[0.06] ${GLOW[s.status]} ${key === k ? "ring-2 ring-cyan-400/80" : ""} ${linked(k) ? "" : "opacity-30"}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className={head}>{I[k].label}</div>
            <div className="font-mono text-[10px] text-slate-500">Base-vs-current</div>
          </div>
          <div className="text-right">
            <div className={`font-mono text-3xl font-semibold leading-none ${NUM[s.status]}`}>{data[i][k].toFixed(I[k].dp)}</div>
            <div className="font-mono text-[10px] text-slate-400">{I[k].unit}</div>
          </div>
        </div>
        <div className="mt-2">
          {viz === "spark" && <Spark v={recent(k, 40)} color={c} />}
          {viz === "gauge" && <Gauge value={data[i][k]} min={80} max={160} color={c} />}
          {viz === "bars" && <Bars v={recent(k, 12)} color={c} />}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px]">
          <span className={TXT[s.status]}>{s.status === "watch" && s.drift && s.fixed === "ok" ? "DRIFTING" : LABEL[s.status]}</span>
          <span className="text-slate-500">base {mu.toFixed(I[k].dp)}</span>
        </div>
      </button>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#02050f] via-[#060913] to-[#0a1128] text-slate-100">
      <div className="stars pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-[480px] w-[480px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1500px] space-y-5 p-4 md:p-6">
        <header className={`${glass} flex items-center gap-4 px-6 py-4`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/50 font-mono text-xs font-bold text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]">AH</div>
          <h1 className="flex-1 text-center text-xl font-bold uppercase tracking-[0.3em] md:text-3xl">
            Astro<span style={{ color: ACCENT }}>Health</span> <span className="hidden font-light text-slate-300 md:inline">Mission Control</span>
          </h1>
          <div className="hidden items-end gap-0.5 sm:flex" aria-hidden>
            {[8, 12, 16, 20].map((h) => <span key={h} className="w-1.5 rounded-sm bg-cyan-400" style={{ height: h }} />)}
          </div>
          <div role="status" className={`flex items-center gap-2 rounded-full border bg-black/20 px-3 py-1.5 font-mono text-[11px] ${GLOW[overall]} ${TXT[overall]}`}>
            <span className={`h-2 w-2 rounded-full ${DOT[overall]}`} />
            {overall === "ok" ? "ALL NOMINAL" : `${LABEL[overall]} · ${flagged.length} FLAGGED`}
          </div>
          <div className="hidden text-right md:block">
            <div className="font-mono text-sm">CDR-01</div>
            <div className="font-mono text-[10px] text-slate-400">SIMULATED</div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)_370px]">
          <div className="space-y-4">
            {vital("hr", "spark")}
            {vital("bp", "gauge")}
            <div className="grid grid-cols-2 gap-4">
              {(["glucose", "temp", "sleep", "mood"] as Key[]).map((k) => {
                const s = stOf(k);
                return (
                  <button key={k} onClick={() => setKey(k)} aria-label={I[k].label}
                    className={`${glass} p-3 text-left transition hover:bg-white/[0.06] ${GLOW[s.status]} ${key === k ? "ring-2 ring-cyan-400/80" : ""} ${linked(k) ? "" : "opacity-30"}`}>
                    <div className={head}>{I[k].short}</div>
                    <div className={`mt-1 font-mono text-2xl font-semibold ${NUM[s.status]}`}>{data[i][k].toFixed(I[k].dp)}</div>
                    <div className="font-mono text-[10px] text-slate-400">{I[k].unit}</div>
                    <div className="mt-2">{k === "glucose" || k === "mood" ? <Bars v={recent(k, 10)} color={col(s.status)} /> : <Spark v={recent(k, 30)} color={col(s.status)} />}</div>
                    <div className={`mt-1 font-mono text-[10px] ${TXT[s.status]}`}>{s.status === "watch" && s.drift && s.fixed === "ok" ? "DRIFTING" : LABEL[s.status]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <section className={`${glass} relative flex flex-col p-5 shadow-[0_0_60px_-20px_rgba(34,211,238,0.45)]`}>
            <div className="flex items-center justify-between">
              <h2 className={head}>Body hologram · live status</h2>
              {rid && <button onClick={() => pickRegion(null)} className="font-mono text-[11px] tracking-widest text-cyan-300 hover:underline">SHOW ALL</button>}
            </div>
            <div className="h-[470px]"><BodyFigure selected={rid} statusOf={regionStatus} onSelect={pickRegion} /></div>

            <div className="min-h-[86px] rounded-2xl border border-white/[0.08] bg-black/25 p-3 text-xs">
              {region ? (
                <>
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: ACCENT }}>{region.label}</h3>
                    <span className={tag}>NASA hazard: {region.hazards.join(", ")}</span>
                  </div>
                  <p className="mt-1 text-slate-300">{region.text}</p>
                  {region.keys.length > 0 && (
                    <p className="mt-1 text-slate-300"><span className="text-slate-500">Advice: </span>
                      {region.keys.some((k) => stOf(k).status !== "ok")
                        ? region.keys.filter((k) => stOf(k).status !== "ok").map((k) => I[k].action).join(" ")
                        : "Readings are close to your baseline. Keep up routine measurements and exercise."}
                    </p>
                  )}
                </>
              ) : <p className="text-slate-400">Click a glowing node, a body part or the dashed radiation ring. Node colors show the worst status of the linked indicators.</p>}
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-3 py-2">
              <button onClick={() => { if (day >= MISSION_DAYS) setDay(1); setPlaying(!running); }}
                className="w-20 rounded-full border border-cyan-400/60 px-3 py-1 font-mono text-[11px] text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.3)] hover:bg-cyan-400/10">
                {running ? "PAUSE" : "PLAY"}
              </button>
              <label htmlFor="day" className="sr-only">Mission day</label>
              <input id="day" type="range" min={1} max={MISSION_DAYS} value={day} onChange={(e) => { setDay(Number(e.target.value)); setPlaying(false); }} className="w-full" />
              <span className="w-14 text-right font-mono text-xs text-slate-300">D+{pad(day)}</span>
            </div>
            <div className="relative mx-4 mt-2 h-2">
              {EVENTS.map((e) => (
                <div key={e.id} title={`${e.name} (${e.hazard})`} className="absolute top-0 h-1.5 rounded-full bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  style={{ left: `${((e.start - 1) / (MISSION_DAYS - 1)) * 100}%`, width: `${((eventEnd(e) - e.start) / (MISSION_DAYS - 1)) * 100}%` }} />
              ))}
            </div>
            <p className="mt-1 px-4 font-mono text-[10px] text-slate-500">Amber bars: drifts injected by the simulator.</p>
          </section>

          <div className="space-y-4">
            <section className={`${glass} p-5`}>
              <div className={head}>Mission elapsed time</div>
              <div className={`font-mono text-5xl font-semibold ${NUM.ok}`}>D+{pad(day)}</div>
              <div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${progress * 100}%` }} /></div>
              <p className="mt-3 font-mono text-[11px] text-slate-300">Crew ID: CDR-01 (simulated)</p>
              <p className="font-mono text-[11px] text-slate-400">Day {day} of {MISSION_DAYS} · {pad((day - 1) * 24, 4)} h · Mars transit</p>
              <p className="font-mono text-[11px] text-slate-400">Ground link one-way delay: ~{delay} min (illustrative)</p>
            </section>

            <section className={`${glass} flex max-h-[430px] flex-col p-5 ${GLOW[overall]}`}>
              <h2 className={`${head} ${TXT[overall]}`}>Alerts · day {day}{region ? ` · ${region.label}` : ""}</h2>
              <p className="mb-2 text-[11px] text-slate-400">Ground replies take time. Check yourself first, escalate early.</p>
              <div className="neon-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {alerts.length === 0 && <p className="text-sm text-slate-400">{region && flagged.length ? "No flagged indicators in this body region." : "All indicators are close to this astronaut's own baseline."}</p>}
                {alerts.map((a) => {
                  const rows: [string, string][] = [["1 What changed", a.what], ["2 Why it matters in space", a.why], ["3 What to do now", a.action], ["4 When to escalate", a.escalate]];
                  return (
                    <article key={a.k} className={`rounded-2xl border bg-black/20 p-3 ${GLOW[a.status]}`}>
                      <div className={`mb-1.5 flex items-center gap-2 font-mono text-[11px] font-bold ${TXT[a.status]}`}>
                        <span className={`h-2 w-2 rounded-full ${DOT[a.status]}`} />[{LABEL[a.status]}] {I[a.k].label}
                      </div>
                      <dl className="space-y-1.5 text-xs">
                        {rows.map(([t, v]) => <div key={t}><dt className={tag}>{t}</dt><dd className="text-slate-200">{v}</dd></div>)}
                      </dl>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className={`${glass} p-5`}>
              <h2 className={head}>Data validation</h2>
              <p className="text-[11px] text-slate-400">Personal baseline vs fixed range, on the simulated mission.</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  [`${S.meanEarlier >= 0 ? "+" : ""}${S.meanEarlier.toFixed(1)} d`, "average lead"],
                  [`${S.caughtBaseline}/${S.total}`, `drifts caught (fixed ${S.caughtFixed})`],
                  [`${S.baselineRate.toFixed(1)}%`, "false alarms, baseline"],
                  [`${S.fixedRate.toFixed(1)}%`, "false alarms, fixed"],
                ].map(([big, small]) => (
                  <div key={small} className="rounded-2xl border border-cyan-400/20 bg-black/25 p-2.5">
                    <div className={`font-mono text-lg ${NUM.ok}`}>{big}</div>
                    <div className="text-[10px] text-slate-400">{small}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section className={`${glass} p-5`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={head}>{info.label} · base-vs-current over the mission</h2>
              <p className="font-mono text-[10px] text-slate-400"><span className="text-slate-200">white</span> readings · <span className="text-cyan-300">cyan dashed</span> your baseline · <span className="text-amber-300">amber</span> fixed limits and drift flags · grey is the future</p>
            </div>
            <div className="mt-2"><TrendChart data={data} z={z} base={base} k={key} day={day} /></div>
          </section>

          <section className={`${glass} p-5`}>
            <h2 className={head}>Does personal baseline detection help?</h2>
            <p className="mt-1 text-[11px] text-slate-400">
              {val.rows.length} injected drifts. The first {CAL} days set your baseline, which then follows quiet days slowly. An EWMA (alpha {ALPHA}) of the z-score flags drift above {Z_LIMIT}, and red above {Z_ALERT}. False alarms: baseline {S.baselineFlags} of {S.quietDays} quiet indicator days, fixed {S.fixedFlags}.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead className={tag}><tr><th className="py-1 font-normal">Indicator</th><th className="font-normal">Starts</th><th className="font-normal">Baseline</th><th className="font-normal">Fixed</th><th className="font-normal">Result</th></tr></thead>
                <tbody className="font-mono text-[11px]">
                  {val.rows.map((v) => (
                    <tr key={v.k} className="border-t border-white/10">
                      <td className="py-1.5 font-sans text-xs">{I[v.k].short}</td><td>D{v.start}</td><td>{v.baseline === null ? "never" : `D${v.baseline}`}</td><td>{v.fixed === null ? "never" : `D${v.fixed}`}</td>
                      <td style={{ color: v.earlier === null || v.earlier > 0 ? "#22d3ee" : HEX.watch }}>
                        {v.earlier === null ? (v.baseline !== null ? "only baseline" : "-") : v.earlier > 0 ? `${v.earlier} d earlier` : v.earlier === 0 ? "same day" : `${-v.earlier} d later`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Honest note: the baseline method raises more flags on quiet days than a fixed range. That is the price of catching slow drift early. A fixed range can also fire first on one noisy reading.</p>
          </section>
        </div>

        <footer className="pb-4 text-center font-mono text-[11px] text-slate-500">
          Guidance only, not a medical diagnosis. All data is simulated and ranges are general adult demo values. Hazards follow the NASA Human Research Program pages on the five hazards of human spaceflight.
        </footer>
      </div>
    </main>
  );
}
