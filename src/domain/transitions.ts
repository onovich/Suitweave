import type { Command, DomainEvent } from './commands';
import type { GameState } from './game-state';
import type { Board, Cell } from './types';

export type CommandResult =
  | { readonly ok: true; readonly state: GameState; readonly events: readonly DomainEvent[] }
  | { readonly ok: false; readonly state: GameState; readonly events: readonly DomainEvent[] };

export const executeCommand = (state: GameState, command: Command): CommandResult => {
  const board = state.boards.find((candidate) => candidate.id === command.boardId);
  if (board === undefined) {
    return reject(state, command, 'Board does not exist.');
  }
  if (board.locked) {
    return reject(state, command, 'Board is locked.');
  }
  const cell = board.cells.find((candidate) => candidate.id === command.cellId);
  if (cell === undefined) {
    return reject(state, command, 'Cell does not exist.');
  }
  if (!state.ruleset.inkColors.includes(command.ink)) {
    return reject(state, command, 'Ink color is not allowed by this ruleset.');
  }
  return apply(state, board, cell, command);
};

function apply(state: GameState, board: Board, cell: Cell, command: Command): CommandResult {
  const nextCell = command.type === 'place-card' && command.mode === 'number-face'
    ? { ...cell, number: command.card, ink: command.ink }
    : { ...cell, ink: command.ink };
  const nextBoard = { ...board, cells: board.cells.map((candidate) => candidate.id === cell.id ? nextCell : candidate) };
  const stateWithChange = { ...state, boards: state.boards.map((candidate) => candidate.id === board.id ? nextBoard : candidate) };
  const type = command.type === 'place-card' && command.mode === 'number-face' ? 'number-placed' : 'ink-placed';
  return { ok: true, state: stateWithChange, events: [{ type, boardId: board.id, cellId: cell.id }] };
}

function reject(state: GameState, command: Command, reason: string): CommandResult {
  return { ok: false, state, events: [{ type: 'command-rejected', command, reason }] };
}
