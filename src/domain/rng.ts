export interface SeededRng {
  readonly state: number;
}

export interface RandomStep {
  readonly value: number;
  readonly next: SeededRng;
}

export const createSeededRng = (seed: number): SeededRng => {
  if (!Number.isInteger(seed)) {
    throw new RangeError('RNG seed must be an integer.');
  }
  return { state: seed >>> 0 };
};

export const nextRandom = (rng: SeededRng): RandomStep => {
  const state = (rng.state + 0x6d2b79f5) >>> 0;
  let mixed = state;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  return { value: ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296, next: { state } };
};

export const nextInt = (rng: SeededRng, upperExclusive: number): Readonly<{ value: number; next: SeededRng }> => {
  if (!Number.isInteger(upperExclusive) || upperExclusive <= 0) {
    throw new RangeError('upperExclusive must be a positive integer.');
  }
  const step = nextRandom(rng);
  return { value: Math.floor(step.value * upperExclusive), next: step.next };
};
