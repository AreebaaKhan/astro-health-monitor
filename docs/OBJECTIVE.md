# Objective

Project: Astronaut Health Monitor (working name, final name TBD)
Event: 2026 NASA Space Apps Challenge, Universal Event
Challenge: "Create Health Monitoring Software for Astronauts on Space Missions" (Intermediate)
Deadline: 15 Nov 2026, 11:59 PM (confirm the time zone on the submission page). Target: submit by 10:45 PM, not at the last minute.
Owner: Areeba, final-year Computer Systems Engineering student. Works with AI coding tools (Codex in VS Code, Claude chat).

## What the challenge asks
Build a visual tool that helps astronauts check their own health on long missions and gives guidance on what to do.
- NASA suggested indicators: blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, mood.
- Spaceflight hazards: radiation, isolation and confinement, distance from Earth, gravity fields, hostile closed environments.
- Ideas from the challenge: clickable human body figure, dynamic charts over time, color coding, simple explanations for non-experts, reminders to measure, gamification.
- Data can come from any input (typed values, clicks, images). Simulated data is acceptable if we say clearly that it is simulated.

## Our solution (one line)
A web app where an astronaut logs daily health indicators, sees trends with color status, and gets early warnings when readings drift from their OWN baseline, with clear next actions and a clear point to contact the flight surgeon.

## What makes it stand out
1. Personal baseline anomaly detection (rolling baseline plus EWMA or z-score). It catches slow drift that fixed thresholds miss. Simple and explainable.
2. Clickable body figure linked to indicators and to the spaceflight hazards that affect them.
3. Mission simulator: a demo mission (for example Mars transit, day 1 to 180) that generates realistic data with injected events (sleep loss, rising blood pressure, mood decline). This makes the demo strong without needing real data.
4. Every alert answers four things: what changed, why it matters in space, what to do now, when to escalate.
5. Clear safety framing: this is a guidance tool, not a medical diagnosis.
6. Measured result: on the simulated mission, compare our personal baseline method against fixed thresholds and show how many days earlier it flags a drift. This gives us a number for the Validity criterion, like an accuracy score in a data challenge.

## MVP (must ship)
- [x] Daily check-in form for the 6 indicators
- [x] Dashboard: one card per indicator with green/yellow/red status
- [x] Trend charts over time with anomaly points marked
- [x] Personal baseline anomaly detection in /lib (pure functions, easy to explain)
- [x] Clickable body figure that shows related indicators, hazards and advice
- [x] Alert panel with: what changed, why, what to do, when to escalate
- [x] Demo mode with the mission simulator
- [x] Validation panel: baseline method vs fixed thresholds (days earlier, false alarms)
- [ ] Deployed live URL

## Stretch (only after MVP is done)
- Optional AI explanation of an alert (Groq), with a strict safe prompt and a fallback to rule-based text
- Streaks or simple gamification for completing check-ins
- Export a health summary for the flight surgeon

## Out of scope
Login or accounts, database, real medical claims, camera or ultrasound input, mobile app.

## Definition of done
- Live demo URL
- Public GitHub repo with a clear README
- Demo: video of 30 seconds or less, or a deck of up to 7 slides, on a public link with no login. Longer demos are not eligible for Global Judging.
- Submission completed on the Space Apps website. Check the submission form for all required fields and any AI-use disclosure.

## Judging (check the 2026 guide, 2025 criteria shown)
Impact, Creativity, Validity, Relevance, Presentation. Presentation counts as much as the others, so the demo video and README matter.
NASA resources used: HRP 5 Hazards and Risks pages (listed in the challenge Resources tab). Global Awards need at least one NASA resource named in the form. Partner reference: CSA radiation monitoring article.
SI use: answer the form question truthfully and acknowledge SI-generated code in the README.
Validity plan: ranges and hazard info come from NASA Human Research Program sources (list them in the README). Check the challenge Resources tab for any real dataset to use or cite. Always label simulated data as simulated.

## Tech decisions
- Next.js (App Router) + TypeScript + Tailwind + Recharts
- No backend database. Simulated data is generated in code. Check-ins are kept in localStorage.
- Anomaly logic lives in /lib and has no UI code, so it can be tested and explained.
- Deploy on Vercel early, then redeploy often.

## Medical data note
Reference ranges are general adult values used for demo only. Put the ranges in one file (lib/ranges.ts) and list the sources in the README (NASA Human Research Program and standard references). Never present output as diagnosis.
