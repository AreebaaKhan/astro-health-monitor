"use client";

import React from "react";
import type { Key, Status } from "@/lib/health";
import { I, worst } from "@/lib/health";

export type BodyRegionId = "head" | "chest" | "abdomen" | "body" | "radiation";

export type BodyRegion = {
  id: BodyRegionId;
  label: string;
  system: string;
  keys: Key[];
  hazard: string;
  overview: string;
  mechanism: string;
  countermeasures: string[];
};

export const REGIONS: BodyRegion[] = [
  {
    id: "head",
    label: "Cranial & Neuro-Vestibular",
    system: "Central Nervous System & Circadian Axis",
    keys: ["mood", "sleep"],
    hazard: "Isolation and confinement",
    overview:
      "Prolonged transit through deep space creates sensory monotony, social isolation, and disruption of natural 24-hour circadian rhythms.",
    mechanism:
      "Microgravity shifts cranial fluids cephalad, increasing intracranial and intraocular pressure (SANS: Spaceflight Associated Neuro-ocular Syndrome). Concurrently, acoustic cabin noise and confinement degrade slow-wave sleep and subjective mood scores.",
    countermeasures: [
      "Dynamic blue-enriched spectrum lighting for morning phase shift",
      "Strict dimming schedule 60 minutes prior to scheduled sleep",
      "Private psychological support conferences via Deep Space Network",
      "Mindfulness audio protocols and sensory decompression periods",
    ],
  },
  {
    id: "chest",
    label: "Thoracic & Cardiovascular",
    system: "Heart & Systemic Vasculature",
    keys: ["hr", "bp"],
    hazard: "Gravity fields",
    overview:
      "Without Earth's 1G gravity gradient, approximately two liters of vascular fluid shift upward from the lower extremities toward the chest and head.",
    mechanism:
      "Central venous pressure initially spikes, tricking baroreceptors into triggering fluid loss and red blood cell reduction. Over months, left ventricular mass decreases and resting heart rate increases to compensate for lower stroke volume, raising cardiovascular vulnerability.",
    countermeasures: [
      "Daily 2.5-hour countermeasure protocol: ARED resistive exercise and T2 cycle ergometer",
      "Lower Body Negative Pressure (LBNP) suit sessions to draw fluid caudad",
      "Electrolyte fluid loading protocols before dynamic flight phases",
      "Continuous resting pulse rate tracking against calibrated personal baseline",
    ],
  },
  {
    id: "abdomen",
    label: "Abdominal & Metabolic",
    system: "Endocrine & Gastrointestinal System",
    keys: ["glucose"],
    hazard: "Hostile and closed environment",
    overview:
      "Dietary intake is constrained to pre-packaged shelf-stable rations, while altered gastrointestinal motility affects nutrient absorption.",
    mechanism:
      "Physical inactivity relative to Earth, combined with elevated glucocorticoid stress hormones from confinement, promotes insulin resistance and postprandial glucose volatility. Altered gut microflora further affects metabolic homeostasis.",
    countermeasures: [
      "Strict caloric balancing with controlled glycemic index rations",
      "Prebiotic and probiotic dietary supplementation",
      "Targeted post-meal light aerobic exertion on the cycle ergometer",
      "Scheduled finger-stick blood glucose monitoring twice weekly",
    ],
  },
  {
    id: "body",
    label: "Systemic & Thermoregulation",
    system: "Core Temperature & Immune Regulation",
    keys: ["temp"],
    hazard: "Hostile and closed environment",
    overview:
      "The spacecraft cabin is a sealed artificial atmosphere with recycled air, elevated carbon dioxide, and absent natural thermal convection.",
    mechanism:
      "In microgravity, sweat does not drip away but forms a surface layer over the skin, impairing evaporative cooling. Concurrently, immune T-cell function is suppressed during spaceflight, making astronauts susceptible to opportunistic sub-clinical infections and low-grade pyrexia.",
    countermeasures: [
      "Cabin ventilation checks: ensure minimum 15 to 40 ft/min airflow across sleeping berths",
      "Immediate hydration with chilled electrolyte fluids",
      "Active antimicrobial environmental wipes for crew quarters",
      "Resting core body temperature verification with tympanic and infrared sensors",
    ],
  },
  {
    id: "radiation",
    label: "Deep Space Radiation Dosimetry",
    system: "Cellular DNA & Hematopoietic Marrow",
    keys: [],
    hazard: "Space radiation",
    overview:
      "Beyond the Earth's magnetosphere, astronauts are constantly penetrated by Galactic Cosmic Rays (GCR) and episodic Solar Particle Events (SPE).",
    mechanism:
      "High-energy heavy ions (HZE particles) cause complex double-strand DNA breaks that standard repair mechanisms struggle to fix. This increases lifetime excess risk of cancer and degenerative tissue changes. These six daily indicators do not detect radiation directly, emphasizing why baseline physiological resilience is critical.",
    countermeasures: [
      "Active radiation dosimetry with Silicon dosimeters and Crew Personal Dosimeters",
      "Shelter-in-place protocol in water-shielded storm shelters during solar storms",
      "Antioxidant and radioprotective dietary regimens (curcumin, polyphenols)",
      "Continuous ground monitoring of space weather sensors on SOHO and GOES",
    ],
  },
];

