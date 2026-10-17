/**
 * noise 값 clamp와 signed zero 마감 경계 테스트.
 *
 * 네 lattice corner의 gradient가 cell 중심을 정확히 가리키면 이론상 최대값 1을 부동소수점
 * 반올림이 넘긴다. `Math.cos`/`Math.sin`을 고정해 그 입력을 재현하고 `perlinNoise2Kernel`이
 * `[-1, 1]`로 clamp하는지 확인한다. fbm은 lattice 정수 좌표에서 0, ridged는 1을 돌려준다.
 */

import { afterEach, describe, expect, test, vi } from 'vitest';
import { fbm2 } from '../../../src/noise/fbm-2';
import { perlinNoise2Kernel } from '../../../src/noise/perlin.internal';
import { ridgedFbm2 } from '../../../src/noise/ridged-fbm-2';

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * 네 corner의 gradient가 cell 중심 `(0.5, 0.5)`를 향하도록 `Math.cos`/`Math.sin`을 고정한다.
 * 호출 순서는 `(0,0)`, `(1,0)`, `(0,1)`, `(1,1)` corner이고 `sign`이 -1이면 중심에서 멀어지는 방향이다.
 *
 * @param sign 1이면 중심을 향하고 -1이면 반대 방향이다.
 */
function alignGradientsToCellCenter(sign: 1 | -1): void {
  const a = sign * Math.SQRT1_2;
  const gradients = [
    [a, a],
    [-a, a],
    [a, -a],
    [-a, -a],
  ];
  let cosCalls = 0;
  let sinCalls = 0;
  vi.spyOn(Math, 'cos').mockImplementation(() => gradients[cosCalls++ % 4]?.[0] as number);
  vi.spyOn(Math, 'sin').mockImplementation(() => gradients[sinCalls++ % 4]?.[1] as number);
}

describe('perlinNoise2Kernel — 반올림이 경계를 넘는 경우', () => {
  test('gradient가 중심을 정확히 향하면 반올림 결과 1.0000000000000002를 1로 clamp한다', () => {
    alignGradientsToCellCenter(1);
    expect(perlinNoise2Kernel(0.5, 0.5, 0)).toBe(1);
  });

  test('gradient가 중심 반대를 정확히 향하면 -1로 clamp한다', () => {
    alignGradientsToCellCenter(-1);
    expect(perlinNoise2Kernel(0.5, 0.5, 0)).toBe(-1);
  });
});

describe('fbm — 경계값 마감', () => {
  test('fbm2는 lattice 정수 좌표에서 +0을 돌려준다', () => {
    expect(Object.is(fbm2(0, 0), 0)).toBe(true);
  });

  test('ridgedFbm2는 lattice 정수 좌표에서 1을 돌려준다', () => {
    expect(ridgedFbm2(0, 0)).toBe(1);
  });

  test('fbm2는 base noise가 -1이면 -1을 돌려준다', () => {
    alignGradientsToCellCenter(-1);
    expect(fbm2(0.5, 0.5, { octaves: 1 })).toBe(-1);
  });

  test('ridgedFbm2는 base noise의 절댓값이 1이면 -1을 돌려준다', () => {
    alignGradientsToCellCenter(1);
    expect(ridgedFbm2(0.5, 0.5, { octaves: 1 })).toBe(-1);
  });

  test('fbm2는 합성 결과가 -0으로 underflow하면 +0으로 정리한다', () => {
    // seed 1에서 첫 octave 값은 -5e-324이고 둘째 octave는 0이다. 합 -5e-324를 총 amplitude 2로 나누면
    // 정확히 중간값이라 round-to-even으로 -0이 된다.
    const value = fbm2(Number.MIN_VALUE, 0, { seed: 1, octaves: 2, gain: 1, lacunarity: 1e-300 });
    expect(Object.is(value, 0)).toBe(true);
  });
});
