import { describe, expect, it } from 'vitest';
import { createBoardId, createCellId, createGameState, previewCommand, replayCommands, runCommand, type Command } from './index';

describe('public domain API', () => {
  it('replays an identical command log from an identical seed', () => {
    const commands = commandLog();
    const first = replayCommands(createGameState(20260711), commands);
    const second = replayCommands(createGameState(20260711), commands);

    expect(first).toEqual(second);
    expect(first.results.map((result) => result.ok)).toEqual([true, true, false]);
  });

  it('uses exactly the same transition for preview and execution', () => {
    const state = createGameState(7);
    const command = commandLog()[0];
    if (command === undefined) throw new Error('Fixture command is missing.');

    expect(previewCommand(state, command)).toEqual(runCommand(state, command));
  });
});

function commandLog(): readonly Command[] {
  const boardId = createBoardId('poker');
  return [
    { type: 'place-card', mode: 'number-face', boardId, cellId: createCellId('poker:0:0'), card: { rank: '7', suit: 'spades' }, ink: 'red' },
    { type: 'place-card', mode: 'number-face', boardId, cellId: createCellId('poker:0:1'), card: { rank: '7', suit: 'hearts' }, ink: 'red' },
    { type: 'place-ink', boardId, cellId: createCellId('not-a-cell'), ink: 'blue', source: 'ink-card' },
  ];
}
