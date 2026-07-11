import { runCommand, type BoardId, type CellId } from "../domain";
import type { GameSession, SessionResult } from "./types";

export const openReward = (session: GameSession): SessionResult =>
  apply(session, { type: "open-reward" });
export const selectRewardOption = (
  session: GameSession,
  optionId: string,
): SessionResult => apply(session, { type: "select-reward-option", optionId });
export const discardFeature = (
  session: GameSession,
  cardId: string,
): SessionResult => apply(session, { type: "discard-reserve", cardId });
export const adjustRewardRank = (
  session: GameSession,
  boardId: BoardId,
  cellId: CellId,
  amount: -1 | 1,
): SessionResult =>
  apply(session, { type: "adjust-reward-rank", boardId, cellId, amount });

function apply(
  session: GameSession,
  command: Parameters<typeof runCommand>[1],
): SessionResult {
  const result = runCommand(session.state, command);
  if (!result.ok)
    return {
      ok: false,
      session,
      reason:
        result.events[0]?.type === "command-rejected"
          ? result.events[0].reason
          : "Reward action was rejected.",
    };
  return {
    ok: true,
    session: {
      ...session,
      state: result.state,
      selection: null,
      preview: null,
      featurePreview: null,
    },
  };
}
