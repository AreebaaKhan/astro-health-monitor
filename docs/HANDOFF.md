# Handoff (living log)

## Rules for any AI agent or human
1. Read docs/OBJECTIVE.md, docs/PLAN.md and this file before doing anything.
2. After each work session, update "Current status" and "Next action", and add one dated line in the Log. Keep it short and factual.
3. Do not change scope in OBJECTIVE.md without asking Areeba.
4. Work in small steps and explain the reasoning briefly. Use simple English.
5. Writing style for README, UI text and submission text: natural and plain, no em dashes, no hype words.
6. Tick checkboxes in PLAN.md when a task is really done and working.
7. Time is tight. Prefer the simplest thing that works. Do not add features outside the MVP.

## Current status
First version of Phases 1 to 3 written: lib/health.ts (data, ranges, simulator, baseline anomaly detection, validation) and components/Dashboard.tsx (cards, chart, alerts, body figure, validation table). Not yet run or tested.

## Next action
Run npm run dev, fix any errors, then README, demo and submission drafts.

## Decisions
- Challenge chosen: Health Monitoring Software for Astronauts
- Stack: Next.js + TypeScript + Tailwind + Recharts, no database
- Data: simulated mission data plus user check-ins, clearly labeled as simulated
- Validation: compare personal baseline detection vs fixed thresholds on the simulated mission
- Deadline: 15 Nov 2026, 11:59 PM. Submit by 10:45 PM.

## Open questions
- Time zone of the deadline (check submission page)
- Team members and roles
- Final project name
- Any real dataset in the challenge Resources tab
- Exact submission form fields and any AI-use disclosure

## Log
- 2026-11-15: Folder, git repo and docs created. Plan changed to clock-time schedule.
- 2026-11-15: App code v1 added. Docs updated for 30 second demo and NASA resource rule.
