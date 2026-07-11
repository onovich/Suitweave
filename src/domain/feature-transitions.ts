import { nextInt } from "./rng";
import type { Command, DomainEvent, FeatureTarget } from "./commands";
import type { Board, Cell, GameState, Rank, Suit } from "./index";

const RANKS: readonly Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const SUITS: readonly Suit[] = ["spades", "hearts", "diamonds", "clubs"];

export const executeFeature = (
  state: GameState,
  command: Extract<
    Command,
    { readonly type: "use-feature" | "select-reroll-option" }
  >,
): Readonly<{
  state: GameState;
  events: readonly DomainEvent[];
  reason?: string;
}> => {
  if (command.type === "select-reroll-option")
    return selectRerollOption(state, command.candidateIndex);
  if (state.rewards.activeReroll !== null)
    return fail(
      state,
      "Choose a reroll candidate before using another feature.",
    );
  const card = state.rewards.reserve.find(
    (candidate) => candidate.id === command.cardId,
  );
  if (card === undefined) return fail(state, "Feature card is unavailable.");
  const targets = resolveTargets(state, command.targets);
  if (typeof targets === "string") return fail(state, targets);
  const result =
    card.kind === "swap-ink"
      ? swapInk(state, targets)
      : card.kind === "swap-number"
        ? swapNumber(state, targets)
        : card.kind === "rank-up"
          ? adjustRank(state, targets, 1)
          : card.kind === "rank-down"
            ? adjustRank(state, targets, -1)
            : card.kind === "reroll-number"
              ? offerReroll(state, card.id, targets)
              : severInk(state, targets);
  if (typeof result === "string") return fail(state, result);
  if (card.kind === "reroll-number")
    return {
      state: result,
      events: [{ type: "reroll-offered", cardId: card.id }],
    };
  return {
    state: {
      ...result,
      rewards: {
        ...result.rewards,
        reserve: result.rewards.reserve.filter(
          (candidate) => candidate.id !== card.id,
        ),
      },
    },
    events: [{ type: "feature-used", cardId: card.id }],
  };
};

function resolveTargets(
  state: GameState,
  targets: readonly FeatureTarget[],
): readonly Readonly<{ board: Board; cell: Cell }>[] | string {
  if (targets.length === 0 || targets.length > 2)
    return "Feature target count is invalid.";
  const resolved = targets.map((target) => {
    const board = state.boards.find(
      (candidate) => candidate.id === target.boardId,
    );
    const cell = board?.cells.find(
      (candidate) => candidate.id === target.cellId,
    );
    return board === undefined || cell === undefined
      ? undefined
      : { board, cell };
  });
  if (resolved.some((target) => target === undefined || target.board.locked))
    return "Feature target is unavailable or locked.";
  return resolved.filter(
    (target): target is Readonly<{ board: Board; cell: Cell }> =>
      target !== undefined,
  );
}

function swapInk(
  state: GameState,
  targets: readonly Readonly<{ board: Board; cell: Cell }>[],
): GameState | string {
  if (targets.length !== 2) return "Swap ink requires two targets.";
  return replaceCells(
    state,
    targets.map((target, index) => ({
      ...target,
      next: withInk(target.cell, targets[index === 0 ? 1 : 0]?.cell.ink),
    })),
  );
}

function swapNumber(
  state: GameState,
  targets: readonly Readonly<{ board: Board; cell: Cell }>[],
): GameState | string {
  if (
    targets.length !== 2 ||
    targets.some((target) => target.cell.number === undefined)
  )
    return "Swap number requires two numbered targets.";
  return replaceCells(
    state,
    targets.map((target, index) => ({
      ...target,
      next: withNumber(target.cell, targets[index === 0 ? 1 : 0]?.cell.number),
    })),
  );
}

function adjustRank(
  state: GameState,
  targets: readonly Readonly<{ board: Board; cell: Cell }>[],
  amount: number,
): GameState | string {
  if (targets.length !== 1)
    return "Rank adjustment requires one numbered target.";
  const target = targets[0];
  if (target?.cell.number === undefined)
    return "Rank adjustment requires one numbered target.";
  const number = target.cell.number;
  return replaceCells(state, [
    {
      ...target,
      next: withNumber(target.cell, {
        ...number,
        rank: shiftedRank(number.rank, amount),
      }),
    },
  ]);
}

