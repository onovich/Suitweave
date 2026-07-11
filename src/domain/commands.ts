import type { BoardId, CellId, InkColor, PlayingCard, RewardTrigger } from './types';

export interface PlaceNumberFaceCommand {
  readonly type: 'place-card';
  readonly mode: 'number-face';
  readonly boardId: BoardId;
  readonly cellId: CellId;
  readonly card: PlayingCard;
  readonly ink: InkColor;
}

export interface PlaceNumberBackCommand {
  readonly type: 'place-card';
  readonly mode: 'number-back';
  readonly boardId: BoardId;
  readonly cellId: CellId;
  readonly ink: InkColor;
}

export interface PlaceInkCommand {
  readonly type: 'place-ink';
  readonly boardId: BoardId;
  readonly cellId: CellId;
  readonly ink: InkColor;
  readonly source: 'ink-card' | 'wildcard';
}

export interface SubmitBoardCommand {
  readonly type: 'submit-board';
  readonly boardId: BoardId;
}

export interface OpenRewardCommand { readonly type: 'open-reward'; }
export interface SelectRewardOptionCommand { readonly type: 'select-reward-option'; readonly optionId: string; }
export interface DiscardReserveCommand { readonly type: 'discard-reserve'; readonly cardId: string; }

export type PlacementCommand = PlaceNumberFaceCommand | PlaceNumberBackCommand | PlaceInkCommand;
export type Command = PlacementCommand | SubmitBoardCommand | OpenRewardCommand | SelectRewardOptionCommand | DiscardReserveCommand;

export type DomainEvent =
  | { readonly type: 'number-placed'; readonly boardId: BoardId; readonly cellId: CellId }
  | { readonly type: 'ink-placed'; readonly boardId: BoardId; readonly cellId: CellId }
  | { readonly type: 'board-submitted'; readonly boardId: BoardId }
  | { readonly type: 'crown-connected'; readonly boardId: BoardId }
  | { readonly type: 'marker-collected'; readonly boardId: BoardId; readonly cellId: CellId }
  | { readonly type: 'reward-queued'; readonly reward: RewardTrigger }
  | { readonly type: 'reward-opened'; readonly reward: RewardTrigger }
  | { readonly type: 'reward-selected'; readonly optionId: string }
  | { readonly type: 'reserve-card-discarded'; readonly cardId: string }
  | { readonly type: 'command-rejected'; readonly command: Command; readonly reason: string };
