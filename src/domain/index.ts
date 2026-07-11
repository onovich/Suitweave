export { createGameState, type GameState } from './game-state';
export { analyzeConnectivity, classifyNumberCount, type ConnectedGroup, type GroupClassification } from './connectivity';
export { RULESET_V1, type Ruleset } from './ruleset';
export {
  createBoardId,
  createCell,
  createCellId,
  createPosition,
  createScore,
  type Board,
  type BoardId,
  type BoardKind,
  type Cell,
  type CellContents,
  type CellId,
  type InkColor,
  type Marker,
  type PlayingCard,
  type Position,
  type Rank,
  type Score,
  type Suit,
} from './types';
export type { Command, DomainEvent, PlaceInkCommand, PlaceNumberCommand } from './commands';
