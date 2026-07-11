import { describe, expect, it } from "vitest";
import { BALANCE_PROFILE_V1, DEFAULT_BALANCE_MANIFEST, FROZEN_SEED_CATALOG } from "./contracts";
import { RULESET_V1 } from "../domain";

describe("balance contracts", () => {
  it("keeps the default profile aligned with Ruleset v1 without mutating it", () => {
    expect(BALANCE_PROFILE_V1).toMatchObject({ roundLimit: RULESET_V1.roundLimit, actionsPerRound: RULESET_V1.actionsPerRound, baseCardsDrawn: RULESET_V1.baseCardsDrawn, initialNumbers: RULESET_V1.initialNumbers, markerMeterThreshold: RULESET_V1.markerMeterThreshold });
    expect(DEFAULT_BALANCE_MANIFEST.seeds).toEqual(FROZEN_SEED_CATALOG.standard);
  });
});
