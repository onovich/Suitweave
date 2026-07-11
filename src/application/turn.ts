import { nextInt, nextRandom, type GameState, type InkColor, type Rank, type SeededRng, type Suit } from '../domain';
import type { HandCard } from './types';

const RANKS: readonly Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS: readonly Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export interface DrawnHand {
  readonly state: GameState;
  readonly hand: readonly HandCard[];
}

export const drawBasicHand = (state: GameState, round: number): DrawnHand => {
  let rng = state.rng;
  const hand: HandCard[] = [];
  for (let index = 0; index < state.ruleset.baseCardsDrawn; index += 1) {
    const drawn = drawCard(rng, `r${String(round)}-c${String(index + 1)}`, state.ruleset.inkColors);
    hand.push(drawn.card);
    rng = drawn.rng;
  }
  return { state: { ...state, rng }, hand };
};

function drawCard(rng: SeededRng, id: string, inks: readonly InkColor[]): Readonly<{ card: HandCard; rng: SeededRng }> {
  const type = nextRandom(rng);
  if (type.value < 0.55) return drawNumberCard(type.next, id, inks);
  if (type.value < 0.93) return drawInkCard(type.next, id, inks);
  return { card: { id, kind: 'wildcard' }, rng: type.next };
}

function drawNumberCard(rng: SeededRng, id: string, inks: readonly InkColor[]): Readonly<{ card: HandCard; rng: SeededRng }> {
  const rank = nextInt(rng, RANKS.length);
  const suit = nextInt(rank.next, SUITS.length);
  const ink = drawInk(suit.next, inks);
  return { card: { id, kind: 'number', card: { rank: pick(RANKS, rank.value), suit: pick(SUITS, suit.value) }, ink: ink.ink }, rng: ink.rng };
}

function drawInkCard(rng: SeededRng, id: string, inks: readonly InkColor[]): Readonly<{ card: HandCard; rng: SeededRng }> {
  const ink = drawInk(rng, inks);
  return { card: { id, kind: 'ink', ink: ink.ink }, rng: ink.rng };
}

function drawInk(rng: SeededRng, inks: readonly InkColor[]): Readonly<{ ink: InkColor; rng: SeededRng }> {
  const draw = nextInt(rng, inks.length);
  return { ink: pick(inks, draw.value), rng: draw.next };
}

function pick<Value>(values: readonly Value[], index: number): Value {
  const value = values[index];
  if (value === undefined) throw new RangeError('Random index is outside its collection.');
  return value;
}
