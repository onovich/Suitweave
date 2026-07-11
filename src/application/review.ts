import type { GameSession } from "./types";

export interface SessionReview {
  readonly seed: number;
  readonly round: number;
  readonly actionsRemaining: number;
  readonly completedBoards: number;
  readonly crownConnected: boolean;
  readonly markersCollected: number;
  readonly reserveCards: number;
  readonly total: number;
  readonly rating: string;
}

export const reviewSession = (session: GameSession): SessionReview => ({
  seed: session.state.seed,
  round: session.turn.round,
  actionsRemaining: session.turn.actionsRemaining,
  completedBoards: session.state.boards.filter((board) => board.locked).length,
  crownConnected: session.state.rewards.crownTriggered,
  markersCollected: session.state.rewards.collectedMarkerIds.length,
  reserveCards: session.state.rewards.reserve.length,
  total: session.settlement?.total ?? 0,
  rating: session.settlement?.rating ?? "Unsettled",
});
