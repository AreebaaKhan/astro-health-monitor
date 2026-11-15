# Astronaut Health Monitor

Autonomous biometric telemetry and personal baseline anomaly detection for long-duration space missions.

Submitted to the **2026 NASA Space Apps Challenge**  
**Challenge:** Create Health Monitoring Software for Astronauts on Space Missions  
**Difficulty:** Intermediate | **Track:** Human Exploration & Software  

---

## Overview

During long-duration missions (such as an Earth-Mars transit spanning 180 days or lunar surface stays under the Artemis program), astronauts face the **Five Hazards of Human Spaceflight** mapped by NASA's Human Research Program (HRP):

1. **Space Radiation:** Deep space galactic cosmic rays and solar particle events
2. **Isolation and Confinement:** Disrupted circadian rhythms, sensory monotony, and psychological stress
3. **Distance from Earth:** Communication delays up to 22 minutes each way, precluding real-time emergency guidance from ground flight surgeons
4. **Gravity Fields:** Microgravity cephalad fluid shifts, cardiovascular deconditioning, bone loss, and muscle atrophy
5. **Hostile Closed Environments:** Recycled atmosphere, cabin acoustics, limited nutrition, and microbial shifts

Because communication with Earth is delayed, astronauts must independently monitor their own health, spot sub-clinical physiological drift early, and initiate countermeasures before issues escalate.

---

## The Core Problem with Standard Medical Thresholds

Conventional clinical monitoring relies on fixed, population-wide normal ranges (for example: Resting Heart Rate 55 to 95 bpm, Blood Pressure systolic 95 to 125 mmHg, Sleep 6.5 to 9.0 hours).

In spaceflight, these static thresholds create two dangerous failure modes:
1. **Missed Sub-Clinical Drift:** An athletic astronaut with a healthy pre-mission resting heart rate of 68 bpm who experiences cardiovascular deconditioning up to 82 bpm is experiencing significant autonomic strain (+4.6 standard deviations). Yet conventional hospital triage flags this as completely normal because 82 bpm is below the 95 bpm population ceiling.
2. **Spurious False Alarms:** A single noisy night with 6.4 hours of sleep or a transient blood pressure spike trips population alarm bells, causing alert fatigue when no sustained physiological issue exists.

---

## Our Solution: Personalized Rolling Baseline Detection

**Astronaut Health Monitor** establishes an individualized physiological baseline for each crew member and tracks slow drift over time using Exponentially Weighted Moving Average (EWMA) z-scores:

1. **Calibration Period:** During the first 14 mission days, the system learns the astronaut's unique mean ($\mu_0$) and standard deviation ($\sigma$) for each vital indicator.
2. **Daily Z-Score Normalization:** Daily readings are converted to standardized deviations:
   $$z_t = \frac{x_t - \mu_t}{\sigma}$$
3. **EWMA Noise Filtering:** An exponential filter smooths day-to-day noise to prevent false alarms:
   $$\bar{z}_t = \alpha \cdot z_t + (1 - \alpha) \cdot \bar{z}_{t-1}$$
   *(with smoothing factor $\alpha = 0.25$)*
4. **Adaptive Non-Absorbing Baseline:** The baseline mean tracks natural long-term changes very slowly ($\text{rate} = 0.005$) during confirmed quiet nominal phases, but freezes during active drift events to prevent "boiling the frog" (absorbing the pathological drift).
5. **Two-Stage Telemetry Alerts:**
   - **Caution (Watch):** $|\bar{z}_t| > 1.2$ flags slow, persistent drift days before any fixed limit is breached.
   - **Critical Alert:** $|\bar{z}_t| > 3.5$ or breach of hard emergency limits triggers an immediate Flight Surgeon escalation protocol.

---

## Validation: Baseline Detection vs Fixed Thresholds

Tested across a 180-day simulated Mars transit mission with three realistic spaceflight hazard events injected into the telemetry:

