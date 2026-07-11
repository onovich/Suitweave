import type { GameState } from '../domain';
import { generateStandardGame } from './generator';
import type { GameSession, SessionResult } from './types';

export const startSession = (seed: number, state: GameState = generateStandardGame(seed).state): GameSession => ({
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
