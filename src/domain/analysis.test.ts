import { describe, expect, it } from 'vitest';
import { analyzeBoard, calculateRating, calculateSettlement, createBoardId, createCell, createCellId, createGameState, createPosition, createScore, type Board, type InkColor, type Rank } from './index';

describe('board analysis and settlement', () => {
  it('requires a non-empty board where every number belongs to a valid group', () => {
    const empty = analyzeBoard(board([]), createGameState(1).ruleset);
    const pair = analyzeBoard(board([numberCell(0, '7'), numberCell(1, '7')]), createGameState(1).ruleset);

    expect(empty.canSubmit).toBe(false);
    expect(pair).toMatchObject({ score: 10, invalidNumberCount: 0, isComplete: true, canSubmit: true });
  });

  it('accounts for uninked, overloaded, and bust numbers in completion and penalties', () => {
    const ruleset = createGameState(1).ruleset;
    const uninked = analyzeBoard(board([uninkedNumberCell(0, '7')]), ruleset);
    const overloaded = analyzeBoard(board((['2', '3', '4', '5', '6', '7'] as const).map((rank, index) => numberCell(index, rank))), ruleset);
    const bust = analyzeBoard(board([numberCell(0, 'K'), numberCell(1, 'Q'), numberCell(2, '2')], 'blackjack'), ruleset);

    expect(uninked).toMatchObject({ invalidNumberCount: 1, canSubmit: false });
    expect(calculateSettlement([uninked], ruleset, noBonuses).penalty).toBe(-10);
    expect(calculateSettlement([overloaded], ruleset, noBonuses).penalty).toBe(-48);
    expect(calculateSettlement([bust], ruleset, noBonuses).penalty).toBe(-24);
  });

  it('applies completion inputs and the D-to-SS rating thresholds', () => {
    const completed = analyzeBoard(board([numberCell(0, '7'), numberCell(1, '7')], 'poker', true), createGameState(1).ruleset);
    const settlement = calculateSettlement([completed], createGameState(1).ruleset, { crownScore: 100, markerMeterScore: 15, unusedFunctionScore: 6 });

    expect(settlement).toMatchObject({ groupScore: 10, bonus: 201, total: 211, completedBoardCount: 1, rating: 'C' });
  });

  it.each([
    ['D', 0, 0, false], ['C', 250, 0, false], ['B', 550, 2, false], ['A', 800, 3, false], ['S', 1000, 3, true], ['SS', 1250, 3, true],
  ])('assigns rating %s', (rating, total, completedBoards, crown) => {
    expect(calculateRating(createScore(total), completedBoards, crown)).toBe(rating);
  });
});

const boardId = createBoardId('fixture');
const noBonuses = { crownScore: 0, markerMeterScore: 0, unusedFunctionScore: 0 };

function board(cells: Board['cells'], kind: Board['kind'] = 'poker', locked = false): Board {
  return { id: boardId, kind, size: 7, cells, locked };
}

function numberCell(index: number, rank: Rank, ink: InkColor = 'red') {
  return createCell(createCellId(`cell-${String(index)}`), createPosition(0, index), { number: { rank, suit: 'spades' }, ink });
}

function uninkedNumberCell(index: number, rank: Rank) {
  return createCell(createCellId(`cell-${String(index)}`), createPosition(0, index), { number: { rank, suit: 'spades' } });
}
