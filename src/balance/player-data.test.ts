import { describe, expect, it } from "vitest";
import { validatePlayerObservations } from "./player-data";

describe("player data import", () => {
  const record = { participantId: "p-001", source: "real-player", taskVersion: "phase-5-v1", completedBoards: 2, crownTriggered: false, roundsPlayed: 18, minutesPlayed: 22 };
  it("accepts anonymous real-player observations", () => { expect(validatePlayerObservations([record])).toEqual([record]); });
  it("rejects synthetic labels, duplicate ids, and personal data", () => {
    expect(() => validatePlayerObservations([{ ...record, source: "synthetic" }])).toThrow();
    expect(() => validatePlayerObservations([record, record])).toThrow();
    expect(() => validatePlayerObservations([{ ...record, email: "person@example.test" }])).toThrow();
  });
});
