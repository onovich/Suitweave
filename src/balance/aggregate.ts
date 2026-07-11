import type { SimulationResult } from "./contracts";

export interface BaselineSummary {
  readonly sampleSize: number;
  readonly meanScore: number;
  readonly completedBoardRate: number;
  readonly crownRate: number;
  readonly scorePercentiles: Readonly<{ p10: number; p50: number; p90: number }>;
  readonly abnormalSeeds: readonly number[];
}

export const summarizeSimulation = (results: readonly SimulationResult[]): BaselineSummary => {
  if (results.length === 0) throw new RangeError("Simulation baseline requires at least one result.");
  const scores = [...results.map((result) => result.score)].sort((left, right) => left - right);
  return {
    sampleSize: results.length,
    meanScore: average(results.map((result) => result.score)),
    completedBoardRate: average(results.map((result) => result.completedBoards / 3)),
    crownRate: average(results.map((result) => Number(result.crownTriggered))),
    scorePercentiles: { p10: percentile(scores, 0.1), p50: percentile(scores, 0.5), p90: percentile(scores, 0.9) },
    abnormalSeeds: results.filter((result) => result.outcome !== "settled" || result.roundsPlayed > 24).map((result) => result.seed),
  };
};

function average(values: readonly number[]): number { return values.reduce((total, value) => total + value, 0) / values.length; }
function percentile(values: readonly number[], ratio: number): number { return values[Math.min(values.length - 1, Math.floor((values.length - 1) * ratio))] ?? 0; }
