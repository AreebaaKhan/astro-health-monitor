"use client";

import React, { useState } from "react";
import type { Day, Key } from "@/lib/health";
import { I, KEYS } from "@/lib/health";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDay: number;
  currentValues: Day;
  onSubmit: (updated: Day) => void;
}

export default function CheckInModal({
  isOpen,
  onClose,
  currentDay,
  currentValues,
  onSubmit,
}: CheckInModalProps) {
  const [formValues, setFormValues] = useState<Record<Key, number>>({
    hr: currentValues.hr,
    bp: currentValues.bp,
    glucose: currentValues.glucose,
    temp: currentValues.temp,
    sleep: currentValues.sleep,
    mood: currentValues.mood,
  });

  if (!isOpen) return null;

  const handleChange = (k: Key, val: string) => {
    const num = parseFloat(val);
    setFormValues((prev) => ({
      ...prev,
      [k]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      day: currentDay,
      ...formValues,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                Crew Bio-Telemetry Check-In
              </span>
            </div>
            <h3 className="mt-1 text-lg font-bold text-slate-100">
              Log Telemetry for Mission Day {currentDay}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <p className="text-xs text-slate-400">
            Enter manual biosensor readings or adjust values to test real-time
            anomaly detection response.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {KEYS.map((k) => {
              const info = I[k];
              const step = k === "temp" ? "0.01" : k === "sleep" || k === "mood" ? "0.1" : "1";
              return (
                <div
                  key={k}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
                >
                  <label
                    htmlFor={`input-${k}`}
                    className="flex items-center justify-between text-xs font-medium text-slate-300"
                  >
                    <span>{info.label}</span>
                    <span className="font-mono text-slate-400">
                      [{info.unit}]
                    </span>
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      id={`input-${k}`}
                      type="number"
                      step={step}
                      value={formValues[k]}
                      onChange={(e) => handleChange(k, e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-sm text-cyan-300 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>Base: {info.base}</span>
                    <span>
                      Norm: {info.lo} to {info.hi}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-200">
            Note: Updating telemetry on Day {currentDay} will immediately recalculate
            rolling EWMA baselines and update active caution flags.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Update Telemetry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
