/**
 * internal hypot2 단위 테스트.
 *
 * `Math.hypot(x, y)` 대신 쓰는 Euclidean 길이의 정밀도와 특수값 동작을 고정한다.
 * - 제곱합이 overflow·underflow·0·NaN인 입력은 `Math.hypot`과 `Object.is` 수준으로 같다.
 * - 일반 입력은 참값 대비 1.25 ulp 이내다. `Math.hypot`과는 2 ulp 이내다.
 * - 참값은 double을 정수 mantissa와 지수로 분해해 BigInt 정수 제곱근으로 구한다.
 */

import { describe, expect, test } from 'vitest';
import { hypot2 } from '../../../src/internal/numeric';
import { createRng } from '../../../src/random/create-rng';

/** double을 `mantissa * 2^exponent`로 정확히 분해한다. 0과 subnormal도 다룬다. */
function decompose(value: number): [bigint, number] {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, Math.abs(value));
  const hi = view.getUint32(0);
  const lo = view.getUint32(4);
  const biased = (hi >>> 20) & 0x7ff;
  let mantissa = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  if (biased === 0) return [mantissa, -1074];
  mantissa |= 1n << 52n;
  return [mantissa, biased - 1075];
}

/** n 이하인 가장 큰 정수 제곱근. */
function integerSqrt(n: bigint): bigint {
  if (n < 2n) return n;
  let x = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  for (;;) {
    const next = (x + n / x) >> 1n;
    if (next >= x) return x;
    x = next;
  }
}

/** result와 참값 hypot(x, y)의 차이를 result의 ulp 단위로 반환한다. result는 normal 양수여야 한다. */
function ulpError(x: number, y: number, result: number): number {
  const [mx, ex] = decompose(x);
  const [my, ey] = decompose(y);
  const e = Math.min(ex, ey);
  // x² + y² = sum * 2^(2e)
  const sum = ((mx * mx) << BigInt(2 * (ex - e))) + ((my * my) << BigInt(2 * (ey - e)));
  const precisionBits = 240n;
  // 참값 ≈ root * 2^(e - precisionBits / 2)
  const root = integerSqrt(sum << precisionBits);
  const [mr, er] = decompose(result);
  const shift = BigInt(er) - (BigInt(e) - precisionBits / 2n);
  const diff = (mr << shift) - root;
  return Number(diff) / Number(1n << shift);
}

/** result와 Math.hypot(x, y)의 차이를 ulp 개수로 반환한다. */
function ulpDistanceFromMathHypot(x: number, y: number, result: number): number {
  const expected = Math.hypot(x, y);
  const [me, ee] = decompose(expected);
  const [mr, er] = decompose(result);
  expect(er).toBeGreaterThanOrEqual(ee - 1);
  // 지수가 다르면 같은 지수로 맞춘다
  const e = Math.min(ee, er);
  return Math.abs(Number((mr << BigInt(er - e)) - (me << BigInt(ee - e))));
}

describe('internal hypot2', () => {
  test('Pythagorean triple은 정확한 정수를 반환한다', () => {
    expect(hypot2(3, 4)).toBe(5);
    expect(hypot2(-5, 12)).toBe(13);
    expect(hypot2(8, -15)).toBe(17);
    expect(hypot2(0, 7)).toBe(7);
  });

  test('제곱합이 0, overflow, underflow, NaN인 입력은 Math.hypot과 같다', () => {
    const special = [
      [0, 0],
      [-0, -0],
      [0, -0],
      [1e308, 1e308],
      [-1e300, 1e200],
      [1e-200, 1e-200],
      [5e-324, 0],
      [5e-324, -5e-324],
      [Number.MAX_VALUE, Number.MAX_VALUE],
      [Infinity, NaN],
      [NaN, -Infinity],
      [Infinity, 1],
      [-Infinity, -Infinity],
      [NaN, 1],
      [NaN, NaN],
    ];

    for (const [x, y] of special) {
      expect(Object.is(hypot2(x, y), Math.hypot(x, y)), `${x}, ${y}`).toBe(true);
    }
  });

  test('큰 finite 좌표에서 overflow 없이 finite 길이를 반환한다', () => {
    expect(hypot2(1e154, 1e154)).toBe(Math.hypot(1e154, 1e154));
    expect(Number.isFinite(hypot2(1.5e154, 1.5e154))).toBe(true);
  });

  test('무작위 입력 3만 건이 참값 대비 1.25 ulp, Math.hypot 대비 2 ulp 이내다', () => {
    const rng = createRng(20261128);
    const generators = [
      () => rng() * 200 - 100,
      () => (rng() - 0.5) * 10 ** Math.floor(rng() * 40 - 20),
      () => (rng() - 0.5) * 2 ** Math.floor(rng() * 1000 - 500),
    ];
    let maxTrueError = 0;
    let maxHypotDistance = 0;

    for (let i = 0; i < 30000; i++) {
      const generate = generators[i % generators.length]!;
      const x = generate();
      const y = generate();
      const result = hypot2(x, y);
      if (result === 0) continue;
      maxTrueError = Math.max(maxTrueError, Math.abs(ulpError(x, y, result)));
      maxHypotDistance = Math.max(maxHypotDistance, ulpDistanceFromMathHypot(x, y, result));
    }

    expect(maxTrueError).toBeLessThanOrEqual(1.25);
    expect(maxHypotDistance).toBeLessThanOrEqual(2);
  });
});
