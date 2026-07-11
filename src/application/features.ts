import { runCommand, type FeatureTarget } from '../domain';
import type { GameSession, SessionResult } from './types';

export const executeFeatureCard = (session: GameSession, cardId: string, targets: readonly FeatureTarget[]): SessionResult => {
  if (session.state.rewards.activeOffer !== null || session.state.rewards.pendingRewards.length > 0) return { ok: false, session, reason: 'Resolve pending rewards before using a feature.' };
  const result = runCommand(session.state, { type: 'use-feature', cardId, targets });
  if (!result.ok) return { ok: false, session, reason: result.events[0]?.type === 'command-rejected' ? result.events[0].reason : 'Feature use was rejected.' };
  if (session.turn.actionsRemaining <= 0) return { ok: false, session, reason: 'No actions remain this turn.' };
  return { ok: true, session: { ...session, state: result.state, turn: { ...session.turn, actionsRemaining: session.turn.actionsRemaining - 1 }, selection: null, preview: null } };
};
