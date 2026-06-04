import {
  assertDimension,
  assertIndexRangeInBounds,
  assertSequenceCount,
  commitSequence2DInto,
  resolveStartIndex,
} from './low-discrepancy.internal';
import type { HaltonSequenceOptions } from './types';

// base 진법으로 index를 펼친 뒤 소수점 아래로 뒤집는 radical inverse. index === 0이면 0이다.
const radicalInverse = (base: number, index: number): number => {
  let result = 0;
  let fraction = 1 / base;
  let remaining = index;
  while (remaining > 0) {
    result += (remaining % base) * fraction;
    remaining = Math.floor(remaining / base);
    fraction /= base;
  }
  return result;
};

// dimension 순서대로 앞에서부터 prime number를 생성한다.
const firstPrimes = (count: number): number[] => {
  const primes: number[] = [];
  let candidate = 2;
  while (primes.length < count) {
    let isPrime = true;
    for (let k = 0; k < primes.length; k++) {
      const prime = primes[k] as number;
      if (prime * prime > candidate) break;
      if (candidate % prime === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate++;
  }
  return primes;
};

// 기본 base는 prime sequence, custom base는 length/정수/중복을 검증해 dimension개만 사용한다.
const resolveBases = (dimension: number, bases: readonly number[] | undefined): number[] => {
  if (bases === undefined) return firstPrimes(dimension);

  if (bases.length < dimension) {
    throw new RangeError('bases length must be at least dimension');
  }

  const seen = new Set<number>();
  const resolved: number[] = [];
  for (let i = 0; i < dimension; i++) {
    const base = bases[i] as number;
    if (!Number.isSafeInteger(base) || base < 2) {
      throw new RangeError('each base must be a safe integer >= 2');
    }
    if (seen.has(base)) {
      throw new RangeError('bases must not contain duplicate values');
    }
    seen.add(base);
    resolved.push(base);
  }
  return resolved;
};

/**
 * Halton low-discrepancy sequence를 `out`에 기록한다.
 *
 * deterministic design sequence이며 `rng`를 소비하지 않는다. 각 row는 `dimension` 길이의 새 `number[]`이고
 * 각 entry는 `[0, 1)` 범위 finite number다. `sequence index = startIndex + rowIndex`의 radical inverse를
 * base별로 계산하며, `index === 0`은 모든 dimension에서 `0`이다.
 *
 * 기본 base는 dimension 순서대로의 prime number다. `options.bases`를 제공하면 앞에서부터 `dimension`개를
 * 사용한다. 모든 validation을 통과한 뒤에만 temp sequence를 만들어 단일 commit으로 `out`을 비우고 기록하므로,
 * validation 실패 시 `out`은 호출 전 상태를 유지한다. `-0`은 `0`으로 canonicalize한다.
 *
 * @param out 결과를 기록할 writable storage. 기존 내용은 제거된다.
 * @param count 생성할 point 개수. `0 <= count <= 0xffffffff` safe integer. `0`이면 빈 sequence.
 * @param dimension 각 point의 좌표 개수. positive safe integer.
 * @param options startIndex와 custom bases. `startIndex`는 `0 <= startIndex <= 0xffffffff` safe integer(기본 `0`). `bases`는 length가 `dimension` 이상이고 각 base는 safe integer `>= 2`이며 중복이 없어야 한다.
 * @throws {RangeError} count/dimension/startIndex가 범위를 벗어나거나, `startIndex + count - 1`이 `0xffffffff`를 넘거나, bases가 length/정수/중복 조건을 위반하면 던진다.
 */
export const haltonSequenceInto = <Out extends number[][]>(
  out: Out,
  count: number,
  dimension: number,
  options?: HaltonSequenceOptions
): Out => {
  assertSequenceCount(count);
  assertDimension(dimension);
  const startIndex = resolveStartIndex(options?.startIndex);
  assertIndexRangeInBounds(startIndex, count);
  const bases = resolveBases(dimension, options?.bases);

  const rows: number[][] = [];
  for (let row = 0; row < count; row++) {
    const index = startIndex + row;
    const point = new Array<number>(dimension);
    for (let d = 0; d < dimension; d++) {
      point[d] = radicalInverse(bases[d] as number, index);
    }
    rows.push(point);
  }

  return commitSequence2DInto(out, rows);
};
