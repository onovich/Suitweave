import { describe, expect, it } from 'vitest';
import { createBoardId, createCell, createCellId, createGameState, createPosition, executeCommand, type Board, type GameState } from './index';

describe('board submission', () => {
  it('locks a complete board and preserves the event boundary', () => {
    const state = stateWithPair();
    const result = executeCommand(state, { type: 'submit-board', boardId });

    expect(result.ok).toBe(true);
    expect(result.events.map((event) => event.type)).toContain('board-submitted');
    if (!result.ok) return;
    expect(result.state.boards[0]?.locked).toBe(true);
    expect(executeCommand(result.state, { type: 'submit-board', boardId })).toMatchObject({ ok: false, state: result.state });
  });

  it('rejects an empty board without changing it', () => {
    const state = createGameState(1);
    const result = executeCommand(state, { type: 'submit-board', boardId: state.boards[0]?.id ?? boardId });

    expect(result).toMatchObject({ ok: false, state, events: [{ type: 'command-rejected', reason: 'Board does not meet submission requirements.' }] });
  });
});

const boardId = createBoardId('poker');

function stateWithPair(): GameState {
  const base = createGameState(1);
  const cells = ['cell-a', 'cell-b'].map((id, index) => createCell(
    createCellId(id), createPosition(0, index), { number: { rank: '7', suit: 'spades' }, ink: 'red' },
  ));
  const board: Board = { id: boardId, kind: 'poker', size: 7, cells, locked: false };
  return { ...base, boards: [board, ...base.boards.slice(1)] };
}
