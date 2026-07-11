import { createGameState, type GameState } from '../domain';
import type { GameSession, SessionResult } from './types';

export const startSession = (seed: number, state: GameState = createGameState(seed)): GameSession => ({
  state,
  turn: { round: 1, actionsRemaining: state.ruleset.actionsPerRound, hand: [], usedCardIds: [] },
  status: 'playing',
  selection: null,
  preview: null,
  settlement: null,
});

export const rejectSessionAction = (session: GameSession, reason: string): SessionResult => ({
  ok: false,
  session,
  reason,
});
