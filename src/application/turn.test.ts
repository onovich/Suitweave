import { describe, expect, it } from "vitest";
import { createGameState } from "../domain";
import { drawBasicHand, endTurn, startSession } from "./index";

describe("basic hand and turn state machine", () => {
  it("draws a deterministic six-card hand from the game RNG", () => {
    const initial = createGameState(20260711);
    const first = drawBasicHand(initial, 1);
    const second = drawBasicHand(initial, 1);

    expect(first).toEqual(second);
    expect(first.hand).toHaveLength(6);
    expect(new Set(first.hand.map((card) => card.id)).size).toBe(6);
  });

  it("discards unused cards, restores three actions, and advances the round", () => {
    const session = startSession(7);
    const result = endTurn({
      ...session,
      turn: { ...session.turn, actionsRemaining: 1 },
    });

    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.session.turn).toMatchObject({
      round: 2,
      actionsRemaining: 3,
      usedCardIds: [],
    });
    expect(result.session.turn.hand).toHaveLength(6);
  });

  it("adds and consumes a bonus ink card on the next draw", () => {
    const initial = createGameState(11);
    const drawn = drawBasicHand(
      { ...initial, rewards: { ...initial.rewards, bonusInk: "purple" } },
      2,
    );

    expect(drawn.hand).toHaveLength(7);
    expect(drawn.hand.at(-1)).toMatchObject({ kind: "ink", ink: "purple" });
    expect(drawn.state.rewards.bonusInk).toBeNull();
  });

  it("settles at the turn limit and rejects further turn changes", () => {
    const session = startSession(7);
    const finalTurn = { ...session, turn: { ...session.turn, round: 24 } };
    const settled = endTurn(finalTurn);

    expect(settled).toMatchObject({ ok: true, session: { status: "settled" } });
    if (!settled.ok) return;
    expect(endTurn(settled.session)).toMatchObject({
      ok: false,
      session: settled.session,
    });
  });
});
