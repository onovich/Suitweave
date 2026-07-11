import { describe, expect, it } from "vitest";
import { DEFAULT_BALANCE_MANIFEST } from "./contracts";
import { runManifest, simulateSeed } from "./simulator";

describe("headless balance simulation", () => {
  it("replays an individual seed exactly", () => {
    expect(simulateSeed(17, "completion-first", 80)).toEqual(simulateSeed(17, "completion-first", 80));
  });

  it("records a deterministic result for each manifest seed", () => {
    const first = runManifest({ ...DEFAULT_BALANCE_MANIFEST, maxStepsPerSeed: 80 });
    expect(first).toEqual(runManifest({ ...DEFAULT_BALANCE_MANIFEST, maxStepsPerSeed: 80 }));
    expect(first).toHaveLength(DEFAULT_BALANCE_MANIFEST.seeds.length);
  });
});
