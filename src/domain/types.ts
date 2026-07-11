export type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export type BoardId = Brand<string, 'BoardId'>;
export type CellId = Brand<string, 'CellId'>;
export type Score = Brand<number, 'Score'>;

export type BoardKind = 'poker' | 'blackjack' | 'match';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type InkColor = 'red' | 'blue' | 'green' | 'purple';
export type Marker = 'crown' | 'inspiration';

export interface Position {
  readonly row: number;
  readonly column: number;
}

export interface PlayingCard {
  readonly rank: Rank;
  readonly suit?: Suit;
}

export interface Cell {
  readonly id: CellId;
  readonly position: Position;
  readonly number?: PlayingCard;
  readonly ink?: InkColor;
  readonly markers: readonly Marker[];
}

export interface CellContents {
  readonly number?: PlayingCard;
  readonly ink?: InkColor;
  readonly markers?: readonly Marker[];
}

export interface Board {
  readonly id: BoardId;
  readonly kind: BoardKind;
  readonly size: number;
  readonly cells: readonly Cell[];
  readonly locked: boolean;
}

export const createBoardId = (value: string): BoardId => brandNonBlank(value, 'BoardId');
export const createCellId = (value: string): CellId => brandNonBlank(value, 'CellId');

export const createScore = (value: number): Score => {
  if (!Number.isFinite(value)) {
    throw new RangeError('Score must be finite.');
  }
  return value as Score;
};

export const createPosition = (row: number, column: number): Position => {
  if (!Number.isInteger(row) || !Number.isInteger(column) || row < 0 || column < 0) {
    throw new RangeError('Position coordinates must be non-negative integers.');
  }
  return { row, column };
};

export const createCell = (id: CellId, position: Position, contents: CellContents = {}): Cell => ({
  id,
  position,
  ...(contents.number === undefined ? {} : { number: contents.number }),
  ...(contents.ink === undefined ? {} : { ink: contents.ink }),
  markers: [...(contents.markers ?? [])],
});

function brandNonBlank<Name extends string>(value: string, label: Name): Brand<string, Name> {
  if (value.trim().length === 0) {
    throw new RangeError(`${label} must not be blank.`);
  }
  return value as Brand<string, Name>;
}
