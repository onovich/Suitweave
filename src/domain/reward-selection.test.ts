import { describe, expect, it } from "vitest";
import {
  createBoardId,
  createCell,
  createCellId,
  createGameState,
  createPosition,
  executeCommand,
  type Board,
} from "./index";

describe("reward offers and reserve", () => {
  it("opens deterministic six-card high rewards and chooses three unique cards", () => {
    const state = {
      ...createGameState(7),
      rewards: {
        ...createGameState(7).rewards,
        pendingRewards: ["crown" as const],
      },
    };
    const opened = executeCommand(state, { type: "open-reward" });
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    const options = opened.state.rewards.activeOffer?.options ?? [];
    expect(options).toHaveLength(6);
    expect(new Set(options.map((option) => option.id)).size).toBe(6);
    let current = opened.state;
    for (const option of options.slice(0, 3)) {
      const result = executeCommand(current, {
        type: "select-reward-option",
        optionId: option.id,
      });
      if (!result.ok) throw new Error("Expected reward selection.");
      current = result.state;
    }
    expect(current.rewards.reserve).toHaveLength(3);
    expect(current.rewards.activeOffer).toBeNull();
    expect(current.rewards.pendingRewards).toEqual([]);
  });

  it("opens three small reward candidates and resolves after one selection", () => {
    const base = createGameState(8);
    const state = {
      ...base,
      rewards: { ...base.rewards, pendingRewards: ["inspiration" as const] },
    };
    const opened = executeCommand(state, { type: "open-reward" });
    if (!opened.ok) throw new Error("Expected inspiration offer.");
    const option = opened.state.rewards.activeOffer?.options[0];
    if (option === undefined) throw new Error("Expected small reward option.");
    const selected = executeCommand(opened.state, {
      type: "select-reward-option",
      optionId: option.id,
    });

    expect(selected).toMatchObject({
      ok: true,
      state: { rewards: { activeOffer: null, pendingRewards: [] } },
    });
  });

  it("consumes an earned rank adjustment against an unlocked numbered cell", () => {
    const base = createGameState(4);
    const board: Board = {
      id: createBoardId("poker"),
      kind: "poker",
      size: 7,
      locked: false,
      cells: [
        createCell(createCellId("cell"), createPosition(0, 0), {
          number: { rank: "K", suit: "spades" },
        }),
      ],
    };
    const state = {
      ...base,
      boards: [board, ...base.boards.slice(1)],
      rewards: { ...base.rewards, rankAdjustments: 1 },
    };
    const result = executeCommand(state, {
      type: "adjust-reward-rank",
      boardId: board.id,
      cellId: createCellId("cell"),
      amount: 1,
    });

    expect(result).toMatchObject({
      ok: true,
      state: { rewards: { rankAdjustments: 0 } },
    });
    if (!result.ok) return;
    expect(result.state.boards[0]?.cells[0]?.number?.rank).toBe("A");
  });
});
