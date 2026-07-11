import { describe, expect, it } from 'vitest';
import { createGameState, createPosition, createScore, RULESET_V1 } from './index';

describe('Phase 1 domain contract', () => {
  it('creates three independent standard boards from the default ruleset', () => {
    const state = createGameState(20260711);

    expect(state.ruleset).toBe(RULESET_V1);
    expect(state.boards.map((board) => board.kind)).toEqual(['poker', 'blackjack', 'match']);
    expect(state.boards.every((board) => board.cells.length === 49 && !board.locked)).toBe(true);
  });

  it('rejects invalid state primitives before they reach the domain', () => {
    expect(() => createGameState(0.5)).toThrow('Seed must be an integer.');
    expect(() => createPosition(-1, 0)).toThrow('Position coordinates');
    expect(() => createScore(Number.NaN)).toThrow('Score must be finite.');
  });

  it('matches the frozen GDD appendix defaults', () => {
    expect(RULESET_V1).toMatchObject({
      boardSize: 7,
      roundLimit: 24,
      baseCardsDrawn: 6,
      actionsPerRound: 3,
      initialNumbers: { min: 12, max: 16 },
      validGroupNumbers: { min: 2, max: 5 },
      functionReserveLimit: 9,
      markerMeterThreshold: 3,
    });
  });
});
