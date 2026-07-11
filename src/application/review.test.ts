import { describe, expect, it } from "vitest";
import { reviewSession, settleSession, startSession } from "./index";

describe("session review", () => {
  it("derives replay-safe review data without changing a session", () => {
    const session = settleSession(startSession(17));
    const review = reviewSession(session);

    expect(review).toMatchObject({ seed: 17, completedBoards: 0, rating: session.settlement?.rating, total: session.settlement?.total });
    expect(session.status).toBe("settled");
  });
});
