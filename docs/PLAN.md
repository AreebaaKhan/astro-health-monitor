# Plan

Rule: get a rough version working end to end first, then polish. Do not polish early.

Deadline: 15 Nov 2026, 11:59 PM. Work started about 3:15 PM. Target submit by 10:45 PM.

## Schedule (clock times, adjust honestly)
- 3:15 to 3:45 PM  Phase 0: setup
- 3:45 to 5:30 PM  Phase 1: data and logic
- 5:30 to 7:15 PM  Phase 2: dashboard and alerts
- 7:15 to 8:15 PM  Phase 3: body figure
- 8:15 to 9:00 PM  Phase 4: README and polish
- 9:00 to 10:00 PM Phase 5: demo video and submission page
- 10:00 to 10:45 PM Buffer, final check, SUBMIT

## Phase 0: Setup
- [x] Scaffold Next.js app (TypeScript, Tailwind, App Router)
- [x] Install recharts
- [ ] Push to GitHub, deploy empty app on Vercel

## Phase 1: Data and logic
- [x] types.ts: Indicator, Reading, Status, Alert
- [x] ranges.ts: normal and caution ranges per indicator, with sources in comments
- [x] simulator.ts: mission timeline (about 180 days) with 2 or 3 injected drifts
- [x] anomaly.ts: rolling baseline, EWMA or z-score, returns flags and a short reason
- [x] validate.ts: compare baseline method vs fixed thresholds (days earlier, false alarms)

## Phase 2: Dashboard and alerts
- [x] Indicator cards with color status
- [x] Trend charts with anomaly markers
- [x] Mission day slider (this is the demo mode)
- [x] Alert panel: what changed, why, what to do, when to escalate
- [x] Simple check-in form (can be last, keep it small)

## Phase 3: Body figure
- [x] Simple SVG body, clickable regions
- [x] Per region: indicator, hazard link, plain explanation

## Phase 4: README and polish
- [ ] Layout readable on a laptop screen
- [ ] README: problem, approach, how detection works, validation result, limits, sources, simulated data note

## Phase 5: Submission
- [ ] Record demo (30 seconds or less) and upload to a public link
- [ ] Write project summary
- [ ] Fill the submission page, tick the required agreement box, submit

## Cut list (cut from the top if time runs out)
1. Check-in form (use simulated data only)
2. Stretch items in OBJECTIVE.md
3. Extra polish
Never cut: anomaly detection, validation number, body figure, alert panel, live URL, video.
