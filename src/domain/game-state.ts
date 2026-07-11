import { RULESET_V1, type Ruleset } from './ruleset';
import { createSeededRng, type SeededRng } from './rng';
import { createBoardId, createCell, createCellId, createPosition, type Board, type BoardKind } from './types';

export interface GameState {
  readonly schemaVersion: 1;
  readonly seed: number;
  readonly rng: SeededRng;
  readonly ruleset: Ruleset;
  readonly boards: readonly Board[];
}

export const createGameState = (seed: number, ruleset: Ruleset = RULESET_V1): GameState => {
  if (!Number.isInteger(seed)) {
    throw new RangeError('Seed must be an integer.');
  }
  return {
    schemaVersion: 1,
    seed,
    rng: createSeededRng(seed),
    ruleset,
    boards: createBoards(ruleset.boardSize),
  };
};

function createBoards(size: number): readonly Board[] {
  return (['poker', 'blackjack', 'match'] as const).map((kind) => createBoard(kind, size));
}

function createBoard(kind: BoardKind, size: number): Board {
  return {
    id: createBoardId(kind),
    kind,
    size,
    cells: createCells(kind, size),
    locked: false,
  };
}

function createCells(kind: BoardKind, size: number): readonly ReturnType<typeof createCell>[] {
  return Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    return createCell(createCellId(`${kind}:${String(row)}:${String(column)}`), createPosition(row, column));
  });
}
