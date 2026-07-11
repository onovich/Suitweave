import {
  analyzeBoard,
  previewCommand,
  runCommand,
  type BoardId,
  type CellId,
  type Command,
  type InkColor,
} from "../domain";
import type {
  GameSession,
  Preview,
  PreviewRisk,
  Selection,
  SessionResult,
} from "./types";

export const selectCard = (
  session: GameSession,
  cardId: string,
): SessionResult => {
  if (session.status !== "playing")
    return reject(session, "Game is already settled.");
  if (rewardPending(session))
    return reject(session, "Resolve pending rewards before continuing.");
  const card = session.turn.hand.find((candidate) => candidate.id === cardId);
  if (card === undefined || session.turn.usedCardIds.includes(cardId))
    return reject(session, "Card is not available.");
  const selection: Selection = { cardId, mode: "face", wildcardInk: null };
  return accept({ ...session, selection, preview: null, featurePreview: null });
};

export const setNumberMode = (
  session: GameSession,
  mode: Selection["mode"],
): SessionResult => {
  const card = selectedCard(session);
  const selection = session.selection;
  if (card?.kind !== "number" || selection === null)
    return reject(session, "Selected card cannot be flipped.");
  return accept({
    ...session,
    selection: {
      cardId: selection.cardId,
      mode,
      wildcardInk: selection.wildcardInk,
    },
    preview: null,
    featurePreview: null,
  });
};

export const chooseWildcardInk = (
  session: GameSession,
  ink: InkColor,
): SessionResult => {
  const card = selectedCard(session);
  const selection = session.selection;
  if (card?.kind !== "wildcard" || selection === null)
    return reject(session, "Selected card is not a wildcard.");
  if (!session.state.ruleset.inkColors.includes(ink))
    return reject(session, "Ink color is not allowed by this ruleset.");
  return accept({
    ...session,
    selection: {
      cardId: selection.cardId,
      mode: selection.mode,
      wildcardInk: ink,
    },
    preview: null,
    featurePreview: null,
  });
};

export const previewPlacement = (
  session: GameSession,
  boardId: BoardId,
  cellId: CellId,
): SessionResult => {
  const command = placementCommand(session, boardId, cellId);
  if (typeof command === "string") return reject(session, command);
  const beforeBoard = session.state.boards.find(
    (board) => board.id === boardId,
  );
  if (beforeBoard === undefined)
    return reject(session, "Board does not exist.");
  const result = previewCommand(session.state, command);
  const afterBoard = result.state.boards.find((board) => board.id === boardId);
  if (afterBoard === undefined)
    return reject(session, "Preview could not find its board.");
  const before = analyzeBoard(beforeBoard, session.state.ruleset);
  const after = analyzeBoard(afterBoard, session.state.ruleset);
  const preview: Preview = {
    sourceState: session.state,
    cardId: commandCardId(session),
    command,
    result,
    before,
    after,
    risks: previewRisks(result, beforeBoard.locked, before, after),
  };
  return accept({ ...session, preview, featurePreview: null });
};

export const executePreview = (session: GameSession): SessionResult => {
  const preview = session.preview;
  if (preview === null) return reject(session, "No current preview.");
  if (
    preview.sourceState !== session.state ||
    preview.cardId !== commandCardId(session)
  )
    return reject(session, "Preview is stale.");
  if (!preview.result.ok)
    return reject(session, "Previewed action is invalid.");
  const result = runCommand(session.state, preview.command);
  if (!result.ok)
    return reject(session, "Previewed action is no longer valid.");
  const nextTurn = {
    ...session.turn,
    actionsRemaining: session.turn.actionsRemaining - 1,
    usedCardIds: [...session.turn.usedCardIds, preview.cardId],
  };
  return accept({
    ...session,
    state: result.state,
    turn: nextTurn,
    selection: null,
    preview: null,
    featurePreview: null,
  });
};

function placementCommand(
  session: GameSession,
  boardId: BoardId,
  cellId: CellId,
): Command | string {
  if (rewardPending(session))
    return "Resolve pending rewards before continuing.";
  if (session.turn.actionsRemaining <= 0) return "No actions remain this turn.";
  const card = selectedCard(session);
  if (card === undefined || session.selection === null)
    return "No card is selected.";
  if (card.kind === "number") {
    return session.selection.mode === "face"
      ? {
          type: "place-card",
          mode: "number-face",
          boardId,
          cellId,
          card: card.card,
          ink: card.ink,
        }
      : {
          type: "place-card",
          mode: "number-back",
          boardId,
          cellId,
          ink: card.ink,
        };
  }
  if (card.kind === "ink")
    return {
      type: "place-ink",
      boardId,
      cellId,
      ink: card.ink,
      source: "ink-card",
    };
  if (session.selection.wildcardInk === null)
    return "Choose an ink color for the wildcard.";
  return {
    type: "place-ink",
    boardId,
    cellId,
    ink: session.selection.wildcardInk,
    source: "wildcard",
  };
}

function selectedCard(session: GameSession) {
  if (session.selection === null) return undefined;
  return session.turn.hand.find(
    (card) => card.id === session.selection?.cardId,
  );
}

function commandCardId(session: GameSession): string {
  return session.selection?.cardId ?? "";
}

function previewRisks(
  preview: Preview["result"],
  wasLocked: boolean,
  before: Preview["before"],
  after: Preview["after"],
): readonly PreviewRisk[] {
  if (!preview.ok) return wasLocked ? ["locked"] : [];
  const risks: PreviewRisk[] = [];
  if (after.groups.some((group) => group.group.classification === "single"))
    risks.push("singleton");
  if (after.groups.some((group) => group.group.classification === "overloaded"))
    risks.push("overloaded");
  if (after.groups.some((group) => group.score.pattern === "bust"))
    risks.push("bust");
  if (after.invalidNumberCount > before.invalidNumberCount)
    risks.push("breaks-valid-group");
  return risks;
}

function accept(session: GameSession): SessionResult {
  return { ok: true, session };
}
function reject(session: GameSession, reason: string): SessionResult {
  return { ok: false, session, reason };
}
function rewardPending(session: GameSession): boolean {
  return (
    session.state.rewards.activeOffer !== null ||
    session.state.rewards.pendingRewards.length > 0 ||
    session.state.rewards.activeReroll !== null
  );
}
