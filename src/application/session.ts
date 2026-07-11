import type { GameState } from "../domain";
import { generateStandardGame } from "./generator";
import { settleSession } from "./submission";
import { drawBasicHand } from "./turn";
import { advanceTutorial, createTutorialState, TUTORIAL_SEED } from "./tutorial";
import type { GameSession, SessionResult } from "./types";

export const startSession = (
  seed: number,
  initial: GameState = generateStandardGame(seed).state,
): GameSession => {
  const drawn = drawBasicHand(initial, 1);
  return {
    state: drawn.state,
    turn: {
      round: 1,
      actionsRemaining: drawn.state.ruleset.actionsPerRound,
      hand: drawn.hand,
      usedCardIds: [],
    },
    status: "playing",
    selection: null,
    preview: null,
    featurePreview: null,
    tutorial: null,
    settlement: null,
  };
};

export const startTutorialSession = (): GameSession => ({ ...startSession(TUTORIAL_SEED), tutorial: createTutorialState() });

export const rejectSessionAction = (
  session: GameSession,
  reason: string,
): SessionResult => ({
  ok: false,
  session,
  reason,
});

export const endTurn = (session: GameSession): SessionResult => {
  if (session.status !== "playing")
    return rejectSessionAction(session, "Game is already settled.");
  if (
    session.state.rewards.activeOffer !== null ||
    session.state.rewards.pendingRewards.length > 0 ||
    session.state.rewards.activeReroll !== null
  )
    return rejectSessionAction(
      session,
      "Resolve pending rewards or effects before ending the turn.",
    );
  if (
    allBoardsLocked(session.state) ||
    session.turn.round >= session.state.ruleset.roundLimit
  ) {
    return { ok: true, session: settleSession(session) };
  }
  const nextRound = session.turn.round + 1;
  const drawn = drawBasicHand(session.state, nextRound);
  const nextSession: GameSession = {
      ...session,
      state: drawn.state,
      turn: {
        round: nextRound,
        actionsRemaining: drawn.state.ruleset.actionsPerRound,
        hand: drawn.hand,
        usedCardIds: [],
      },
      selection: null,
      preview: null,
      featurePreview: null,
  };
  return { ok: true, session: advanceTutorial(nextSession) };
};

function allBoardsLocked(state: GameState): boolean {
  return state.boards.every((board) => board.locked);
}
