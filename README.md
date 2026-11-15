# AstroHealth

A health monitoring prototype for astronauts on long missions. Track six indicators, notice changes from a personal baseline, and get clear next steps to discuss with a flight surgeon.

Built for the 2026 NASA Space Apps Challenge: **Create Health Monitoring Software for Astronauts on Space Missions**.

## What works

- Home: rotating Earth, mission timeline, indicator markers, trends and short alerts.
- Check-in: enter heart rate, systolic blood pressure, blood sugar, temperature, sleep and mood. Entries save in this browser using localStorage. Saving again on the same date updates that entry; a new date adds an entry.
- A separate 30-day sample history lets judges try the check-in without replacing saved entries. Sample data is labelled and lasts only while the Check-in tab is mounted.
- Vitals: charts, personal baseline, reference band, drift markers and alert limits.
- Body: interactive regions connected to indicators and NASA spaceflight hazards.
- Validation: a reproducible 40-mission benchmark and the selected demo mission's individual results.
- Copy a check-in summary for review before sharing with a flight surgeon.

## How detection works

The simulator generates 180 days with three injected events affecting six indicator series. This is synthetic data, not a NASA patient dataset.

The first 14 entries establish each indicator's mean and standard deviation. An exponentially weighted moving average (EWMA, alpha 0.25) smooths the reading's z-score. The personal mean adjusts slowly (rate 0.005) during quiet periods and pauses during drift. A smoothed absolute z-score above 1.2 flags Watch; above 3.5 flags Alert. Fixed demo ranges also contribute to the displayed status.

Check-in uses the same detection engine. During its first 14 entries, only fixed reference ranges determine status. Personal drift detection starts at entry 15. Missing calendar days are not filled in: this prototype treats each saved entry as one observation, so regular daily input is important.

## Reproducible validation

The benchmark runs seeds **1 through 40**, each for 180 days, using the same scenario and thresholds. Run `node scripts/verify-health.cjs` to reproduce it and verify check-in behavior.

| Measure | 40 missions | Selected demo (seed 5) |
| --- | --- | --- |
| Mean earlier detection | 4.7 days | 8.2 days |
| Baseline drifts caught | 240 / 240 | 6 / 6 |
| Fixed-range drifts caught | 200 / 240 | 5 / 6 |
| Quiet indicator-day flags, baseline | 4.2% | 5.1% |
| Quiet indicator-day flags, fixed | 0.2% | 0.2% |

Lead time includes only indicator drifts detected by both methods, then averages across missions. Negative lead times mean fixed ranges flagged first. Quiet-day rates pool indicator-days across missions and exclude injected-event windows plus a seven-day grace period. They count flagged days, not independent alert episodes.

These results describe this synthetic scenario only. They are not clinical sensitivity or evidence of aerospace certification. Earlier detection comes with more quiet-day flags. The scenario ends at day 180, so later recovery phases are not fully observed.

## Sources and limits

NASA sources inform the hazard explanations, not the numerical demo limits:

- [5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/)
- [Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/)
- [Ongoing HRP Research](https://www.nasa.gov/hrp/ongoing-hrp-research/)

The five hazards are radiation, isolation and confinement, distance from Earth, gravity fields, and hostile or closed environments. The six indicators do not directly measure radiation exposure. The Earth texture is bundled locally in `public/earth.jpg`; the app no longer depends on remote Wikimedia photo requests.

Reference ranges are illustrative adult demo values in `lib/health.ts`, not verified NASA operational thresholds. Blood pressure records systolic pressure only. Blood sugar interpretation depends on measurement timing, which is not modelled here. The initial baseline assumes representative readings. No real astronaut dataset or clinical study was used.

This app provides guidance only, not diagnosis or treatment. Follow mission medical protocols and contact qualified medical support when appropriate. Local storage is not encrypted or synchronized and is not suitable for real sensitive health records on a shared device. No account, database or external medical-data transmission is implemented.

## Run locally

Use Node.js 20.9+ (Node 24 was used for checks), with npm installed:

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000. To verify and build:

```powershell
node scripts/verify-health.cjs
npm.cmd run lint
npm.cmd run build
npm.cmd run start
```

Stack: Next.js App Router, TypeScript, Tailwind CSS and Recharts. Detection and validation logic live in `/lib`, UI in `/components` and `/app`.

## 30-second demo outline

1. Show the Earth and mission health overview.
2. Open Check-in, choose the labelled 30-day sample, enter systolic BP 150 and save.
3. Show the alert's next steps and the interactive Body tab.
4. Finish on Validation: 4.7 days earlier across 40 synthetic missions, with the false-flag tradeoff visible.

AI tools assisted with code, interface revisions and writing. The team is responsible for reviewing the implementation and submission claims.
