import { describe, expect, it } from 'vitest';
import { createSeededRng, nextInt, nextRandom } from './rng';

describe('seeded RNG', () => {
  it('replays the same sequence for the same seed', () => {
    const values = take(20260711, 4);

    expect(values).toEqual(take(20260711, 4));
    expect(values).toEqual([0.218485, 0.681974, 0.838605, 0.45617]);
  });

  it('produces bounded integer draws without ambient randomness', () => {
    const draw = nextInt(createSeededRng(1), 6);

    expect(draw.value).toBeGreaterThanOrEqual(0);
    expect(draw.value).toBeLessThan(6);
    expect(() => nextInt(createSeededRng(1), 0)).toThrow('upperExclusive');
  });
});

function take(seed: number, count: number): readonly number[] {
  const values: number[] = [];
  let rng = createSeededRng(seed);
  for (let index = 0; index < count; index += 1) {
    const step = nextRandom(rng);
    values.push(Number(step.value.toFixed(6)));
    rng = step.next;
  }
  return values;
}
