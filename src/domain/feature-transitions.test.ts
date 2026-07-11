import { describe, expect, it } from 'vitest';
import { createBoardId, createCell, createCellId, createGameState, createPosition, executeCommand, type Board, type FeatureCard, type GameState } from './index';

describe('first feature-card set', () => {
  it.each(['swap-ink', 'swap-number', 'rank-up', 'rank-down', 'reroll-number', 'sever-ink'] as const)('uses %s only when its targets validate', (kind) => {
    const state = fixture(kind);
    const targets = kind === 'swap-ink' || kind === 'swap-number' || kind === 'sever-ink'
      ? [target('a'), target('b')]
      : [target('a')];
    const result = executeCommand(state, { type: 'use-feature', cardId: `card-${kind}`, targets });

    expect(result).toMatchObject({ ok: true, events: [{ type: 'feature-used', cardId: `card-${kind}` }] });
    if (!result.ok) return;
    expect(result.state.rewards.reserve).toEqual([]);
  });

  it('rejects locked or malformed feature targets without consuming the card', () => {
    const state = fixture('rank-up', true);
    const result = executeCommand(state, { type: 'use-feature', cardId: 'card-rank-up', targets: [target('a')] });

    expect(result).toMatchObject({ ok: false, state, events: [{ type: 'command-rejected' }] });
  });
});

const boardId = createBoardId('poker');

function fixture(kind: FeatureCard['kind'], locked = false): GameState {
  const initial = createGameState(12);
  const reserve: FeatureCard = { id: `card-${kind}`, kind, rarity: 'common' };
  const board: Board = {
    id: boardId, kind: 'poker', size: 7, locked,
    cells: [
      createCell(createCellId('a'), createPosition(0, 0), { number: { rank: 'K', suit: 'spades' }, ink: 'red' }),
      createCell(createCellId('b'), createPosition(0, 1), { number: { rank: '2', suit: 'hearts' }, ink: 'blue' }),
    ],
  };
  return { ...initial, boards: [board, ...initial.boards.slice(1)], rewards: { ...initial.rewards, reserve: [reserve] } };
}

function target(cellId: string) { return { boardId, cellId: createCellId(cellId) }; }
