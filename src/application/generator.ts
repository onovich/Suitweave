import { createGameState, nextInt, nextRandom, type Board, type GameState, type PlayingCard, type Position, type Rank, type SeededRng, type Suit } from '../domain';

const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS: readonly Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export interface GeneratedGame {
  readonly state: GameState;
  readonly attempts: number;
}

export const generateStandardGame = (seed: number): GeneratedGame => {
  const initial = createGameState(seed);
  let rng = initial.rng;
  const boards: Board[] = [];
  for (const board of initial.boards) {
    const generated = generateBoard(board, initial.ruleset.initialNumbers.min, initial.ruleset.initialNumbers.max, rng);
    boards.push(generated.board);
    rng = generated.rng;
  }
  return { state: { ...initial, rng, boards }, attempts: 1 };
};

function generateBoard(board: Board, minimum: number, maximum: number, startingRng: SeededRng): Readonly<{ board: Board; rng: SeededRng }> {
  const countStep = nextInt(startingRng, maximum - minimum + 1);
  let selected: Position[] = [];
  let rng = countStep.next;
  for (const quadrant of [0, 1, 2, 3]) {
    ({ selected, rng } = addNumbers(selected, 2, board.size, rng, (position) => quadrantOf(position, board.size) === quadrant));
  }
  ({ selected, rng } = addNumbers(selected, minimum + countStep.value - selected.length, board.size, rng, () => true));
  const cells = board.cells.map((cell) => {
    if (!selected.some((position) => position.row === cell.position.row && position.column === cell.position.column)) return cell;
    const drawn = drawCard(rng);
    rng = drawn.rng;
    return { ...cell, number: drawn.card };
  });
  return { board: { ...board, cells }, rng };
}

function addNumbers(
  original: readonly Position[],
  count: number,
  size: number,
  startingRng: SeededRng,
  predicate: (position: Position) => boolean,
): Readonly<{ selected: Position[]; rng: SeededRng }> {
  const selected = [...original];
  let rng = startingRng;
  for (let index = 0; index < count; index += 1) {
    const candidates = positions(size).filter((position) => predicate(position) && canPlace(selected, position));
    if (candidates.length === 0) throw new Error('Generator could not satisfy board density constraints.');
    const draw = nextInt(rng, candidates.length);
    const candidate = candidates[draw.value];
    if (candidate === undefined) throw new Error('Generator selected a missing position.');
    selected.push(candidate);
    rng = draw.next;
  }
  return { selected, rng };
}

function drawCard(startingRng: SeededRng): Readonly<{ card: PlayingCard; rng: SeededRng }> {
  const rank = nextInt(startingRng, RANKS.length);
  const suitChance = nextRandom(rank.next);
  if (suitChance.value >= 0.8) return { card: { rank: pick(RANKS, rank.value) }, rng: suitChance.next };
  const suit = nextInt(suitChance.next, SUITS.length);
  return { card: { rank: pick(RANKS, rank.value), suit: pick(SUITS, suit.value) }, rng: suit.next };
}

function canPlace(selected: readonly Position[], position: Position): boolean {
  if (selected.some((other) => other.row === position.row && other.column === position.column)) return false;
  return !hasDenseSquare(selected, position);
}

function hasDenseSquare(selected: readonly Position[], position: Position): boolean {
  for (const row of [position.row - 1, position.row]) {
    for (const column of [position.column - 1, position.column]) {
      const count = selected.filter((other) => other.row >= row && other.row <= row + 1 && other.column >= column && other.column <= column + 1).length;
      if (count >= 3) return true;
    }
  }
  return false;
}

function positions(size: number): readonly Position[] {
  return Array.from({ length: size * size }, (_, index) => ({ row: Math.floor(index / size), column: index % size }));
}

function quadrantOf(position: Position, size: number): number {
  const bottom = position.row >= Math.floor(size / 2);
  const right = position.column >= Math.floor(size / 2);
  return (bottom ? 2 : 0) + (right ? 1 : 0);
}

function pick<Value>(values: readonly Value[], index: number): Value {
  const value = values[index];
  if (value === undefined) throw new RangeError('Random index is outside its collection.');
  return value;
}
