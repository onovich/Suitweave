import { describe, expect, it } from "vitest";
import { redrawHandCard, startSession } from "./index";

describe("hand reward actions", () => {
  it("replaces one unused hand card and consumes its redraw reward", () => {
    const session = startSession(20);
    const target = session.turn.hand[0];
    if (target === undefined) throw new Error("Expected a hand card.");
    const prepared = {
      ...session,
      state: {
        ...session.state,
        rewards: { ...session.state.rewards, redraws: 1 },
      },
    };
    const result = redrawHandCard(prepared, target.id);

    expect(result).toMatchObject({
      ok: true,
      session: { state: { rewards: { redraws: 0 } } },
    });
    if (!result.ok) return;
    expect(result.session.turn.hand[0]?.id).not.toBe(target.id);
  });
});
