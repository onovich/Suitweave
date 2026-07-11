import { describe, expect, it } from 'vitest';
import { analyzeConnectivity, classifyNumberCount } from './connectivity';
import { RULESET_V1 } from './ruleset';
import { createBoardId, createCell, createCellId, createPosition, type Board, type CellContents } from './types';

describe('connectivity', () => {
  it('uses four directions and allows ink-only cells to bridge numeric cells', () => {
    const board = fixtureBoard([
      cell(0, 0, { ink: 'red', number: seven }),
      cell(0, 1, { ink: 'red' }),
      cell(1, 1, { ink: 'red', number: eight }),
      cell(1, 0, { ink: 'blue', number: seven }),
    ]);

    const groups = analyzeConnectivity(board, RULESET_V1);

    expect(groups.map((group) => [group.ink, group.cells.length, group.numberCells.length, group.classification]))
      .toEqual([['red', 3, 2, 'candidate'], ['blue', 1, 1, 'single']]);
  });

  it('does not connect diagonal cells and is stable when cells are reordered', () => {
    const cells = [cell(0, 0, { ink: 'green', number: seven }), cell(1, 1, { ink: 'green', number: eight })];
    const ordered = analyzeConnectivity(fixtureBoard(cells), RULESET_V1);
    const reordered = analyzeConnectivity(fixtureBoard([...cells].reverse()), RULESET_V1);

    expect(ordered.map((group) => group.numberCells.length)).toEqual([1, 1]);
    expect(reordered.map((group) => group.numberCells.length)).toEqual([1, 1]);
  });

  it('classifies empty, single, candidate, and overloaded groups at exact boundaries', () => {
    expect([0, 1, 2, 5, 6].map((count) => classifyNumberCount(count, RULESET_V1)))
      .toEqual(['empty', 'single', 'candidate', 'candidate', 'overloaded']);
  });
});

const seven = { rank: '7', suit: 'spades' } as const;
const eight = { rank: '8', suit: 'hearts' } as const;

function cell(row: number, column: number, contents: CellContents) {
  return createCell(createCellId(`${String(row)}:${String(column)}`), createPosition(row, column), contents);
}

function fixtureBoard(cells: Board['cells']): Board {
  return { id: createBoardId('fixture'), kind: 'poker', size: 7, cells, locked: false };
}
