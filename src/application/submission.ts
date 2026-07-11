import { analyzeGame, calculateSettlement, runCommand, type BoardId } from '../domain';
import type { GameSession, SessionResult } from './types';

export const submitBoard = (session: GameSession, boardId: BoardId): SessionResult => {
  if (session.status !== 'playing') return reject(session, 'Game is already settled.');
  const result = runCommand(session.state, { type: 'submit-board', boardId });
  if (!result.ok) return reject(session, result.events[0]?.type === 'command-rejected' ? result.events[0].reason : 'Board cannot be submitted.');
  const next = { ...session, state: result.state, selection: null, preview: null };
  return accept(allBoardsLocked(result.state) ? settleSession(next) : next);
};

export const settleSession = (session: GameSession): GameSession => ({
  ...session,
  status: 'settled',
  selection: null,
  preview: null,
  settlement: calculateSettlement(analyzeGame(session.state), session.state.ruleset, settlementBonuses(session)),
});

function settlementBonuses(session: GameSession) {
  const crownScore = session.state.rewards.crownTriggered ? session.state.ruleset.bonuses.crown : 0;
  return { crownScore, markerMeterScore: session.state.rewards.bonusScore - crownScore, unusedFunctionScore: Math.min(30, session.state.rewards.reserve.length * 3) };
}

function allBoardsLocked(session: GameSession['state']): boolean { return session.boards.every((board) => board.locked); }
function accept(session: GameSession): SessionResult { return { ok: true, session }; }
function reject(session: GameSession, reason: string): SessionResult { return { ok: false, session, reason }; }
