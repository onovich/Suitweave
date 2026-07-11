import { describe, expect, it } from 'vitest';
import { executeCommand } from './transitions';
import { createGameState } from './game-state';
import { createBoardId, createCell, createCellId, createPosition, type Board, type GameState } from './index';

describe('card placement transitions', () => {
  it('covers number and ink for a number card face', () => {
    const state = stateWithCell({ number: { rank: '2', suit: 'clubs' }, ink: 'blue' });
    const result = executeCommand(state, faceCommand());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.boards[0]?.cells[0]).toMatchObject({ number: { rank: 'K', suit: 'hearts' }, ink: 'red' });
    expect(result.events[0]?.type).toBe('number-placed');
  });

  it('keeps a number when a card back or ink card covers only ink', () => {
    const state = stateWithCell({ number: { rank: '7', suit: 'spades' }, ink: 'red' });
    const back = executeCommand(state, { type: 'place-card', mode: 'number-back', boardId, cellId, ink: 'blue' });
    const wildcard = executeCommand(state, { type: 'place-ink', boardId, cellId, ink: 'purple', source: 'wildcard' });

    expect(back.ok && back.state.boards[0]?.cells[0]).toMatchObject({ number: { rank: '7' }, ink: 'blue' });
    expect(wildcard.ok && wildcard.state.boards[0]?.cells[0]).toMatchObject({ number: { rank: '7' }, ink: 'purple' });
  });

  it('rejects locked and missing targets without changing state', () => {
    const locked = stateWithCell({}, true);
    const rejected = executeCommand(locked, faceCommand());
    const missingState = stateWithCell({});
    const missing = executeCommand(missingState, { ...faceCommand(), cellId: createCellId('missing') });

    expect(rejected).toMatchObject({ ok: false, state: locked, events: [{ type: 'command-rejected', reason: 'Board is locked.' }] });
    expect(missing.ok).toBe(false);
    expect(missing.state).toBe(missingState);
  });
});

const boardId = createBoardId('poker');
const cellId = createCellId('cell');

function faceCommand() {
  return { type: 'place-card' as const, mode: 'number-face' as const, boardId, cellId, card: { rank: 'K' as const, suit: 'hearts' as const }, ink: 'red' as const };
}

function stateWithCell(contents: Parameters<typeof createCell>[2], locked = false): GameState {
  const base = createGameState(1);
  const board: Board = { id: boardId, kind: 'poker', size: 1, cells: [createCell(cellId, createPosition(0, 0), contents)], locked };
  return { ...base, boards: [board, ...base.boards.slice(1)] };
}
