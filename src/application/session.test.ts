import { describe, expect, it } from 'vitest';
import { createGameState } from '../domain';
import { rejectSessionAction, startSession } from './index';

describe('application session contract', () => {
  it('starts a standard session without altering the domain source of truth', () => {
    const state = createGameState(42);
    const session = startSession(42, state);

    expect(session).toMatchObject({ status: 'playing', selection: null, preview: null, settlement: null });
    expect(session.state).toMatchObject({ seed: state.seed, ruleset: state.ruleset, boards: state.boards });
    expect(session.turn).toMatchObject({ round: 1, actionsRemaining: 3, usedCardIds: [] });
    expect(session.turn.hand).toHaveLength(6);
  });

  it('keeps rejected application intent non-mutating', () => {
    const session = startSession(42);
    const result = rejectSessionAction(session, 'No selected card.');

    expect(result).toEqual({ ok: false, session, reason: 'No selected card.' });
  });
});