function offerReroll(
  state: GameState,
  cardId: string,
  targets: readonly Readonly<{ board: Board; cell: Cell }>[],
): GameState | string {
  if (targets.length !== 1) return "Reroll requires one numbered target.";
  const target = targets[0];
  if (target?.cell.number === undefined)
    return "Reroll requires one numbered target.";
  let rng = state.rng;
  const candidates = Array.from({ length: 3 }, () => {
    const rank = nextInt(rng, RANKS.length);
    const suit = nextInt(rank.next, SUITS.length);
    rng = suit.next;
    return { rank: pick(RANKS, rank.value), suit: pick(SUITS, suit.value) };
  });
  return {
    ...state,
    rng,
    rewards: {
      ...state.rewards,
      activeReroll: {
        cardId,
        boardId: target.board.id,
        cellId: target.cell.id,
        candidates,
      },
    },
  };
}

function selectRerollOption(
  state: GameState,
  candidateIndex: number,
): Readonly<{
  state: GameState;
  events: readonly DomainEvent[];
  reason?: string;
}> {
  const offer = state.rewards.activeReroll;
  const candidate = offer?.candidates[candidateIndex];
  if (offer === null || candidate === undefined)
    return fail(state, "Reroll candidate is unavailable.");
  const board = state.boards.find((current) => current.id === offer.boardId);
  const cell = board?.cells.find((current) => current.id === offer.cellId);
  if (board === undefined || board.locked || cell?.number === undefined)
    return fail(state, "Reroll target is unavailable.");
  const next = replaceCells(state, [
    { board, cell, next: withNumber(cell, candidate) },
  ]);
  return {
    state: {
      ...next,
      rewards: {
        ...next.rewards,
        activeReroll: null,
        reserve: next.rewards.reserve.filter(
          (card) => card.id !== offer.cardId,
        ),
      },
    },
    events: [
      { type: "reroll-selected", cardId: offer.cardId, candidateIndex },
      { type: "feature-used", cardId: offer.cardId },
    ],
  };
}

function severInk(
  state: GameState,
  targets: readonly Readonly<{ board: Board; cell: Cell }>[],
): GameState | string {
  return replaceCells(
    state,
    targets.map((target) => ({
      ...target,
      next: withInk(target.cell, undefined),
    })),
  );
}

function replaceCells(
  state: GameState,
  changes: readonly Readonly<{ board: Board; cell: Cell; next: Cell }>[],
): GameState {
  return {
    ...state,
    boards: state.boards.map((board) => ({
      ...board,
      cells: board.cells.map(
        (cell) =>
          changes.find(
            (change) =>
              change.board.id === board.id && change.cell.id === cell.id,
          )?.next ?? cell,
      ),
    })),
  };
}

function withInk(cell: Cell, ink: Cell["ink"]): Cell {
  return {
    id: cell.id,
    position: cell.position,
    markers: cell.markers,
    ...(cell.number === undefined ? {} : { number: cell.number }),
    ...(ink === undefined ? {} : { ink }),
  };
}
function withNumber(cell: Cell, number: Cell["number"]): Cell {
  return {
    id: cell.id,
    position: cell.position,
    markers: cell.markers,
    ...(number === undefined ? {} : { number }),
    ...(cell.ink === undefined ? {} : { ink: cell.ink }),
  };
}

function shiftedRank(rank: Rank, amount: number): Rank {
  return pick(
    RANKS,
    (RANKS.indexOf(rank) + amount + RANKS.length) % RANKS.length,
  );
}
function pick<Value>(values: readonly Value[], index: number): Value {
  const value = values[index];
  if (value === undefined)
    throw new RangeError("Feature RNG index is invalid.");
  return value;
}
function fail(
  state: GameState,
  reason: string,
): Readonly<{
  state: GameState;
  events: readonly DomainEvent[];
  reason: string;
}> {
  return { state, events: [], reason };
}
