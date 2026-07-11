import type { BoardAnalysis, Command, CommandResult, GameSettlement, GameState, InkColor, PlayingCard } from '../domain';

export type HandCard =
  | { readonly id: string; readonly kind: 'number'; readonly card: PlayingCard; readonly ink: InkColor }
  | { readonly id: string; readonly kind: 'ink'; readonly ink: InkColor }
  | { readonly id: string; readonly kind: 'wildcard' };

export interface TurnState {
  readonly round: number;
  readonly actionsRemaining: number;
  readonly hand: readonly HandCard[];
  readonly usedCardIds: readonly string[];
}

export interface Selection {
  readonly cardId: string;
  readonly mode: 'face' | 'back';
  readonly wildcardInk: InkColor | null;
}

export interface Preview {
  readonly sourceState: GameState;
  readonly cardId: string;
  readonly command: Command;
  readonly result: CommandResult;
  readonly before: BoardAnalysis;
  readonly after: BoardAnalysis;
  readonly risks: readonly PreviewRisk[];
}

export type PreviewRisk = 'locked' | 'singleton' | 'overloaded' | 'bust' | 'breaks-valid-group';
export type SessionStatus = 'playing' | 'settled';

export interface GameSession {
  readonly state: GameState;
  readonly turn: TurnState;
  readonly status: SessionStatus;
  readonly selection: Selection | null;
  readonly preview: Preview | null;
  readonly settlement: GameSettlement | null;
}

export type SessionResult =
  | { readonly ok: true; readonly session: GameSession }
  | { readonly ok: false; readonly session: GameSession; readonly reason: string };
