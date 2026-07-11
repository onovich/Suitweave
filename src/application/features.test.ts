import { describe, expect, it } from 'vitest';
import { createBoardId, createCell, createCellId, createGameState, createPosition, type Board, type FeatureCard } from '../domain';
import { executeFeatureCard, startSession } from './index';

describe('feature-card application use case', () => {
  it('consumes one action only after a valid feature succeeds', () => {
    const base = createGameState(3);
    const reserve: FeatureCard = { id: 'up', kind: 'rank-up', rarity: 'common' };
    const board: Board = { id: createBoardId('poker'), kind: 'poker', size: 7, locked: false, cells: [createCell(createCellId('cell'), createPosition(0, 0), { number: { rank: 'K', suit: 'spades' } })] };
    const session = startSession(3, { ...base, boards: [board, ...base.boards.slice(1)], rewards: { ...base.rewards, reserve: [reserve] } });
    const result = executeFeatureCard(session, 'up', [{ boardId: board.id, cellId: createCellId('cell') }]);

    expect(result).toMatchObject({ ok: true, session: { turn: { actionsRemaining: 2 }, state: { rewards: { reserve: [] } } } });
  });
});