interface BodySchematicProps {
  selectedRegionId: BodyRegionId;
  onSelectRegion: (id: BodyRegionId) => void;
  indicatorStatuses: Record<Key, Status>;
  currentDayValues: Record<Key, number>;
}

export default function BodySchematic({
  selectedRegionId,
  onSelectRegion,
  indicatorStatuses,
  currentDayValues,
}: BodySchematicProps) {
  const selectedRegion =
    REGIONS.find((r) => r.id === selectedRegionId) ?? REGIONS[0];

  // Derive region status based on the worst status of linked indicators
  const getRegionStatus = (region: BodyRegion): Status => {
    if (region.keys.length === 0) return "ok";
    const statuses = region.keys.map((k) => indicatorStatuses[k] ?? "ok");
    return worst(statuses);
  };

  const getRegionColor = (regionId: BodyRegionId, isSelected: boolean) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return "#64748b";
    const status = getRegionStatus(region);

    if (status === "alert") {
      return isSelected ? "#f43f5e" : "#e11d48";
    }
    if (status === "watch") {
      return isSelected ? "#fbbf24" : "#d97706";
    }
    return isSelected ? "#38bdf8" : "#475569";
  };

  const getGlowFilter = (regionId: BodyRegionId) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return "none";
    const status = getRegionStatus(region);
    if (status === "alert") return "drop-shadow(0 0 8px rgba(244,63,94,0.6))";
    if (status === "watch") return "drop-shadow(0 0 8px rgba(251,191,36,0.6))";
    if (regionId === selectedRegionId)
      return "drop-shadow(0 0 8px rgba(56,189,248,0.5))";
    return "none";
  };

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md lg:grid-cols-[280px_1fr]">
      {/* 2D Anatomical Schematic Column */}
      <div className="flex flex-col items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/80 p-4">
        <div className="w-full text-center">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              ANATOMY HUD
            </span>
            <span>MODEL: CREW-2D</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Click regions to inspect physiological impacts
          </p>
        </div>

        {/* SVG Human Figure */}
        <div className="relative my-4 flex items-center justify-center">
          <svg
            viewBox="0 0 160 320"
            className="h-80 w-auto select-none transition-all duration-300"
            role="img"
            aria-label="Interactive 2D Astronaut Body Schematic"
          >
            <defs>
              <linearGradient id="hudGrid" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
              <pattern
                id="crosshatch"
                width="8"
                height="8"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="8"
                  y2="8"
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeOpacity="0.4"
                />
              </pattern>
            </defs>

            {/* Background HUD target circles */}
            <circle
              cx="80"
              cy="160"
              r="75"
              fill="none"
              stroke="#1e293b"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle
              cx="80"
              cy="160"
              r="110"
              fill="none"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <line
              x1="5"
              y1="160"
              x2="155"
              y2="160"
              stroke="#1e293b"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
            <line
              x1="80"
              y1="15"
              x2="80"
              y2="305"
              stroke="#1e293b"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />

            {/* Whole Body Limbs / Core (Body Region) */}
            <g
              onClick={() => onSelectRegion("body")}
              className="cursor-pointer transition-all duration-200"
              style={{ filter: getGlowFilter("body") }}
            >
              {/* Left Arm */}
              <rect
                x="20"
                y="84"
                width="16"
                height="102"
                rx="8"
                fill={getRegionColor("body", selectedRegionId === "body")}
                stroke={selectedRegionId === "body" ? "#38bdf8" : "#334155"}
                strokeWidth={selectedRegionId === "body" ? "1.5" : "1"}
              />
              {/* Right Arm */}
              <rect
                x="124"
                y="84"
                width="16"
                height="102"
                rx="8"
                fill={getRegionColor("body", selectedRegionId === "body")}
                stroke={selectedRegionId === "body" ? "#38bdf8" : "#334155"}
                strokeWidth={selectedRegionId === "body" ? "1.5" : "1"}
              />
              {/* Left Leg */}
              <rect
                x="52"
                y="190"
                width="22"
                height="115"
                rx="10"
                fill={getRegionColor("body", selectedRegionId === "body")}
                stroke={selectedRegionId === "body" ? "#38bdf8" : "#334155"}
                strokeWidth={selectedRegionId === "body" ? "1.5" : "1"}
              />
              {/* Right Leg */}
              <rect
                x="86"
                y="190"
                width="22"
                height="115"
                rx="10"
                fill={getRegionColor("body", selectedRegionId === "body")}
                stroke={selectedRegionId === "body" ? "#38bdf8" : "#334155"}
                strokeWidth={selectedRegionId === "body" ? "1.5" : "1"}
              />
            </g>

            {/* Cranial / Head */}
            <g
              onClick={() => onSelectRegion("head")}
              className="cursor-pointer transition-all duration-200"
              style={{ filter: getGlowFilter("head") }}
            >
              <circle
                cx="80"
                cy="44"
                r="26"
                fill={getRegionColor("head", selectedRegionId === "head")}
                stroke={selectedRegionId === "head" ? "#38bdf8" : "#334155"}
                strokeWidth={selectedRegionId === "head" ? "2" : "1"}
              />
              {/* Visor HUD accent */}
              <path
                d="M 64 42 Q 80 48 96 42"
                stroke="#0f172a"
                strokeWidth="2.5"
                fill="none"
              />
            </g>

            {/* Thoracic / Chest */}
            <g
              onClick={() => onSelectRegion("chest")}
              className="cursor-pointer transition-all duration-200"
              style={{ filter: getGlowFilter("chest") }}
            >
              <rect
                x="44"
                y="76"
                width="72"
                height="56"
                rx="14"
                fill={getRegionColor("chest", selectedRegionId === "chest")}
                stroke={selectedRegionId === "chest" ? "#38bdf8" : "#334155"}
                strokeWidth={selectedRegionId === "chest" ? "2" : "1"}
              />
              {/* Heart pulse glyph inside chest */}
              <path
                d="M 72 104 L 76 104 L 78 98 L 81 110 L 84 102 L 86 104 L 90 104"
                stroke="#0f172a"
                strokeWidth="1.5"
                fill="none"
              />
            </g>

            {/* Abdominal / Metabolism */}
            <g
              onClick={() => onSelectRegion("abdomen")}
              className="cursor-pointer transition-all duration-200"
              style={{ filter: getGlowFilter("abdomen") }}
            >
              <rect
                x="47"
                y="136"
                width="66"
                height="48"
                rx="12"
                fill={getRegionColor("abdomen", selectedRegionId === "abdomen")}
                stroke={selectedRegionId === "abdomen" ? "#38bdf8" : "#334155"}
                strokeWidth={selectedRegionId === "abdomen" ? "2" : "1"}
              />
            </g>

            {/* Target Reticle Indicator on Selected Region */}
            {selectedRegionId === "head" && (
              <circle
                cx="80"
                cy="44"
                r="30"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}
            {selectedRegionId === "chest" && (
              <rect
                x="40"
                y="72"
                width="80"
                height="64"
                rx="18"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}
            {selectedRegionId === "abdomen" && (
              <rect
                x="43"
                y="132"
                width="74"
                height="56"
                rx="16"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}
            {selectedRegionId === "body" && (
              <rect
                x="16"
                y="80"
                width="128"
                height="228"
                rx="16"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            )}
          </svg>
        </div>

        {/* Quick Region Selector Tabs */}
        <div className="flex w-full flex-wrap justify-center gap-1.5 pt-2">
          {REGIONS.map((r) => {
            const isSelected = r.id === selectedRegionId;
            const status = getRegionStatus(r);
            return (
              <button
                key={r.id}
                onClick={() => onSelectRegion(r.id)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                  isSelected
                    ? "bg-sky-500/20 text-sky-300 ring-1 ring-sky-400"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80"
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    status === "alert"
                      ? "bg-rose-400"
                      : status === "watch"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />
                {r.id.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Physiological Deep-Dive Details */}
      <div className="flex flex-col justify-between space-y-4">
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  {selectedRegion.system}
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                  ID: {selectedRegion.id.toUpperCase()}
                </span>
              </div>
              <h3 className="mt-1 text-xl font-bold text-slate-100">
                {selectedRegion.label}
              </h3>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-1.5">
              <span className="text-xs text-slate-400">NASA Hazard:</span>
              <span className="text-xs font-semibold text-amber-300">
                {selectedRegion.hazard}
              </span>
            </div>
          </div>

          {/* Connected Live Telemetry Indicators */}
          <div className="mt-4">
            <h4 className="text-xs font-mono uppercase text-slate-400">
              Correlated Biometric Indicators
            </h4>
            {selectedRegion.keys.length > 0 ? (
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {selectedRegion.keys.map((k) => {
                  const info = I[k];
                  const status = indicatorStatuses[k] ?? "ok";
                  const val = currentDayValues[k];
                  return (
                    <div
                      key={k}
                      className={`flex items-center justify-between rounded-lg border p-2.5 transition-colors ${
                        status === "alert"
                          ? "border-rose-500/40 bg-rose-500/10"
                          : status === "watch"
                          ? "border-amber-500/40 bg-amber-500/10"
                          : "border-slate-800 bg-slate-950/60"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-medium text-slate-300">
                          {info.label}
                        </div>
                        <div className="font-mono text-lg font-bold text-slate-100">
                          {val !== undefined ? val.toFixed(info.dp) : "--"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            {info.unit}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                            status === "alert"
                              ? "bg-rose-500/20 text-rose-300"
                              : status === "watch"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {status === "alert"
                            ? "Alert"
                            : status === "watch"
                            ? "Drift"
                            : "Nominal"}
                        </span>
                        <div className="mt-1 text-[10px] text-slate-400">
                          Ref: {info.lo} to {info.hi}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-2 rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
                Direct daily biosensors cannot measure ionizing radiation.
                Space radiation damage is cumulative at the cellular level and
                is monitored via active spacecraft dosimeters and biological
                blood sampling.
              </div>
            )}
          </div>

          {/* Physiological Mechanism */}
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-mono uppercase text-slate-400">
              Microgravity Physiological Mechanism
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">
              {selectedRegion.overview} {selectedRegion.mechanism}
            </p>
          </div>
        </div>

        {/* Countermeasures Protocol */}
        <div className="rounded-xl border border-sky-950/60 bg-sky-950/20 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-sky-300">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Inflight Prescribed Countermeasures
          </div>
          <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs text-slate-300 sm:grid-cols-2">
            {selectedRegion.countermeasures.map((cm, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                <span>{cm}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
