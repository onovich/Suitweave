import { createScore, type Score } from './types';
import { penaltyFor, type BoardAnalysis } from './analysis';
import type { Ruleset } from './ruleset';

export type Rating = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export interface SettlementBonuses {
  readonly crownScore: number;
  readonly markerMeterScore: number;
  readonly unusedFunctionScore: number;
}

export interface GameSettlement {
  readonly groupScore: Score;
  readonly penalty: Score;
  readonly bonus: Score;
  readonly total: Score;
  readonly completedBoardCount: number;
  readonly rating: Rating;
}

export const calculateSettlement = (
  analyses: readonly BoardAnalysis[],
  ruleset: Ruleset,
  bonuses: SettlementBonuses,
): GameSettlement => {
  const groupScore = createScore(analyses.reduce((total, analysis) => total + analysis.score, 0));
  const penalty = createScore(analyses.reduce((total, analysis) => total + penaltyFor(analysis, ruleset), 0));
  const completedBoardCount = analyses.filter((analysis) => analysis.isComplete && analysis.locked).length;
  const bonus = createScore(completedBoardCount * ruleset.bonuses.boardComplete + bonuses.crownScore + bonuses.markerMeterScore + bonuses.unusedFunctionScore);
  const total = createScore(groupScore + penalty + bonus);
  return { groupScore, penalty, bonus, total, completedBoardCount, rating: calculateRating(total, completedBoardCount, bonuses.crownScore > 0) };
};

export const calculateRating = (total: Score, completedBoardCount: number, crownConnected: boolean): Rating => {
  if (hasCrownRating(total, completedBoardCount, crownConnected, 1250)) return 'SS';
  if (hasCrownRating(total, completedBoardCount, crownConnected, 1000)) return 'S';
  if (hasCompletedRating(total, completedBoardCount, 3, 800)) return 'A';
  if (hasCompletedRating(total, completedBoardCount, 2, 550)) return 'B';
  if (completedBoardCount >= 1 || total >= 250) return 'C';
  return 'D';
};

function hasCrownRating(total: Score, completedBoards: number, crownConnected: boolean, scoreThreshold: number): boolean {
  return crownConnected && hasCompletedRating(total, completedBoards, 3, scoreThreshold);
}

function hasCompletedRating(total: Score, completedBoards: number, boardThreshold: number, scoreThreshold: number): boolean {
  return completedBoards >= boardThreshold && total >= scoreThreshold;
}
