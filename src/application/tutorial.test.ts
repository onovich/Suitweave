import { describe, expect, it } from "vitest";
import {
  completeTutorial,
  endTurn,
  skipTutorial,
  startTutorialSession,
  TUTORIAL_SEED,
  tutorialStepForRound,
} from "./index";

describe("tutorial session contract", () => {
  it("starts from a fixed seed without hiding any board", () => {
    const first = startTutorialSession();
    const second = startTutorialSession();

    expect(first).toEqual(second);
    expect(first.state.seed).toBe(TUTORIAL_SEED);
    expect(first.state.boards).toHaveLength(3);
    expect(first.tutorial).toMatchObject({
      status: "active",
      currentStep: "blackjack",
    });
  });

  it("advances its recommended focus as rounds progress without changing rules", () => {
    let session = startTutorialSession();
    for (let index = 0; index < 3; index += 1) {
      const next = endTurn(session);
      if (!next.ok) throw new Error("Expected tutorial turn to advance.");
      session = next.session;
    }

    expect(session.turn.round).toBe(4);
    expect(session.tutorial).toMatchObject({
      currentStep: "poker",
      completedSteps: ["blackjack"],
    });
    expect(tutorialStepForRound(10).id).toBe("rewards");
  });

  it("supports skip and completion without mutating its game state", () => {
    const session = startTutorialSession();
    const tutorial = session.tutorial;
    if (tutorial === null) throw new Error("Expected a tutorial state.");
    const skipped = skipTutorial(session);
    const completed = completeTutorial({
      ...session,
      tutorial: { ...tutorial, currentStep: "rewards" },
    });

    expect(skipped).toMatchObject({
      ok: true,
      session: { tutorial: { status: "skipped" }, state: session.state },
    });
    expect(completed).toMatchObject({
      ok: true,
      session: {
        tutorial: { status: "completed", completedSteps: ["rewards"] },
        state: session.state,
      },
    });
  });
});
