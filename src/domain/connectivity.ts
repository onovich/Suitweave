import type { Ruleset } from './ruleset';
import type { Board, Cell, InkColor, Position } from './types';

export type GroupClassification = 'empty' | 'single' | 'candidate' | 'overloaded';

export interface ConnectedGroup {
  readonly ink: InkColor;
  readonly cells: readonly Cell[];
  readonly numberCells: readonly Cell[];
  readonly classification: GroupClassification;
}

export const analyzeConnectivity = (board: Board, ruleset: Ruleset): readonly ConnectedGroup[] => {
  const cellsByPosition = new Map(board.cells.map((cell) => [positionKey(cell.position), cell]));
  const visited = new Set<string>();
  return board.cells.flatMap((cell) => {
    if (cell.ink === undefined || visited.has(cell.id)) {
      return [];
    }
    return [collectGroup(cell, cellsByPosition, visited, ruleset)];
  });
};

export const classifyNumberCount = (count: number, ruleset: Ruleset): GroupClassification => {
  if (count === 0) {
    return 'empty';
  }
  if (count < ruleset.validGroupNumbers.min) {
    return 'single';
  }
  return count > ruleset.validGroupNumbers.max ? 'overloaded' : 'candidate';
};

function collectGroup(
  start: Cell,
  cellsByPosition: ReadonlyMap<string, Cell>,
  visited: Set<string>,
  ruleset: Ruleset,
): ConnectedGroup {
  const ink = start.ink;
  if (ink === undefined) {
    throw new Error('Connectivity traversal requires an inked start cell.');
  }
  const cells = traverseSameInk(start, ink, cellsByPosition, visited);
  const numberCells = cells.filter((cell) => cell.number !== undefined);
  return { ink, cells, numberCells, classification: classifyNumberCount(numberCells.length, ruleset) };
}

function traverseSameInk(
  start: Cell,
  ink: InkColor,
  cellsByPosition: ReadonlyMap<string, Cell>,
  visited: Set<string>,
): readonly Cell[] {
  const queue = [start];
  const group: Cell[] = [];
  visited.add(start.id);
  for (const cell of queue) {
    group.push(cell);
    adjacentCells(cell.position, cellsByPosition).forEach((neighbor) => {
      if (neighbor.ink === ink && !visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    });
  }
  return group;
}

function adjacentCells(position: Position, cellsByPosition: ReadonlyMap<string, Cell>): readonly Cell[] {
  return [
    [position.row - 1, position.column],
    [position.row + 1, position.column],
    [position.row, position.column - 1],
    [position.row, position.column + 1],
  ].flatMap(([row, column]) => {
    const cell = cellsByPosition.get(`${String(row)}:${String(column)}`);
    return cell === undefined ? [] : [cell];
  });
}

function positionKey(position: Position): string {
  return `${String(position.row)}:${String(position.column)}`;
}
