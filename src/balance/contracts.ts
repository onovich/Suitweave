export const BALANCE_PROFILE_V1 = {
  id: "balance-v1",
  rulesetVersion: 1,
  roundLimit: 24,
  actionsPerRound: 3,
  baseCardsDrawn: 6,
  initialNumbers: { min: 12, max: 16 },
  markerMeterThreshold: 3,
} as const;

export const FROZEN_SEED_CATALOG = {
  tutorial: [20260712],
  standard: [1, 7, 17, 42, 20260711],
  crownChallenge: [3, 11],
  overloadRecovery: [5, 23],
  bustRecovery: [8, 29],
  rewardBuilding: [13, 31],
} as const;

export type SimulationPolicyId = "random-legal" | "completion-first" | "score-first";

export interface BalanceRunManifest {
  readonly profileId: typeof BALANCE_PROFILE_V1.id;
  readonly policy: SimulationPolicyId;
  readonly seeds: readonly number[];
  readonly maxStepsPerSeed: number;
}

export interface SimulationResult {
  readonly seed: number;
  readonly policy: SimulationPolicyId;
  readonly completedBoards: number;
  readonly score: number;
  readonly rating: string;
  readonly crownTriggered: boolean;
  readonly markersCollected: number;
  readonly featureCardsUsed: number;
  readonly overloadedPreviews: number;
  readonly bustPreviews: number;
  readonly riskyPreviewsCanceled: number;
  readonly roundsPlayed: number;
  readonly remainingRounds: number;
  readonly outcome: "settled" | "step-limit" | "no-legal-action";
}

export const DEFAULT_BALANCE_MANIFEST: BalanceRunManifest = {
  profileId: BALANCE_PROFILE_V1.id,
  policy: "completion-first",
  seeds: FROZEN_SEED_CATALOG.standard,
  maxStepsPerSeed: 240,
};
