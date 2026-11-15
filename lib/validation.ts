import { analyze, simulate, validate } from "./health";

// Reproducible benchmark: same scenario and settings, seeds 1 through 40.
export function benchmark() {
  const missions = Array.from({ length: 40 }, (_, i) => {
    const data = simulate(180, i + 1);
    return validate(data, analyze(data).z);
  });
  const leads = missions.map(m => m.summary.meanEarlier).sort((a, b) => a - b);
  const sum = (key: "quietDays" | "baselineFlags" | "fixedFlags" | "caughtBaseline" | "caughtFixed" | "total") => missions.reduce((n, m) => n + m.summary[key], 0);
  return {
    count: missions.length,
    mean: leads.reduce((a, b) => a + b, 0) / leads.length,
    median: (leads[19] + leads[20]) / 2,
    min: leads[0], max: leads[39],
    baselineRate: 100 * sum("baselineFlags") / sum("quietDays"),
    fixedRate: 100 * sum("fixedFlags") / sum("quietDays"),
    baselineCaught: sum("caughtBaseline"), fixedCaught: sum("caughtFixed"), total: sum("total"),
  };
}
