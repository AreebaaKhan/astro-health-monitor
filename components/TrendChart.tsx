"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CAL, I, MISSION_DAYS, Z_LIMIT } from "@/lib/health";
import type { Baseline, Day, Info, Key, Z } from "@/lib/health";
import { ACCENT, PEACH } from "./status";

type Row = { day: number; past: number | null; future: number | null; flag: number | null; mu: number | null };

function Tip({ active, payload, info }: { active?: boolean; payload?: { payload?: unknown }[]; info: Info }) {
  const r = payload?.[0]?.payload as Row | undefined;
  if (!active || !r) return null;
  const v = r.past ?? r.future;
  return (
    <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900">
      <div className="text-slate-600">DAY {r.day}</div>
      <div>{v !== null && v.toFixed(info.dp)} {info.unit}</div>
      {r.mu !== null && <div className="text-slate-600">baseline {r.mu.toFixed(info.dp)}</div>}
      {r.flag !== null && <div className="text-amber-700">drift flagged</div>}
    </div>
  );
}

export default function TrendChart({ data, z, base, k, day, compact = false }: { data: Day[]; z: Z; base: Record<Key, Baseline>; k: Key; day: number; compact?: boolean }) {
  const info = I[k];
  const rows: Row[] = useMemo(
    () =>
      data.map((d, i) => {
        const seen = d.day <= day;
        return {
          day: d.day,
          past: seen ? d[k] : null,
          future: d.day >= day ? d[k] : null,
          flag: seen && i >= CAL && Math.abs(z[k][i]) > Z_LIMIT ? d[k] : null,
          mu: seen ? base[k].series[i] : null,
        };
      }),
    [data, z, base, k, day]
  );
  const vals = data.map((d) => d[k]);
  const pad = (info.hi - info.lo) * 0.25;
  const domain: [number, number] = [
    Math.floor((Math.min(...vals, info.alo) - pad) * 10) / 10,
    Math.ceil((Math.max(...vals, info.ahi) + pad) * 10) / 10,
  ];
  const tag = (value: string, fill: string) => ({ value, position: "insideTopRight" as const, fill, fontSize: 13 });

  return (
    <div className={compact ? "h-36 w-full" : "h-72 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 6, right: compact ? 6 : 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="2 4" />
          <XAxis dataKey="day" type="number" domain={[1, MISSION_DAYS]} ticks={compact ? [1, 90, 180] : [1, 30, 60, 90, 120, 150, 180]} stroke="#475569" tick={{ fontSize: 13 }} />
          <YAxis domain={domain} stroke="#475569" tick={{ fontSize: 13 }} width={compact ? 32 : 44} />
          <Tooltip content={<Tip info={info} />} />
          <ReferenceArea y1={info.lo} y2={info.hi} fill="#16A34A" fillOpacity={0.07} ifOverflow="hidden" />
          <ReferenceLine y={info.lo} stroke="#16A34A" strokeDasharray="5 4" ifOverflow="hidden" label={compact ? undefined : tag("normal low", "#16A34A")} />
          <ReferenceLine y={info.hi} stroke="#16A34A" strokeDasharray="5 4" ifOverflow="hidden" label={compact ? undefined : tag("normal high", "#16A34A")} />
          <ReferenceLine y={info.alo} stroke={PEACH} strokeDasharray="2 3" ifOverflow="hidden" />
          <ReferenceLine y={info.ahi} stroke={PEACH} strokeDasharray="2 3" ifOverflow="hidden" />
          <ReferenceLine x={day} stroke={ACCENT} />
          <Line dataKey="future" stroke="#CBD5E1" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          <Line dataKey="mu" stroke={ACCENT} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />
          <Line dataKey="past" stroke="#334155" strokeWidth={compact ? 1.5 : 2} dot={false} isAnimationActive={false} />
          <Line dataKey="flag" stroke="none" dot={{ r: compact ? 2.5 : 3.5, fill: "#D97706", stroke: "#ffffff", strokeWidth: 1 }} activeDot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
