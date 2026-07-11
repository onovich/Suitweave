import { analyzeConnectivity, type ConnectedGroup, type GroupClassification } from './connectivity';
import type { GameState } from './game-state';
import type { Ruleset } from './ruleset';
import { scoreBlackjackGroup, scoreMatchGroup, scorePokerGroup, type GroupScore } from './scoring';
import { createScore, type Board, type Score } from './types';

export interface GroupAnalysis {
  readonly group: ConnectedGroup;
  readonly score: GroupScore;
}

export interface BoardAnalysis {
  readonly boardId: Board['id'];
  readonly locked: boolean;
  readonly groups: readonly GroupAnalysis[];
  readonly uninkedNumberCount: number;
  readonly invalidNumberCount: number;
  readonly score: Score;
  readonly isComplete: boolean;
  readonly canSubmit: boolean;
}

export const analyzeBoard = (board: Board, ruleset: Ruleset): BoardAnalysis => {
  const groups = analyzeConnectivity(board, ruleset).map((group) => analyzeGroup(board, group));
  const uninkedNumberCount = board.cells.filter((cell) => cell.number !== undefined && cell.ink === undefined).length;
  const invalidNumberCount = uninkedNumberCount + groups.filter((group) => !group.score.valid)
    .reduce((total, group) => total + group.group.numberCells.length, 0);
  const score = createScore(groups.reduce((total, group) => total + group.score.score, 0));
  const isComplete = board.cells.some((cell) => cell.number !== undefined) && invalidNumberCount === 0;
  return { boardId: board.id, locked: board.locked, groups, uninkedNumberCount, invalidNumberCount, score, isComplete, canSubmit: isComplete && !board.locked };
};

export const analyzeGame = (state: GameState): readonly BoardAnalysis[] => state.boards.map((board) => analyzeBoard(board, state.ruleset));

export const penaltyFor = (analysis: BoardAnalysis, ruleset: Ruleset): Score => {
  const groupPenalty = analysis.groups.reduce((total, group) => total + penaltyForGroup(group, ruleset), 0);
  return createScore(groupPenalty + analysis.uninkedNumberCount * ruleset.penalties.unconnectedNumber);
};

function analyzeGroup(board: Board, group: ConnectedGroup): GroupAnalysis {
  if (group.classification !== 'candidate') return { group, score: invalidGroup(group.classification) };
  const cards = group.numberCells.flatMap((cell) => cell.number === undefined ? [] : [cell.number]);
  const score = board.kind === 'poker' ? scorePokerGroup(cards) : board.kind === 'blackjack' ? scoreBlackjackGroup(cards) : scoreMatchGroup(cards);
  return { group, score };
}

function invalidGroup(classification: GroupClassification): GroupScore {
  return { score: createScore(0), valid: false, pattern: classification };
}

function penaltyForGroup(group: GroupAnalysis, ruleset: Ruleset): number {
  if (group.score.valid || group.group.numberCells.length === 0) return 0;
  const penalty = group.group.classification === 'single' ? ruleset.penalties.unconnectedNumber : ruleset.penalties.invalidGroupNumber;
  return group.group.numberCells.length * penalty;
}
