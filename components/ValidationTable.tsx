"use client";

import React from "react";
import type { ValidationResult } from "@/lib/health";
import { CAL, I } from "@/lib/health";

interface ValidationTableProps {
  validation: ValidationResult;
}

export default function ValidationTable({ validation }: ValidationTableProps) {
  const { rows, summary } = validation;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              NASA Space Apps Validation Proof
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold text-slate-100">
            Personal Baseline vs Fixed Population Thresholds
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Empirical validation on the 180-day simulated Mars transit mission
            with three injected spaceflight hazard drifts.
          </p>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 font-mono text-xs text-slate-300">
          Calibration Window: <span className="text-cyan-400">Days 1 to {CAL}</span>
        </div>
      </div>

      {/* Quantifiable Validation KPI Cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
          <div className="text-[11px] font-mono uppercase text-emerald-300">
            Early Warning Advantage
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
            +{summary.meanEarlier} Days
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Average lead time before fixed threshold breach
          </div>
        </div>

        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5">
          <div className="text-[11px] font-mono uppercase text-sky-300">
            Drift Detection Rate
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-sky-400">
            {Math.round((summary.caughtBaseline / summary.total) * 100)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {summary.caughtBaseline} of {summary.total} physiological drifts caught
          </div>
        </div>

        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3.5">
          <div className="text-[11px] font-mono uppercase text-purple-300">
            Sub-Clinical Blindspot
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-purple-400">
            {summary.onlyBaseline} Vital
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Heart rate drift completely invisible to fixed limits
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
          <div className="text-[11px] font-mono uppercase text-amber-300">
            False Alarm Rate
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-amber-400">
            {summary.baselineRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Across {summary.quietDays} quiet nominal monitoring days
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-slate-400">
              <th className="py-2.5 px-3">Indicator</th>
              <th className="py-2.5 px-3">Injected Spaceflight Event</th>
              <th className="py-2.5 px-3">Onset</th>
              <th className="py-2.5 px-3">Personal Baseline Detection</th>
              <th className="py-2.5 px-3">Fixed Threshold Breach</th>
              <th className="py-2.5 px-3 text-right">Detection Advantage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono">
            {rows.map((row, idx) => {
              const info = I[row.k];
              return (
                <tr
                  key={`${row.k}-${idx}`}
                  className="hover:bg-slate-900/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {info.label} ({info.short})
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">
                    {row.event}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    Day {row.start}
                  </td>
                  <td className="py-2.5 px-3 text-sky-400">
                    {row.baseline !== null ? `Day ${row.baseline}` : "Not flagged"}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {row.fixed !== null ? (
                      `Day ${row.fixed}`
                    ) : (
                      <span className="text-amber-400/80">Never breached</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {row.earlier !== null ? (
                      <span className="inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 font-bold text-emerald-300 border border-emerald-500/30">
                        +{row.earlier} days earlier
                      </span>
                    ) : row.baseline !== null ? (
                      <span className="inline-block rounded-md bg-purple-500/15 px-2 py-0.5 font-bold text-purple-300 border border-purple-500/30">
                        Caught only by baseline
                      </span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Why This Matters in Space Flight */}
      <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-300 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="font-semibold text-sky-300 font-mono uppercase">
            The Danger of Population Ranges
          </div>
          <p className="mt-1 leading-relaxed text-slate-400">
            Hospital reference ranges (such as Heart Rate 55 to 95 bpm) are designed
            for triage across millions of diverse Earth patients. An astronaut
            with an athletic baseline resting heart rate of 68 bpm who experiences
            microgravity cardiac deconditioning up to 82 bpm is suffering real
            cardiovascular strain, yet fixed limits consider them completely
            normal.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="font-semibold text-emerald-300 font-mono uppercase">
            EWMA Rolling Filter Math
          </div>
          <p className="mt-1 leading-relaxed text-slate-400">
            Our algorithm learns the astronaut&apos;s personal mean and standard
            deviation during the 14-day calibration window. It applies an
            Exponentially Weighted Moving Average (weight 0.25) to normalized
            z-scores. This filters out isolated single-day noise spikes while
            reliably catching slow, cumulative physiological drift days before
            clinical failure.
          </p>
        </div>
      </div>
    </div>
  );
}
