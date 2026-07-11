import { drawReplacementCard } from "./turn";
import type { GameSession, SessionResult } from "./types";

export const redrawHandCard = (
  session: GameSession,
  cardId: string,
): SessionResult => {
  if (session.state.rewards.redraws <= 0)
    return reject(session, "No hand redraw reward is available.");
  if (
    session.turn.usedCardIds.includes(cardId) ||
    !session.turn.hand.some((card) => card.id === cardId)
  )
    return reject(session, "Only an unused hand card can be redrawn.");
  const drawn = drawReplacementCard(
    session.state,
    `r${String(session.turn.round)}-redraw-${cardId}`,
  );
  return {
    ok: true,
    session: {
      ...session,
      state: {
        ...drawn.state,
        rewards: {
          ...drawn.state.rewards,
          redraws: drawn.state.rewards.redraws - 1,
        },
      },
      turn: {
        ...session.turn,
        hand: session.turn.hand.map((card) =>
          card.id === cardId ? drawn.card : card,
        ),
      },
      selection: null,
      preview: null,
      featurePreview: null,
    },
  };
};

function reject(session: GameSession, reason: string): SessionResult {
  return { ok: false, session, reason };
}
