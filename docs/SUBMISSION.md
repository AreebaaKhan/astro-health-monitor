# Final submission kit

Prepared from the supplied NASA Space Apps Project Submission Guide (13 November 2026). Replace square-bracket placeholders and check the live form's field limits before pasting. This is a draft, not a submitted entry.

## Finish in this order

1. Commit and push the latest light-ui changes. Deploy that exact branch and commit on Vercel.
2. Open the final URL in an incognito window. It must work without Vercel login or an access request. Test Home, Check-in, Vitals, Body and Validation.
3. Record a video of 30 seconds or less OR prepare an English deck of no more than seven slides, including the title. You do not need both.
4. Put the demo on a publicly accessible external link. The NASA project form accepts links for videos/documents, not file uploads. Check the link while signed out.
5. Fill all required English fields, add sources and AI disclosure, review the originality and terms declarations yourself, then click Submit for Judging. Save Progress alone is not submission. Confirm the success banner and keep a screenshot.

For Universal Event teams, the supplied guide uses the team owner's residence timezone. For a Karachi-based owner, the stated deadline is 15 November 2026 at 11:59 PM Karachi time. Leave a buffer for upload and login problems. All team members must be confirmed at the same event. The guide says submissions can be edited and resubmitted before the deadline.

## Deployment

The repo's origin is https://github.com/AreebaaKhan/astro-health-monitor.git. The working branch is light-ui. Do not merge into the teammate's nasa-ui-upgrade branch just to deploy.

```powershell
git status
git add app/globals.css components/Dashboard.tsx docs/SUBMISSION.md docs/HANDOFF.md docs/PLAN.md docs/OBJECTIVE.md README.md public/ai-assistance.json
git commit -m "Balance Home layout and prepare submission kit"
git push -u origin light-ui
```

If a listed file has no changes, Git simply leaves it unchanged. Check git status before committing; stage only your intended files. If the commit has already been made, skip the add/commit commands and push.

A connected Vercel project may create a Preview deployment for a non-production branch. Ask the project owner to deploy/promote the intended light-ui commit to the public production URL, or configure the intended production branch. Verify the deployment's commit and check the URL signed out. A Git push is not by itself proof that the public site has updated.

Official references:
- https://vercel.com/docs/git
- https://vercel.com/docs/deployments/promoting-a-deployment
- https://vercel.com/docs/deployment-protection

## Project name

AstroHealth

## High-level project summary

AstroHealth helps astronauts track six health indicators and recognize changes from their own usual pattern during long missions. It combines daily check-ins, interactive charts, a clickable body map and clear next-step guidance. A 180-day simulated Mars transit demonstrates how personal-baseline monitoring can reveal gradual changes that fixed ranges miss. Across 40 synthetic missions, it flagged shared detectable drifts 4.7 days earlier on average, with a higher quiet-day flag rate. NASA Human Research Program resources connect the indicators to spaceflight hazards. AstroHealth is a working educational prototype that provides guidance, not diagnosis.

## Detailed project description

Long missions make routine health assessment important, especially when communication with Earth is delayed. A single population reference range does not describe an individual's usual pattern. AstroHealth pairs fixed demo ranges with a personal baseline so the user can see both.

Users enter heart rate, systolic blood pressure, blood sugar, body temperature, sleep duration and mood. Daily entries are stored in the browser; saving the same date updates that entry. The first 14 entries establish a baseline. From entry 15, an exponentially weighted moving average of normalized changes helps identify persistent drift. During calibration, fixed reference-range alerts still work. A separate, clearly labelled 30-day sample lets judges explore the input flow without changing their saved history.

The simulated mission offers a rotating Earth overview, a playable timeline, trend charts and a clickable body map. Alerts explain what changed, what to do and when to contact a flight surgeon, with optional hazard explanations. The six indicators do not directly measure radiation exposure.

For evaluation, we run the same 180-day scenario with seeds 1 through 40. Three injected events affect six indicator series per mission. The baseline method detects 240 of 240 injected indicator drifts, versus 200 for fixed ranges. Mean lead time is 4.7 days for drifts detected by both methods, averaged across missions. Quiet indicator-day flag rates are 4.2% for the baseline and 0.2% for fixed ranges. This tradeoff is shown openly. These are synthetic scenario results, not clinical sensitivity or proof of medical safety.

The app uses Next.js, TypeScript, React, Tailwind CSS and Recharts. It has no database or account system. Current limitations include illustrative reference ranges, reliance on regular entries and a representative initial baseline, systolic-only blood pressure, unencrypted browser storage and no clinical validation. Future work would require expert review, real-world validation, secure storage and integration with approved monitoring devices.

## NASA data and resources

We used NASA Human Research Program resources to frame spaceflight hazards and explain their relationship to the selected health indicators:

