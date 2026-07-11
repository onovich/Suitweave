import { previewCommand, runCommand, type FeatureTarget } from "../domain";
import type { GameSession, SessionResult } from "./types";

export const previewFeatureCard = (
  session: GameSession,
  cardId: string,
  targets: readonly FeatureTarget[],
): SessionResult => {
  if (
    session.state.rewards.activeOffer !== null ||
    session.state.rewards.pendingRewards.length > 0 ||
    session.state.rewards.activeReroll !== null
  )
    return {
      ok: false,
      session,
      reason: "Resolve pending rewards or effects before using a feature.",
    };
  if (session.turn.actionsRemaining <= 0)
    return { ok: false, session, reason: "No actions remain this turn." };
  const result = previewCommand(session.state, {
    type: "use-feature",
    cardId,
    targets,
  });
  if (!result.ok)
    return {
      ok: false,
      session,
      reason:
        result.events[0]?.type === "command-rejected"
          ? result.events[0].reason
          : "Feature use was rejected.",
    };
  return {
    ok: true,
    session: {
      ...session,
      selection: null,
      preview: null,
      featurePreview: { sourceState: session.state, cardId, targets, result },
    },
  };
};

export const executeFeaturePreview = (session: GameSession): SessionResult => {
  const preview = session.featurePreview;
  if (preview?.sourceState !== session.state)
    return { ok: false, session, reason: "No current feature preview." };
  const result = runCommand(session.state, {
    type: "use-feature",
    cardId: preview.cardId,
    targets: preview.targets,
  });
  if (!result.ok)
    return {
      ok: false,
      session,
      reason:
        result.events[0]?.type === "command-rejected"
          ? result.events[0].reason
          : "Feature use was rejected.",
    };
  const createsRerollOffer = result.events.some(
    (event) => event.type === "reroll-offered",
  );
  return {
    ok: true,
    session: {
      ...session,
      state: result.state,
      metrics: {
        ...session.metrics,
        featureCardsUsed: session.metrics.featureCardsUsed + Number(!createsRerollOffer),
      },
      turn: createsRerollOffer
        ? session.turn
        : {
            ...session.turn,
            actionsRemaining: session.turn.actionsRemaining - 1,
          },
      selection: null,
      preview: null,
      featurePreview: null,
    },
  };
};

export const selectRerollCandidate = (
  session: GameSession,
  candidateIndex: number,
): SessionResult => {
  if (session.turn.actionsRemaining <= 0)
    return { ok: false, session, reason: "No actions remain this turn." };
  const result = runCommand(session.state, {
    type: "select-reroll-option",
    candidateIndex,
  });
  if (!result.ok)
    return {
      ok: false,
      session,
      reason:
        result.events[0]?.type === "command-rejected"
          ? result.events[0].reason
          : "Reroll selection was rejected.",
    };
  return {
    ok: true,
    session: {
      ...session,
      state: result.state,
      metrics: { ...session.metrics, featureCardsUsed: session.metrics.featureCardsUsed + 1 },
      turn: {
        ...session.turn,
        actionsRemaining: session.turn.actionsRemaining - 1,
      },
      selection: null,
      preview: null,
      featurePreview: null,
    },
  };
};

// Kept as a narrow compatibility entry point for callers that already have valid targets.
export const executeFeatureCard = (
  session: GameSession,
  cardId: string,
  targets: readonly FeatureTarget[],
): SessionResult => {
  const preview = previewFeatureCard(session, cardId, targets);
  return preview.ok ? executeFeaturePreview(preview.session) : preview;
};
