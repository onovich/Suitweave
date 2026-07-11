import { describe, expect, it } from 'vitest';
import { scoreBlackjackGroup, scoreMatchGroup, scorePokerGroup } from './scoring';
import type { PlayingCard, Rank, Suit } from './types';

describe('poker scoring table', () => {
  it.each([
    ['2 high', '2,7', 2], ['2 flush', '2h,7h', 3], ['2 straight', '2,3', 4], ['2 pair', '7,7', 10],
    ['3 high', '2,5,9', 4], ['3 pair', '7,7,2', 12], ['3 flush', '2h,5h,9h', 16], ['3 straight', '2,3,4', 18], ['3 trips', '7,7,7', 28], ['3 straight flush', '2h,3h,4h', 40],
    ['4 high', '2,5,8,K', 6], ['4 ace high is not a five-card straight', 'J,Q,K,A', 6], ['4 pair', '7,7,2,5', 14], ['4 two pair', '7,7,2,2', 24], ['4 flush', '2h,5h,8h,Kh', 26], ['4 straight', '2,3,4,5', 30], ['4 trips', '7,7,7,2', 32], ['4 quads', '7,7,7,7', 70], ['4 straight flush', '2h,3h,4h,5h', 75],
    ['5 high', '2,5,7,9,K', 8], ['5 pair', '7,7,2,5,9', 18], ['5 two pair', '7,7,2,2,9', 35], ['5 trips', '7,7,7,2,9', 50], ['5 straight', 'A,2,3,4,5', 70], ['5 flush', '2h,5h,7h,9h,Kh', 80], ['5 full house', '7,7,7,2,2', 110], ['5 quads', '7,7,7,7,2', 150], ['5 straight flush', '2h,3h,4h,5h,6h', 220], ['royal flush', '10h,Jh,Qh,Kh,Ah', 300],
  ])('%s', (_name, source, expected) => {
    expect(scorePokerGroup(cards(source)).score).toBe(expected);
  });
});

describe('blackjack scoring table', () => {
  it.each([
    ['base', '7,8', 15], ['19 bonus', '9,10', 25], ['20 bonus', '10,K', 30], ['21 bonus', '7,7,7', 46], ['blackjack', 'A,K', 60], ['five dragon', 'A,2,3,4,5', 30], ['five dragon at 21', 'A,2,3,4,A', 61],
  ])('%s', (_name, source, expected) => {
    expect(scoreBlackjackGroup(cards(source))).toMatchObject({ score: expected, valid: true });
  });

  it('makes bust and invalid-size groups ineligible', () => {
    expect(scoreBlackjackGroup(cards('K,Q,2'))).toMatchObject({ score: 0, valid: false, pattern: 'bust' });
    expect(scoreBlackjackGroup(cards('7'))).toMatchObject({ score: 0, valid: false, pattern: 'invalid-size' });
  });
});

describe('match scoring table', () => {
  it.each([
    ['2 mixed', '2,7', 2], ['2 straight', '2,3', 5], ['2 pair', '7,7', 8],
    ['3 mixed', '2,5,9', 5], ['3 flush', '2h,5h,9h', 15], ['3 straight', '2,3,4', 22], ['3 triple', '7,7,7', 28],
    ['4 mixed', '2,5,8,K', 8], ['4 two pair', '7,7,2,2', 24], ['4 triple', '7,7,7,2', 32], ['4 straight', '2,3,4,5', 36], ['4 four kind', '7,7,7,7', 70],
    ['5 mixed', '2,5,7,9,K', 10], ['5 triple', '7,7,7,2,9', 35], ['5 flush', '2h,5h,7h,9h,Kh', 45], ['5 full house', '7,7,7,2,2', 55], ['5 straight', 'A,2,3,4,5', 60], ['5 four kind', '7,7,7,7,2', 80], ['5 five kind', '7,7,7,7,7', 140],
  ])('%s', (_name, source, expected) => {
    expect(scoreMatchGroup(cards(source)).score).toBe(expected);
  });
});

function cards(source: string): readonly PlayingCard[] {
  return source.split(',').map((token, index) => card(token, index));
}

function card(token: string, index: number): PlayingCard {
  const rank = token.replace(/[shdc]$/, '') as Rank;
  const suitCode = /[shdc]$/.exec(token)?.[0];
  return { rank, ...(suitCode === undefined ? { suit: standardSuit(index) } : { suit: toSuit(suitCode) }) };
}

const suits: readonly Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
function standardSuit(index: number): Suit { return suits[index % suits.length] ?? 'spades'; }
function toSuit(value: string): Suit {
  if (value === 's') return 'spades';
  if (value === 'h') return 'hearts';
  if (value === 'd') return 'diamonds';
  if (value === 'c') return 'clubs';
  throw new RangeError(`Unsupported suit: ${value}`);
}