| Indicator | Injected Spaceflight Hazard Event | Onset | Baseline Method Flags | Fixed Threshold Flags | Early Warning Advantage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sleep** | Circadian disruption & isolation | Day 40 | Day 51 | Day 61 | **+10 Days earlier** |
| **Mood** | Confinement & sensory monotony | Day 40 | Day 41 | Day 62 | **+21 Days earlier** |
| **Systolic BP** | Cephalad fluid shift & vascular deconditioning | Day 95 | Day 113 | Day 115 | **+2 Days earlier** |
| **Heart Rate** | Microgravity cardiac deconditioning | Day 95 | Day 103 | Never breached | **Caught only by baseline** |
| **Body Temp** | Cabin environment & low-grade immune shift | Day 140 | Day 147 | Day 151 | **+4 Days earlier** |
| **Blood Sugar** | Metabolic stress & space nutrition | Day 140 | Day 149 | Day 153 | **+4 Days earlier** |

### Quantifiable Results
- **Mean Early Detection Advantage:** +8.2 Days on average across all detected events.
- **Drift Detection Sensitivity:** 100% (6 out of 6 injected physiological drifts detected).
- **Sub-Clinical Blindspot Capture:** 1 vital (Resting Heart Rate) was caught on Day 103 by the personal baseline, while fixed hospital ranges missed it entirely.
- **Quiet Period False Alarm Rate:** 3.6% for the baseline method (well within aerospace telemetry tolerance) versus 0.4% for fixed limits.

---

## Actionable 4-Part Telemetry Alerts

Every triggered warning answers four questions in plain English:
1. **What Changed?** Telemetry value, personal baseline comparison, percentage shift, and consecutive days flagged.
2. **Why It Matters in Space:** Direct link to the active NASA spaceflight hazard and underlying microgravity physiological mechanism.
3. **What to Do Now:** Practical inflight countermeasures (cycle ergometer exertion, hydration with electrolytes, lower body negative pressure, circadian light adjustment, sleep quarters noise reduction).
4. **When to Escalate:** Clear operational thresholds for when to notify ground flight surgeons in Mission Control via the Deep Space Network.

---

## Features

- **Aerospace Mission Telemetry HUD:** Clean, dark-mode cockpit interface with live Mission Elapsed Time (MET) counter, crew profile, and overall system status.
- **180-Day Mission Scrubber:** Interactive timeline slider with Play/Pause simulation playback and quick jump bookmarks to critical mission phases.
- **Six Core Biometric Indicators:** Heart rate, systolic blood pressure, blood glucose, body temperature, daily sleep hours, and mood score.
- **Interactive Telemetry Trend Chart:** Recharts visualization showing population normal bounds, personal baseline curves, actual readings, baseline drift markers, and fixed limit violations.
- **Interactive 2D Body Figure Schematic:** Clickable anatomical model mapping cranial, thoracic, abdominal, and systemic body regions to their corresponding NASA hazards and countermeasures.
- **Empirical Validation Table:** Interactive panel displaying head-to-head detection metrics.
- **Manual Crew Check-in:** Inflight logging modal allowing crew or judges to enter custom vitals and immediately observe real-time algorithm response.
- **Flight Surgeon Telemetry Brief:** One-click structured medical summary formatted for transmission to Earth.

---

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark aerospace telemetry theme)
- **Charting:** Recharts
- **Architecture:** Pure client-side application. Core mathematical logic isolated in `/lib/health.ts` without UI dependencies.

---

## Getting Started

### Prerequisites
- Node.js 18.18 or higher (Node 20+ recommended)
- npm, pnpm, or yarn

### Installation

```bash
git clone https://github.com/masha/astro-health-monitor.git
cd astro-health-monitor
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## Safety and Medical Notice

All mission data is simulated for demonstration purposes. Reference ranges and risk models are compiled from NASA Human Research Program documents and standard aerospace medical literature.

This software is an autonomous decision-support and self-assessment guidance tool for astronaut crew members on long missions. It does not provide medical diagnoses or replace a certified Flight Surgeon.

---

## NASA Sources and References Cited

1. NASA Human Research Program (HRP): *The Human Body in Space: The Five Hazards of Human Spaceflight*
2. NASA HRP Evidence Report: *Risk of Adverse Health Consequences and Decreased Performance Due to Spaceflight-Induced Cardiovascular Alterations*
3. NASA HRP Evidence Report: *Risk of Impaired Performance and Decreased Alertness Due to Sleep Loss, Circadian Misalignment, and Work Overload*
4. NASA Standard Medical Operations: In-flight physiological monitoring parameters for ISS and Artemis crew missions
5. Canadian Space Agency (CSA): *Operational Space Medicine & Radiation Health in Deep Space Exploration*
