import { createScore, type PlayingCard, type Score } from './types';

export interface GroupScore {
  readonly score: Score;
  readonly valid: boolean;
  readonly pattern: string;
}

export const scorePokerGroup = (cards: readonly PlayingCard[]): GroupScore => {
  if (!hasValidSize(cards)) return invalidSize();
  const ranks = rankSummary(cards);
  const flush = hasFlush(cards);
  const straight = hasStraight(cards);
  const count = cards.length;
  const score = count === 2 ? pokerTwo(ranks, flush, straight) : count === 3 ? pokerThree(ranks, flush, straight)
    : count === 4 ? pokerFour(ranks, flush, straight) : pokerFive(ranks, flush, straight);
  return valid(score);
};

export const scoreBlackjackGroup = (cards: readonly PlayingCard[]): GroupScore => {
  if (!hasValidSize(cards)) return invalidSize();
  const total = bestBlackjackTotal(cards);
  if (total === undefined) return invalid('bust');
  if (cards.length === 2 && total === 21) return valid(60);
  const bonus = total === 19 ? 6 : total === 20 ? 10 : total === 21 ? 25 : 0;
  const fiveDragon = cards.length === 5 ? 15 : 0;
  return valid(total + bonus + fiveDragon);
};

export const scoreMatchGroup = (cards: readonly PlayingCard[]): GroupScore => {
  if (!hasValidSize(cards)) return invalidSize();
  const ranks = rankSummary(cards);
  const straight = hasStraight(cards);
  const flush = hasFlush(cards);
  const score = cards.length === 2 ? matchTwo(ranks, straight) : cards.length === 3 ? matchThree(ranks, flush, straight)
    : cards.length === 4 ? matchFour(ranks, straight) : matchFive(ranks, flush, straight);
  return valid(score);
};

function pokerTwo(ranks: RankSummary, flush: boolean, straight: boolean): number {
  if (ranks.max === 2) return 10;
  if (straight) return 4;
  return flush ? 3 : 2;
}

function pokerThree(ranks: RankSummary, flush: boolean, straight: boolean): number {
  if (ranks.max === 3) return 28;
  if (straight && flush) return 40;
  if (straight) return 18;
  if (flush) return 16;
  return ranks.pairs === 1 ? 12 : 4;
}

function pokerFour(ranks: RankSummary, flush: boolean, straight: boolean): number {
  if (ranks.max === 4) return 70;
  if (straight && flush) return 75;
  if (ranks.max === 3) return 32;
  if (straight) return 30;
  if (flush) return 26;
  return ranks.pairs === 2 ? 24 : ranks.pairs === 1 ? 14 : 6;
}

function pokerFive(ranks: RankSummary, flush: boolean, straight: boolean): number {
  if (isRoyal(ranks, flush)) return 300;
  if (straight && flush) return 220;
  if (ranks.max === 4) return 150;
  if (ranks.max === 3 && ranks.pairs === 1) return 110;
  if (flush) return 80;
  if (straight) return 70;
  if (ranks.max === 3) return 50;
  return ranks.pairs === 2 ? 35 : ranks.pairs === 1 ? 18 : 8;
}

function matchTwo(ranks: RankSummary, straight: boolean): number {
  if (ranks.max === 2) return 8;
  return straight ? 5 : 2;
}

function matchThree(ranks: RankSummary, flush: boolean, straight: boolean): number {
  if (ranks.max === 3) return 28;
  if (straight) return 22;
  return flush ? 15 : 5;
}

function matchFour(ranks: RankSummary, straight: boolean): number {
  if (ranks.max === 4) return 70;
  if (straight) return 36;
  if (ranks.max === 3) return 32;
  return ranks.pairs === 2 ? 24 : 8;
}

function matchFive(ranks: RankSummary, flush: boolean, straight: boolean): number {
  if (ranks.max === 5) return 140;
  if (ranks.max === 4) return 80;
  if (straight) return 60;
  if (ranks.max === 3 && ranks.pairs === 1) return 55;
  if (flush) return 45;
  return ranks.max === 3 ? 35 : 10;
}

function bestBlackjackTotal(cards: readonly PlayingCard[]): number | undefined {
  const base = cards.reduce((total, card) => total + blackjackValue(card), 0);
  const aces = cards.filter((card) => card.rank === 'A').length;
  const totals = Array.from({ length: aces + 1 }, (_, highAces) => base + highAces * 10);
  return totals.filter((total) => total <= 21).sort((left, right) => right - left)[0];
}

function blackjackValue(card: PlayingCard): number {
  if (card.rank === 'A') return 1;
  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') return 10;
  return Number(card.rank);
}

function hasFlush(cards: readonly PlayingCard[]): boolean {
  const suit = cards[0]?.suit;
  return suit !== undefined && cards.every((card) => card.suit === suit);
}

function hasStraight(cards: readonly PlayingCard[]): boolean {
  const values = [...new Set(cards.map((card) => rankValue(card)))].sort((left, right) => left - right);
  if (values.length !== cards.length) return false;
  return isConsecutive(values) || (cards.length === 5 && values.includes(1) && isConsecutive(values.map((value) => value === 1 ? 14 : value)));
}

function isConsecutive(values: readonly number[]): boolean {
  return values.every((value, index) => index === 0 || value === (values[index - 1] ?? value) + 1);
}

function isRoyal(ranks: RankSummary, flush: boolean): boolean {
  return flush && ranks.values.length === 5 && ranks.values.join(',') === '1,10,11,12,13';
}

function rankValue(card: PlayingCard): number {
  return card.rank === 'A' ? 1 : card.rank === 'J' ? 11 : card.rank === 'Q' ? 12 : card.rank === 'K' ? 13 : Number(card.rank);
}

interface RankSummary { readonly values: readonly number[]; readonly max: number; readonly pairs: number; }

function rankSummary(cards: readonly PlayingCard[]): RankSummary {
  const counts = new Map<number, number>();
  cards.forEach((card) => counts.set(rankValue(card), (counts.get(rankValue(card)) ?? 0) + 1));
  const values = [...counts.keys()].sort((left, right) => left - right);
  const quantities = [...counts.values()];
  return { values, max: Math.max(...quantities), pairs: quantities.filter((count) => count === 2).length };
}

function hasValidSize(cards: readonly PlayingCard[]): boolean { return cards.length >= 2 && cards.length <= 5; }
function valid(score: number): GroupScore { return { score: createScore(score), valid: true, pattern: 'scored' }; }
function invalid(pattern: string): GroupScore { return { score: createScore(0), valid: false, pattern }; }
function invalidSize(): GroupScore { return invalid('invalid-size'); }
