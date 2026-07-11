import type { BoardId, CellId, InkColor, PlayingCard } from './types';

export interface PlaceNumberCommand {
  readonly type: 'place-number';
  readonly boardId: BoardId;
  readonly cellId: CellId;
  readonly card: PlayingCard;
  readonly ink: InkColor;
}

export interface PlaceInkCommand {
  readonly type: 'place-ink';
  readonly boardId: BoardId;
  readonly cellId: CellId;
  readonly ink: InkColor;
}

export type Command = PlaceNumberCommand | PlaceInkCommand;

export type DomainEvent =
  | { readonly type: 'number-placed'; readonly boardId: BoardId; readonly cellId: CellId }
  | { readonly type: 'ink-placed'; readonly boardId: BoardId; readonly cellId: CellId }
  | { readonly type: 'command-rejected'; readonly command: Command; readonly reason: string };
