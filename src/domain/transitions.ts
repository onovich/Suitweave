import type { Command, DomainEvent, PlacementCommand } from './commands';
import { analyzeBoard } from './analysis';
import { analyzeConnectivity } from './connectivity';
import { executeRewardCommand } from './reward-transitions';
import { executeFeature } from './feature-transitions';
import type { GameState } from './game-state';
import type { Board, Cell } from './types';

export type CommandResult =
  | { readonly ok: true; readonly state: GameState; readonly events: readonly DomainEvent[] }
  | { readonly ok: false; readonly state: GameState; readonly events: readonly DomainEvent[] };

export const executeCommand = (state: GameState, command: Command): CommandResult => {
  if (command.type === 'open-reward' || command.type === 'select-reward-option' || command.type === 'discard-reserve') {
    const result = executeRewardCommand(state, command);
    return result.reason === undefined ? { ok: true, state: result.state, events: result.events } : reject(state, command, result.reason);
  }
  if (command.type === 'use-feature') {
    const result = executeFeature(state, command);
    return result.reason === undefined ? { ok: true, state: result.state, events: result.events } : reject(state, command, result.reason);
  }
  const board = state.boards.find((candidate) => candidate.id === command.boardId);
  if (board === undefined) {
    return reject(state, command, 'Board does not exist.');
  }
  if (board.locked) {
    return reject(state, command, 'Board is locked.');
  }
  if (command.type === 'submit-board') {
    return submit(state, board, command);
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

function apply(state: GameState, board: Board, cell: Cell, command: PlacementCommand): CommandResult {
  const nextCell = command.type === 'place-card' && command.mode === 'number-face'
    ? { ...cell, number: command.card, ink: command.ink }
    : { ...cell, ink: command.ink };
  const nextBoard = { ...board, cells: board.cells.map((candidate) => candidate.id === cell.id ? nextCell : candidate) };
  const stateWithChange = { ...state, boards: state.boards.map((candidate) => candidate.id === board.id ? nextBoard : candidate) };
  const type = command.type === 'place-card' && command.mode === 'number-face' ? 'number-placed' : 'ink-placed';
  const rewardUpdate = applyPlacementRewards(state, stateWithChange, board, nextBoard, cell);
  return { ok: true, state: rewardUpdate.state, events: [{ type, boardId: board.id, cellId: cell.id }, ...rewardUpdate.events] };
}

function submit(state: GameState, board: Board, command: Command): CommandResult {
  if (!analyzeBoard(board, state.ruleset).canSubmit) {
    return reject(state, command, 'Board does not meet submission requirements.');
  }
  const nextBoard = { ...board, locked: true };
  const nextState = { ...state, boards: state.boards.map((candidate) => candidate.id === board.id ? nextBoard : candidate) };
  const rewards = { ...nextState.rewards, pendingRewards: [...nextState.rewards.pendingRewards, 'completion' as const] };
  return { ok: true, state: { ...nextState, rewards }, events: [{ type: 'board-submitted', boardId: board.id }, { type: 'reward-queued', reward: 'completion' }] };
}

function applyPlacementRewards(before: GameState, after: GameState, previousBoard: Board, nextBoard: Board, previousCell: Cell): Readonly<{ state: GameState; events: readonly DomainEvent[] }> {
  let rewards = after.rewards;
  const events: DomainEvent[] = [];
  const nextCell = nextBoard.cells.find((candidate) => candidate.id === previousCell.id);
  if (nextCell !== undefined && previousCell.ink === undefined && nextCell.ink !== undefined && nextCell.markers.includes('inspiration') && !rewards.collectedMarkerIds.includes(nextCell.id)) {
    const progress = rewards.inspirationProgress + 1;
    const queued = progress >= after.ruleset.markerMeterThreshold;
    rewards = { ...rewards, collectedMarkerIds: [...rewards.collectedMarkerIds, nextCell.id], inspirationProgress: queued ? progress - after.ruleset.markerMeterThreshold : progress, pendingRewards: queued ? [...rewards.pendingRewards, 'inspiration' as const] : rewards.pendingRewards };
    events.push({ type: 'marker-collected', boardId: nextBoard.id, cellId: nextCell.id });
    if (queued) events.push({ type: 'reward-queued', reward: 'inspiration' });
  }
  if (!rewards.crownTriggered && crownsConnected(nextBoard, after)) {
    rewards = { ...rewards, crownTriggered: true, pendingRewards: [...rewards.pendingRewards, 'crown' as const] };
    events.push({ type: 'crown-connected', boardId: nextBoard.id }, { type: 'reward-queued', reward: 'crown' });
  }
  return { state: rewards === before.rewards ? after : { ...after, rewards }, events };
}

function crownsConnected(board: Board, state: GameState): boolean {
  const crowns = board.cells.filter((cell) => cell.markers.includes('crown'));
  if (crowns.length !== 2) return false;
  return analyzeConnectivity(board, state.ruleset).some((group) => crowns.every((crown) => group.cells.some((cell) => cell.id === crown.id)));
}

function reject(state: GameState, command: Command, reason: string): CommandResult {
  return { ok: false, state, events: [{ type: 'command-rejected', command, reason }] };
}
