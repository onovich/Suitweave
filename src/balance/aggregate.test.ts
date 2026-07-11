import { describe, expect, it } from "vitest";
import { DEFAULT_BALANCE_MANIFEST } from "./contracts";
import { summarizeSimulation } from "./aggregate";
import { runManifest } from "./simulator";

describe("simulation aggregation", () => {
  it("reports distributions and anomalous seeds instead of only an average", () => {
    const summary = summarizeSimulation(runManifest({ ...DEFAULT_BALANCE_MANIFEST, maxStepsPerSeed: 80 }));
    expect(summary.sampleSize).toBe(DEFAULT_BALANCE_MANIFEST.seeds.length);
    expect(Number.isFinite(summary.scorePercentiles.p10)).toBe(true);
    expect(Number.isFinite(summary.scorePercentiles.p50)).toBe(true);
    expect(Number.isFinite(summary.scorePercentiles.p90)).toBe(true);
  });
});
