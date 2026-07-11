import { analyzeBoard, type Suit } from '../domain';
import type { GameSession } from './types';

export interface BoardViewModel {
  readonly id: GameSession['state']['boards'][number]['id'];
  readonly kind: GameSession['state']['boards'][number]['kind'];
  readonly title: string;
  readonly score: number;
  readonly invalidNumberCount: number;
  readonly canSubmit: boolean;
  readonly locked: boolean;
  readonly cells: readonly CellViewModel[];
}

export interface CellViewModel {
  readonly id: GameSession['state']['boards'][number]['cells'][number]['id'];
  readonly label: string;
  readonly ink: string | null;
  readonly locked: boolean;
}

export const sessionViewModel = (session: GameSession): readonly BoardViewModel[] => session.state.boards.map((board) => {
  const analysis = analyzeBoard(board, session.state.ruleset);
  return {
    id: board.id, kind: board.kind, title: boardTitle(board.kind), score: analysis.score,
    invalidNumberCount: analysis.invalidNumberCount, canSubmit: analysis.canSubmit, locked: board.locked,
    cells: board.cells.map((cell) => ({ id: cell.id, label: cell.number === undefined ? '' : `${cell.number.rank}${suitSymbol(cell.number.suit)}`, ink: cell.ink ?? null, locked: board.locked })),
  };
});

function boardTitle(kind: BoardViewModel['kind']): string {
  return kind === 'poker' ? '德扑盘' : kind === 'blackjack' ? '21 点盘' : '三消盘';
}

function suitSymbol(suit: Suit | undefined): string {
  return suit === 'spades' ? '♠' : suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : suit === 'clubs' ? '♣' : '';
}
