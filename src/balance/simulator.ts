import { analyzeGame, type BoardId, type CellId } from "../domain";
import { endTurn, executePreview, openReward, previewPlacement, selectCard, selectRewardOption, startSession, submitBoard, type GameSession } from "../application";
import { type BalanceRunManifest, type SimulationPolicyId, type SimulationResult } from "./contracts";

export const simulateSeed = (seed: number, policy: SimulationPolicyId, maxSteps: number): SimulationResult => {
  let session = startSession(seed);
  let steps = 0;
  while (session.status === "playing" && steps < maxSteps) {
    session = nextSession(session, policy, steps);
    steps += 1;
  }
  const analysis = analyzeGame(session.state);
  return {
    seed,
    policy,
    completedBoards: session.state.boards.filter((board) => board.locked).length,
    score: session.settlement?.total ?? analysis.reduce((total, board) => total + board.score, 0),
    rating: session.settlement?.rating ?? "Unsettled",
    crownTriggered: session.state.rewards.crownTriggered,
    markersCollected: session.state.rewards.collectedMarkerIds.length,
    featureCardsUsed: session.metrics.featureCardsUsed,
    overloadedPreviews: session.metrics.overloadedPreviews,
    bustPreviews: session.metrics.bustPreviews,
    riskyPreviewsCanceled: session.metrics.riskyPreviewsCanceled,
    roundsPlayed: session.turn.round,
    remainingRounds: session.state.ruleset.roundLimit - session.turn.round,
    outcome: session.status === "settled" ? "settled" : steps >= maxSteps ? "step-limit" : "no-legal-action",
  };
};

export const runManifest = (manifest: BalanceRunManifest): readonly SimulationResult[] => manifest.seeds.map((seed) => simulateSeed(seed, manifest.policy, manifest.maxStepsPerSeed));

function nextSession(session: GameSession, policy: SimulationPolicyId, step: number): GameSession {
  if (session.state.rewards.activeOffer !== null) {
    const option = session.state.rewards.activeOffer.options[0];
    return option === undefined ? session : selectRewardOption(session, option.id).session;
  }
  if (session.state.rewards.pendingRewards.length > 0) return openReward(session).session;
  const submittable = analyzeGame(session.state).find((board) => board.canSubmit);
  if (submittable !== undefined) return submitBoard(session, submittable.boardId).session;
  if (session.preview !== null) return executePreview(session).session;
  if (session.turn.actionsRemaining <= 0) return endTurn(session).session;
  const card = session.turn.hand.find((candidate) => !session.turn.usedCardIds.includes(candidate.id));
  if (card === undefined) return endTurn(session).session;
  const selected = selectCard(session, card.id);
  if (!selected.ok) return selected.session;
  const target = targetFor(selected.session, policy, step);
  if (target === undefined) return endTurn(selected.session).session;
  return previewPlacement(selected.session, target.boardId, target.cellId).session;
}

function targetFor(session: GameSession, policy: SimulationPolicyId, step: number): Readonly<{ boardId: BoardId; cellId: CellId }> | undefined {
  const boards = session.state.boards.filter((board) => !board.locked);
  const scores = new Map(analyzeGame(session.state).map((board) => [board.boardId, board.score]));
  const ordered = policy === "random-legal" ? rotate(boards, step) : policy === "score-first" ? [...boards].sort((left, right) => (scores.get(right.id) ?? 0) - (scores.get(left.id) ?? 0)) : boards;
  const board = ordered[0];
  const cell = board?.cells.find((candidate) => candidate.ink === undefined) ?? board?.cells[0];
  return board === undefined || cell === undefined ? undefined : { boardId: board.id, cellId: cell.id };
}

function rotate<Value>(values: readonly Value[], offset: number): readonly Value[] {
  if (values.length === 0) return values;
  const start = offset % values.length;
  return [...values.slice(start), ...values.slice(0, start)];
}
