import { createScore } from "./types";
import { nextInt } from "./rng";
import type { GameState } from "./game-state";
import type { RewardOption, RewardTrigger } from "./types";
import type { Command, DomainEvent } from "./commands";

const FEATURE_KINDS = [
  "swap-ink",
  "swap-number",
  "rank-up",
  "rank-down",
  "reroll-number",
  "sever-ink",
] as const;
const SMALL_REWARDS = [
  "bonus-ink",
  "adjust-rank",
  "redraw-hand",
  "bonus-score",
] as const;

const RANKS = [
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
] as const;

export const executeRewardCommand = (
  state: GameState,
  command: Extract<
    Command,
    {
      readonly type:
        | "open-reward"
        | "select-reward-option"
        | "discard-reserve"
        | "adjust-reward-rank";
    }
  >,
): Readonly<{
  state: GameState;
  events: readonly DomainEvent[];
  reason?: string;
}> => {
  if (command.type === "open-reward") return openReward(state);
  if (command.type === "select-reward-option")
    return selectOption(state, command.optionId);
  if (command.type === "adjust-reward-rank")
    return adjustRewardRank(state, command);
  return discardReserve(state, command.cardId);
};

function openReward(
  state: GameState,
): Readonly<{
  state: GameState;
  events: readonly DomainEvent[];
  reason?: string;
}> {
  if (state.rewards.activeOffer !== null)
    return { state, events: [], reason: "A reward offer is already active." };
  const trigger = state.rewards.pendingRewards[0];
  if (trigger === undefined)
    return { state, events: [], reason: "No reward is pending." };
  const draw = nextInt(
    state.rng,
    trigger === "inspiration" ? SMALL_REWARDS.length : FEATURE_KINDS.length,
  );
  const options =
    trigger === "inspiration"
      ? smallOptions(draw.value)
      : featureOptions(draw.value, trigger);
  const offer = {
    trigger,
    choicesRemaining: trigger === "inspiration" ? 1 : 3,
    options,
  };
  return {
    state: {
      ...state,
      rng: draw.next,
      rewards: { ...state.rewards, activeOffer: offer },
    },
    events: [{ type: "reward-opened", reward: trigger }],
  };
}

function selectOption(
  state: GameState,
  optionId: string,
): Readonly<{
  state: GameState;
  events: readonly DomainEvent[];
  reason?: string;
}> {
  const offer = state.rewards.activeOffer;
  if (offer === null)
    return { state, events: [], reason: "No reward offer is active." };
  const option = offer.options.find((candidate) => candidate.id === optionId);
  if (option === undefined)
    return { state, events: [], reason: "Reward option is unavailable." };
  if (
    option.type === "feature" &&
    state.rewards.reserve.length >= state.ruleset.functionReserveLimit
  )
    return {
      state,
      events: [],
      reason: "Reserve is full; discard a feature card first.",
    };
  const rewards = applyOption(state, option);
  const remaining = offer.choicesRemaining - 1;
  const nextOffer =
    remaining === 0
      ? null
      : {
          ...offer,
          choicesRemaining: remaining,
          options: offer.options.filter(
            (candidate) => candidate.id !== optionId,
          ),
        };
  return {
    state: {
      ...state,
      rewards: {
        ...rewards,
        activeOffer: nextOffer,
        pendingRewards:
          remaining === 0
            ? rewards.pendingRewards.slice(1)
            : rewards.pendingRewards,
      },
    },
    events: [{ type: "reward-selected", optionId }],
  };
}

function discardReserve(
  state: GameState,
  cardId: string,
): Readonly<{
  state: GameState;
  events: readonly DomainEvent[];
  reason?: string;
}> {
  if (!state.rewards.reserve.some((card) => card.id === cardId))
    return { state, events: [], reason: "Reserve card is unavailable." };
  return {
    state: {
      ...state,
      rewards: {
        ...state.rewards,
        reserve: state.rewards.reserve.filter((card) => card.id !== cardId),
      },
    },
    events: [{ type: "reserve-card-discarded", cardId }],
  };
}

function adjustRewardRank(
  state: GameState,
  command: Extract<Command, { readonly type: "adjust-reward-rank" }>,
): Readonly<{
  state: GameState;
  events: readonly DomainEvent[];
  reason?: string;
}> {
  if (state.rewards.rankAdjustments <= 0)
    return {
      state,
      events: [],
      reason: "No rank adjustment reward is available.",
    };
  const board = state.boards.find(
    (candidate) => candidate.id === command.boardId,
  );
  const cell = board?.cells.find(
    (candidate) => candidate.id === command.cellId,
  );
  if (
    board === undefined ||
    cell === undefined ||
    board.locked ||
    cell.number === undefined
  )
    return {
      state,
      events: [],
      reason: "Rank adjustment requires one unlocked numbered cell.",
    };
  const rankIndex = RANKS.indexOf(cell.number.rank);
  const rank =
    RANKS[(rankIndex + command.amount + RANKS.length) % RANKS.length];
  if (rank === undefined)
    return { state, events: [], reason: "Rank adjustment failed." };
  const nextCell = { ...cell, number: { ...cell.number, rank } };
  return {
    state: {
      ...state,
      boards: state.boards.map((candidate) =>
        candidate.id === board.id
          ? {
              ...board,
              cells: board.cells.map((current) =>
                current.id === cell.id ? nextCell : current,
              ),
            }
          : candidate,
      ),
      rewards: {
        ...state.rewards,
        rankAdjustments: state.rewards.rankAdjustments - 1,
      },
    },
    events: [
      { type: "rank-adjustment-used", boardId: board.id, cellId: cell.id },
    ],
  };
}

function featureOptions(
  offset: number,
  trigger: RewardTrigger,
): readonly RewardOption[] {
  return FEATURE_KINDS.map((kind, index) => ({
    id: `${trigger}:feature:${kind}`,
    type: "feature",
    card: {
      id: `${trigger}:feature:${kind}`,
      kind,
      rarity: index < 4 ? "common" : "rare",
    },
  }));
}

function smallOptions(offset: number): readonly RewardOption[] {
  return SMALL_REWARDS.slice(offset)
    .concat(SMALL_REWARDS.slice(0, offset))
    .slice(0, 3)
    .map((reward) => ({
      id: `inspiration:small:${reward}`,
      type: "small",
      reward,
    }));
}

function applyOption(state: GameState, option: RewardOption) {
  if (option.type === "feature")
    return {
      ...state.rewards,
      reserve: [...state.rewards.reserve, option.card],
    };
  if (option.reward === "bonus-ink")
    return { ...state.rewards, bonusInk: state.ruleset.inkColors[0] ?? null };
  if (option.reward === "adjust-rank")
    return {
      ...state.rewards,
      rankAdjustments: state.rewards.rankAdjustments + 1,
    };
  if (option.reward === "redraw-hand")
    return { ...state.rewards, redraws: state.rewards.redraws + 1 };
  return {
    ...state.rewards,
    bonusScore: createScore(state.rewards.bonusScore + 25),
  };
}
