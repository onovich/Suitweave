import { describe, expect, it } from 'vitest';
import { createBoardId, createCell, createCellId, createGameState, createPosition, type Board } from '../domain';
import { settleSession, startSession, submitBoard } from './index';

describe('application submission and settlement', () => {
  it('submits a complete board through the domain command', () => {
    const session = sessionWithCompletePokerBoard();
    const result = submitBoard(session, createBoardId('poker'));

    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.session.state.boards[0]?.locked).toBe(true);
  });

  it('settles with phase 3 bonuses explicitly excluded', () => {
    const settlement = settleSession(startSession(7));

    expect(settlement.status).toBe('settled');
    expect(settlement.settlement).not.toBeNull();
    expect(settlement.settlement?.bonus).toBe(0);
  });
});

function sessionWithCompletePokerBoard() {
  const base = createGameState(5);
  const poker: Board = {
    id: createBoardId('poker'), kind: 'poker', size: 7, locked: false,
    cells: [
      createCell(createCellId('poker:0:0'), createPosition(0, 0), { number: { rank: '7', suit: 'spades' }, ink: 'red' }),
      createCell(createCellId('poker:0:1'), createPosition(0, 1), { number: { rank: '7', suit: 'hearts' }, ink: 'red' }),
    ],
  };
  return startSession(5, { ...base, boards: [poker, ...base.boards.slice(1)] });
}
