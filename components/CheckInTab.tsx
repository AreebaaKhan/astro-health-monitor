"use client";

import { useEffect, useMemo, useState } from "react";
import { analyze, buildAlert, CAL, I, KEYS, simulate, statusAt, type Key } from "@/lib/health";
import { EMPTY_VALUES, INPUT_BOUNDS, parseHistory, saveEntry, type CheckIn } from "@/lib/checkin";
import { LABEL, TXT } from "./status";

const STORE = "astrohealth-checkins-v1";
const localDate = () => new Date().toLocaleDateString("en-CA");

export default function CheckInTab() {
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [sample, setSample] = useState<CheckIn[] | null>(null);
  const [values, setValues] = useState<Record<Key, string>>(() => Object.fromEntries(KEYS.map(k => [k, ""])) as Record<Key, string>);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    // Loading external browser storage once after hydration.
    try {
      const saved = parseHistory(localStorage.getItem(STORE));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory(saved);
    } catch { setError("Saved data could not be loaded. Browser storage may be unavailable or invalid."); }
    setReady(true);
  }, []);
  const rows = sample ?? history;
  const analysis = useMemo(() => analyze(rows), [rows]);
  const latest = rows.at(-1);
  const i = rows.length - 1;
  const results = latest ? KEYS.map(k => statusAt(rows, analysis.z, k, i)) : [];
  const alerts = results.filter(r => r.status !== "ok").map(r => buildAlert(rows, analysis.z, analysis.base, r.k, i));

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const numbers = Object.fromEntries(KEYS.map(k => [k, values[k].trim() === "" ? NaN : Number(values[k])])) as Record<Key, number>;
      const next = saveEntry(rows, numbers, localDate());
      if (sample) setSample(next);
      else { localStorage.setItem(STORE, JSON.stringify(next)); setHistory(next); }
      setMessage(sample ? "Sample check-in saved for this session." : "Today's check-in saved on this browser. Saving again updates today's entry.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save. Please check browser storage."); }
  }
  function loadSample() {
    setSample(simulate(30).map(d => ({ ...d, date: `sample-${d.day}` })));
    setValues(Object.fromEntries(KEYS.map(k => [k, String(EMPTY_VALUES[k])])) as Record<Key, string>);
    setMessage("Sample mode: 30 simulated days loaded. Your saved check-ins are unchanged.");
    setError("");
  }
  async function copySummary() {
    const text = ["AstroHealth - guidance only, not a diagnosis", sample ? "SIMULATED sample session" : "User-entered readings", `Latest entry: ${latest?.date}`, ...results.map(r => `${I[r.k].label}: ${latest?.[r.k]} ${I[r.k].unit} (${LABEL[r.status]})`), ...alerts.map(a => `${I[a.k].label}: ${a.what} ${a.escalate}`)].join("\n");
    try { await navigator.clipboard.writeText(text); setMessage("Summary copied. Review it before sharing with your flight surgeon."); }
    catch { setError("Clipboard unavailable. You can select and copy the results shown here."); }
  }

  return <div className="checkin-layout">
    <section>
      <p className="eyebrow">Your daily routine</p>
      <h1 className="page-title">A small check-in. A clearer picture.</h1>
      <p className="muted mt-3">Enter today&apos;s six readings. Your history stays in this browser, separate from the mission demo.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="secondary-button" onClick={loadSample}>Try 30-day sample history</button>
        {sample && <button className="secondary-button" onClick={() => { setSample(null); setMessage("Returned to your saved history."); }}>Return to my check-ins</button>}
      </div>
      {sample && <p className="mt-3 text-sm font-semibold text-amber-700">Sample mode: simulated history, not your personal baseline.</p>}
      <form onSubmit={save} className="mt-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {KEYS.map(k => <div key={k}>
            <label className="mb-2 block text-sm font-semibold" htmlFor={`check-${k}`}>{I[k].label} <span className="muted font-normal">({I[k].unit})</span></label>
            <input id={`check-${k}`} type="number" inputMode="decimal" required min={INPUT_BOUNDS[k][0]} max={INPUT_BOUNDS[k][1]} step={10 ** -I[k].dp} value={values[k]} placeholder={String(I[k].base)} onChange={e => setValues(v => ({ ...v, [k]: e.target.value }))} className="check-input" />
            <p className="mt-1 text-[13px] text-slate-600">Demo reference: {I[k].lo} to {I[k].hi} {I[k].unit}</p>
          </div>)}
        </div>
        <button disabled={!ready} className="primary-button mt-6" type="submit">Save today&apos;s check-in</button>
      </form>
      <p role="status" className="mt-3 text-sm text-blue-700">{message}</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <p className="muted mt-4 text-sm">Guidance only. These are demo ranges, not personalized medical limits. Follow your mission medical protocol.</p>
    </section>
    <section className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Your latest results</h2><span className="text-sm text-slate-600">{rows.length} entries</span></div>
      <p className="muted mt-2 text-sm">{rows.length <= CAL ? `Learning your baseline: ${Math.min(rows.length, CAL)} / ${CAL} entries. Only reference ranges are used until entry ${CAL + 1}.` : "Compared with your first 14 entries and your recent trend."}</p>
      {!latest ? <div className="empty-state"><span className="text-4xl text-blue-500" aria-hidden="true">♡</span><h3 className="mt-3 font-semibold">Start with how you are today</h3><p className="muted mt-2">Save a check-in to see your six indicators here, or try the clearly labelled sample.</p></div> : <>
        <div className="mt-5 divide-y divide-slate-100">{results.map(r => <div key={r.k} className="flex items-center justify-between gap-3 py-3"><div><div className="text-sm font-semibold">{I[r.k].label}</div><div className="muted text-sm">{latest[r.k].toFixed(I[r.k].dp)} {I[r.k].unit}</div></div><span className={`text-sm font-semibold ${TXT[r.status]}`}>{LABEL[r.status]}</span></div>)}</div>
        {alerts.map(a => <article key={a.k} className="mt-4 rounded-xl border border-slate-200 p-4"><h3 className={`font-semibold ${TXT[a.status]}`}>{I[a.k].label}</h3><dl className="mt-2 space-y-2 text-sm">{[["What changed", a.what], ["What to do", a.action], ["When to escalate", a.escalate]].map(([label, text]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="muted">{text}</dd></div>)}</dl><details className="mt-3 text-sm"><summary>Why it matters</summary><p className="muted mt-2">{a.why}</p></details></article>)}
        <button className="secondary-button mt-5" onClick={copySummary}>Copy summary for flight surgeon</button>
      </>}
    </section>
  </div>;
}
