export function cross(A: string[], B: string[]): string[] {
  const b = B;
  return A.flatMap((a1) => b.map((b1) => a1 + b1));
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(Math.floor(Date.now() / 1000));

export function randInt(a: number) {
  return Math.floor(rand() * (a + 1));
}

export function shuffled<T>(A: T[]): T[] {
  const result = structuredClone(A);
  // Durstenfeld shuffle
  // eslint-disable-next-line for-direction
  for (let i = result.length - 1; i > 0; i--) {
    const j = randInt(i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function* range(start: number, stop?: number, step = 1) {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    yield i;
  }
}

export function difference<T>(A: Set<T>, B: Set<T>): Set<T> {
  const _difference = new Set(A);
  for (const elem of B) {
    _difference.delete(elem);
  }
  return _difference;
}

export function clamp<T extends number | string>(low: T, value: T, high: T) {
  if (low > value) {
    return low;
  } else if (value > high) {
    return high;
  } else {
    return value;
  }
}

export function popcnt(n: number): number {
  let count = 0;
  while (n !== 0) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

export function ctz32(integer: number): number {
  integer >>>= 0; // coerce to Uint32
  if (integer === 0) {
    // skipping this step would make it return -1
    return 32;
  }
  integer &= -integer; // equivalent to `int = int & (~int + 1)`
  return 31 - Math.clz32(integer);
}
