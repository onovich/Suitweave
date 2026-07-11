import { describe, expect, it } from 'vitest';
import { generateStandardGame } from './index';

describe('standard game generator', () => {
  it('replays a generated game exactly for the same seed', () => {
    expect(generateStandardGame(20260711)).toEqual(generateStandardGame(20260711));
  });

  it.each([1, 2, 3, 17, 42, 20260711])('keeps seed %i within standard board constraints', (seed) => {
    const game = generateStandardGame(seed);

    game.state.boards.forEach((board) => {
      const numbers = board.cells.filter((cell) => cell.number !== undefined);
      expect(numbers.length).toBeGreaterThanOrEqual(12);
      expect(numbers.length).toBeLessThanOrEqual(16);
      expect([0, 1, 2, 3].map((quadrant) => numbers.filter((cell) => quadrantOf(cell.position.row, cell.position.column, board.size) === quadrant).length))
        .toEqual(expect.arrayContaining([expect.any(Number), expect.any(Number), expect.any(Number), expect.any(Number)]));
      expect([0, 1, 2, 3].every((quadrant) => numbers.filter((cell) => quadrantOf(cell.position.row, cell.position.column, board.size) === quadrant).length >= 2)).toBe(true);
      expect(noDenseTwoByTwo(numbers.map((cell) => cell.position))).toBe(true);
    });
  });
});

function quadrantOf(row: number, column: number, size: number): number {
  return (row >= Math.floor(size / 2) ? 2 : 0) + (column >= Math.floor(size / 2) ? 1 : 0);
}

function noDenseTwoByTwo(positions: readonly Readonly<{ row: number; column: number }>[]): boolean {
  return positions.every((position) => [position.row - 1, position.row].every((row) => [position.column - 1, position.column]
    .every((column) => positions.filter((other) => other.row >= row && other.row <= row + 1 && other.column >= column && other.column <= column + 1).length <= 3)));
}