- 5 Hazards of Human Spaceflight: https://www.nasa.gov/hrp/hazards/
- Risks of Human Spaceflight: https://www.nasa.gov/hrp/risks/
- Ongoing HRP Research: https://www.nasa.gov/hrp/ongoing-hrp-research/

These sources informed hazard mapping and educational context. We did not use a real NASA health dataset. The mission readings are generated by a seeded simulator, and numerical reference limits are illustrative demo values, not NASA-certified operational thresholds.

## Other references and asset credits

- Next.js: https://nextjs.org/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/
- Recharts: https://recharts.org/
- Claude and OpenAI Codex: AI-assisted development and writing, disclosed below.
- Earth texture in public/earth.jpg: [ASK TEAMMATE FOR ORIGINAL SOURCE URL, CREDIT AND USAGE RIGHTS BEFORE SUBMISSION]. The exact source is not established by the filename or existing code comments. Do not invent a NASA attribution.
- CSA resources: include exact article URLs only if the team actually consulted them. No unverified CSA title is included in this draft.

## Use of SI / AI tools

Draft to review for accuracy:

We used Claude and OpenAI Codex to assist with brainstorming, project planning, code generation and revision, interface styling, test development, and documentation drafts. Code assistance included the synthetic data simulator and baseline detection implementation. We disclosed these uses in the repository and project metadata. The application uses deterministic statistical detection, not an AI model trained on astronaut health records. Our team selected and refined the implementation and is responsible for reviewing its claims and limitations.

The supplied guide permits SI tools but restricts using them to originate the solution idea. Describe the actual assistance truthfully and review that requirement before making the originality declaration; do not claim there was no brainstorming assistance. The guide also requires visible labels for AI-generated images/video and acknowledgement for generated audio, code and data. A screen recording is not automatically AI-generated video, but add the appropriate label if using generated visuals or narration. Avoid AI-generated NASA branding. Verify the provenance of the supplied Earth texture.

## Demo option A: 28 to 30 seconds

Use English narration. Show your name and team name as a brief opening overlay. Record only the app, hide notifications and do not include minors' likenesses. Aim for 28 seconds to leave room for a title/end frame.

| Time | Show |
| --- | --- |
| 0-5 s | Team/title overlay and Home with rotating Earth |
| 5-13 s | Check-in: sample history already loaded; change BP to 150 and save |
| 13-18 s | BP alert, then click a body region |
| 18-25 s | Validation: 40 missions, lead time and both quiet-day flag rates |
| 25-28 s | Closing caption: Simulated data. Guidance only. NASA HRP resources. |

Narration (about 60 words; rehearse and trim to fit):

"I'm [name] from [team]. AstroHealth helps astronauts notice changes in their health before fixed limits do. Log six daily indicators, explore the body map, and see clear next steps. In forty simulated missions, personal baselines flagged shared detectable drifts four point seven days earlier on average, with more false flags. Informed by NASA HRP resources. Guidance, not diagnosis."

Keep 'Sample mode' visible during the input demonstration. Do not present 150 as a personalized clinical threshold. Do not say 'NASA patient data', 'clinically proven' or '100 percent accurate'.

## Demo option B: seven-slide maximum

Use this if recording is slower. All slide text should be English. Use real app screenshots and large type.

1. AstroHealth: Your health, beyond Earth. [Team name], [both member names], selected challenge.
2. Problem: long missions, communication delay, and changes hidden by broad reference ranges.
3. User flow: six daily inputs, simple status, clear next steps. Check-in screenshot.
4. How it works: 14-entry baseline, smoothed changes, fixed-range comparison. Vitals screenshot.
5. Spaceflight relevance: clickable body map, NASA HRP hazards, radiation-monitoring limitation.
6. Honest results: 40 synthetic missions; 4.7-day lead; 4.2% vs 0.2% quiet-day flags. No clinical claims.
7. Demo link, source code link, NASA references, AI assistance and limits. Future: expert review and secure device integration.

## Final checks against the guide and judging criteria

- Impact: explain why self-assessment helps when ground support is delayed.
- Creativity: show personal-baseline comparison and the interactive body connection.
- Validity: show reproducible synthetic results, sources and the false-flag tradeoff.
- Relevance: demonstrate six health inputs, understandable guidance and NASA hazards.
- Presentation: readable screenshots, a working public URL and a demo within the length limit.
- The project page is the main evaluation material; do not leave the written description empty because the video exists.
- At least one NASA resource is needed for Global Award eligibility; the HRP resources above are identified explicitly.
- Confirm both members are accepted at the same event, all required form fields are filled, English requirements are met, and no minors appear in linked media.
- Verify Earth texture attribution and any AI-media labelling before declaring all work original.
- Record the confirmation banner after Submit for Judging. Saved draft status is not enough.

## Fields still needed from the team

- Final team name and both member names.
- Public deployment URL and public demo URL.
- Earth texture source and credit, plus any exact CSA resources actually used.
- Final check of required fields and character limits on the live submission form.
