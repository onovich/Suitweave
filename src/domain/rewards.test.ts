import { describe, expect, it } from 'vitest';
import { createBoardId, createCell, createCellId, createGameState, createPosition, createRewardState, executeCommand, type Board, type GameState } from './index';

describe('reward triggers', () => {
  it('collects an inspiration marker once and carries threshold overflow into the queue', () => {
    const state = stateWithBoard([cell('marker', 0, ['inspiration'])], { ...createRewardState(), inspirationProgress: 2 });
    const result = executeCommand(state, { type: 'place-ink', boardId, cellId: createCellId('marker'), ink: 'red', source: 'ink-card' });

    expect(result).toMatchObject({ ok: true, state: { rewards: { inspirationProgress: 0, pendingRewards: ['inspiration'] } } });
    expect(result.events.map((event) => event.type)).toContain('marker-collected');
    if (!result.ok) return;
    const repeat = executeCommand(result.state, { type: 'place-ink', boardId, cellId: createCellId('marker'), ink: 'blue', source: 'ink-card' });
    expect(repeat.state.rewards.collectedMarkerIds).toHaveLength(1);
  });

  it('triggers a crown reward once when both crown cells share an ink domain', () => {
    const state = stateWithBoard([cell('left', 0, ['crown']), cell('right', 1, ['crown'])]);
    const first = executeCommand(state, { type: 'place-ink', boardId, cellId: createCellId('left'), ink: 'red', source: 'ink-card' });
    if (!first.ok) throw new Error('Expected first crown placement.');
    const second = executeCommand(first.state, { type: 'place-ink', boardId, cellId: createCellId('right'), ink: 'red', source: 'ink-card' });

    expect(second).toMatchObject({ ok: true, state: { rewards: { crownTriggered: true, pendingRewards: ['crown'] } } });
    expect(second.events.map((event) => event.type)).toContain('crown-connected');
  });
});

const boardId = createBoardId('poker');

function stateWithBoard(cells: Board['cells'], rewards = createRewardState()): GameState {
  const initial = createGameState(1);
  const board: Board = { id: boardId, kind: 'poker', size: 7, cells, locked: false };
  return { ...initial, boards: [board, ...initial.boards.slice(1)], rewards };
}

function cell(id: string, column: number, markers: readonly ('crown' | 'inspiration')[]) {
  return createCell(createCellId(id), createPosition(0, column), { markers });
}
