import type { InkColor } from './types';

export interface Ruleset {
  readonly version: 1;
  readonly boardSize: number;
  readonly roundLimit: number;
  readonly baseCardsDrawn: number;
  readonly actionsPerRound: number;
  readonly inkColors: readonly InkColor[];
  readonly initialNumbers: Readonly<{ min: number; max: number }>;
  readonly validGroupNumbers: Readonly<{ min: number; max: number }>;
  readonly functionReserveLimit: number;
  readonly markerMeterThreshold: number;
  readonly bonuses: Readonly<{ boardComplete: number; crown: number; markerMeter: number }>;
  readonly penalties: Readonly<{ unconnectedNumber: number; invalidGroupNumber: number }>;
}

export const RULESET_V1: Ruleset = Object.freeze({
  version: 1,
  boardSize: 7,
  roundLimit: 24,
  baseCardsDrawn: 6,
  actionsPerRound: 3,
  inkColors: ['red', 'blue', 'green', 'purple'] as const,
  initialNumbers: Object.freeze({ min: 12, max: 16 }),
  validGroupNumbers: Object.freeze({ min: 2, max: 5 }),
  functionReserveLimit: 9,
  markerMeterThreshold: 3,
  bonuses: Object.freeze({ boardComplete: 80, crown: 100, markerMeter: 15 }),
  penalties: Object.freeze({ unconnectedNumber: -10, invalidGroupNumber: -8 }),
});
