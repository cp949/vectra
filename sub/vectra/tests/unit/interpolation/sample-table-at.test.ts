/**
 * sampleTableAt unit test.
 *
 * 균등 parameter interval의 scalar sample 배열에서 t 위치 값을 반환하는 함수를 검증한다.
 * linear/nearest 보간, clamp/extrapolate 정책, 입력 검증을 모두 확인한다.
 */

import { describe, expect, test } from 'vitest';
import { sampleTableAt } from '../../../src/interpolation/sample-table-at';

const nonFiniteValues = [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe('sampleTableAt linear (기본값) — clamp', () => {
  test('[0, 10, 20], t=0.25이면 5를 반환한다', () => {
    expect(sampleTableAt([0, 10, 20], 0.25)).toBe(5);
  });

  test('[0, 10, 20], t=0이면 첫 sample 0을 반환한다', () => {
    expect(sampleTableAt([0, 10, 20], 0)).toBe(0);
  });

  test('[0, 10, 20], t=1이면 마지막 sample 20을 반환한다', () => {
    expect(sampleTableAt([0, 10, 20], 1)).toBe(20);
  });

  test('[0, 10, 20], t=0.5이면 중간 sample 10을 반환한다', () => {
    expect(sampleTableAt([0, 10, 20], 0.5)).toBe(10);
  });

  test('t < 0이면 첫 sample로 clamp된다', () => {
    expect(sampleTableAt([0, 10, 20], -0.5)).toBe(0);
    expect(sampleTableAt([0, 10, 20], -100)).toBe(0);
  });

  test('t > 1이면 마지막 sample로 clamp된다', () => {
    expect(sampleTableAt([0, 10, 20], 1.5)).toBe(20);
    expect(sampleTableAt([0, 10, 20], 100)).toBe(20);
  });

  test('interpolation: linear 명시 옵션도 동일하게 동작한다', () => {
    expect(sampleTableAt([0, 10, 20], 0.25, { interpolation: 'linear' })).toBe(5);
  });
});

describe('sampleTableAt linear — extrapolate', () => {
  test('[0, 10, 20], t=-0.5, extrapolate: true이면 -10을 반환한다', () => {
    // position = -0.5 * 2 = -1, lerpRaw(0, 10, -1) = 0 + (10 - 0) * -1 = -10
    expect(sampleTableAt([0, 10, 20], -0.5, { extrapolate: true })).toBe(-10);
  });

  test('[0, 10, 20], t=1.5, extrapolate: true이면 30을 반환한다', () => {
    // position = 1.5 * 2 = 3, localT = 3 - 1 = 2, lerpRaw(10, 20, 2) = 10 + 10 * 2 = 30
    expect(sampleTableAt([0, 10, 20], 1.5, { extrapolate: true })).toBe(30);
  });

  test('[0, 10], t=1.5, extrapolate: true이면 15를 반환한다', () => {
    // position = 1.5 * 1 = 1.5, localT = 1.5 - 0 = 1.5, lerpRaw(0, 10, 1.5) = 15
    expect(sampleTableAt([0, 10], 1.5, { extrapolate: true })).toBe(15);
  });

  test('[0, 10], t=-0.5, extrapolate: true이면 -5를 반환한다', () => {
    // position = -0.5, lerpRaw(0, 10, -0.5) = -5
    expect(sampleTableAt([0, 10], -0.5, { extrapolate: true })).toBe(-5);
  });

  test('t가 [0, 1] 안이면 extrapolate 여부와 무관하게 동일하다', () => {
    expect(sampleTableAt([0, 10, 20], 0.5, { extrapolate: true })).toBe(
      sampleTableAt([0, 10, 20], 0.5, { extrapolate: false })
    );
  });
});

describe('sampleTableAt nearest — clamp', () => {
  test('[0, 10, 20], t=0.24이면 0을 반환한다', () => {
    // position = 0.24 * 2 = 0.48, Math.round(0.48) = 0 → table[0] = 0
    expect(sampleTableAt([0, 10, 20], 0.24, { interpolation: 'nearest' })).toBe(0);
  });

  test('[0, 10, 20], t=0.25이면 10을 반환한다 (tie → 큰 index)', () => {
    // position = 0.25 * 2 = 0.5, Math.round(0.5) = 1 → table[1] = 10
    expect(sampleTableAt([0, 10, 20], 0.25, { interpolation: 'nearest' })).toBe(10);
  });

  test('[0, 10, 20], t=0.26이면 10을 반환한다', () => {
    // position = 0.26 * 2 = 0.52, Math.round(0.52) = 1 → table[1] = 10
    expect(sampleTableAt([0, 10, 20], 0.26, { interpolation: 'nearest' })).toBe(10);
  });

  test('[0, 10, 20], t=0.74이면 10을 반환한다', () => {
    // position = 0.74 * 2 = 1.48, Math.round(1.48) = 1 → table[1] = 10
    expect(sampleTableAt([0, 10, 20], 0.74, { interpolation: 'nearest' })).toBe(10);
  });

  test('[0, 10, 20], t=0.75이면 20을 반환한다 (tie → 큰 index)', () => {
    // position = 0.75 * 2 = 1.5, Math.round(1.5) = 2 → table[2] = 20
    expect(sampleTableAt([0, 10, 20], 0.75, { interpolation: 'nearest' })).toBe(20);
  });

  test('t < 0이면 첫 sample로 clamp된다', () => {
    expect(sampleTableAt([0, 10, 20], -1, { interpolation: 'nearest' })).toBe(0);
  });

  test('t > 1이면 마지막 sample로 clamp된다', () => {
    expect(sampleTableAt([0, 10, 20], 2, { interpolation: 'nearest' })).toBe(20);
  });
});

describe('sampleTableAt nearest — extrapolate', () => {
  test('[0, 10, 20], t=-0.5, nearest, extrapolate: true이면 -10을 반환한다 (외삽은 항상 linear)', () => {
    // out-of-range 외삽은 항상 linear
    expect(sampleTableAt([0, 10, 20], -0.5, { interpolation: 'nearest', extrapolate: true })).toBe(-10);
  });

  test('[0, 10, 20], t=1.5, nearest, extrapolate: true이면 30을 반환한다 (외삽은 항상 linear)', () => {
    expect(sampleTableAt([0, 10, 20], 1.5, { interpolation: 'nearest', extrapolate: true })).toBe(30);
  });
});

describe('sampleTableAt single sample', () => {
  test('[7], t=0이면 7을 반환한다', () => {
    expect(sampleTableAt([7], 0)).toBe(7);
  });

  test('[7], t=1이면 7을 반환한다', () => {
    expect(sampleTableAt([7], 1)).toBe(7);
  });

  test('[7], t=0.5이면 7을 반환한다', () => {
    expect(sampleTableAt([7], 0.5)).toBe(7);
  });

  test('[7], t=99, extrapolate: true이면 7을 반환한다', () => {
    expect(sampleTableAt([7], 99, { extrapolate: true })).toBe(7);
  });

  test('[7], t=-99, extrapolate: true이면 7을 반환한다', () => {
    expect(sampleTableAt([7], -99, { extrapolate: true })).toBe(7);
  });

  test('[7], interpolation: nearest, 임의 finite t이면 7을 반환한다', () => {
    expect(sampleTableAt([7], 0.3, { interpolation: 'nearest' })).toBe(7);
  });
});

describe('sampleTableAt 입력 검증 — invalid input', () => {
  test('빈 table이면 RangeError를 던진다', () => {
    expect(() => sampleTableAt([], 0.5)).toThrow(RangeError);
  });

  test.each(nonFiniteValues)('t가 finite하지 않은 %s이면 RangeError를 던진다', (value) => {
    expect(() => sampleTableAt([0, 10, 20], value)).toThrow(RangeError);
  });

  test('table 원소 중 NaN이 있으면 RangeError를 던진다', () => {
    expect(() => sampleTableAt([0, Number.NaN, 20], 0.5)).toThrow(RangeError);
  });

  test('table 원소 중 Infinity가 있으면 RangeError를 던진다', () => {
    expect(() => sampleTableAt([0, Number.POSITIVE_INFINITY, 20], 0.5)).toThrow(RangeError);
  });

  test('table 원소 중 -Infinity가 있으면 RangeError를 던진다', () => {
    expect(() => sampleTableAt([0, Number.NEGATIVE_INFINITY, 20], 0.5)).toThrow(RangeError);
  });

  test('unknown interpolation 값이면 RangeError를 던진다', () => {
    expect(() => sampleTableAt([0, 10, 20], 0.5, { interpolation: 'cubic' as 'linear' })).toThrow(RangeError);
  });

  test('single sample table에서 unknown interpolation 값이면 RangeError를 던진다', () => {
    expect(() => sampleTableAt([7], 0.5, { interpolation: 'step' as 'linear' })).toThrow(RangeError);
  });
});

describe('sampleTableAt 경계값 — 4개 이상 sample', () => {
  test('[0, 10, 20, 30], t=1/3이면 10을 반환한다', () => {
    // position = (1/3) * 3 = 1, table[1] = 10
    expect(sampleTableAt([0, 10, 20, 30], 1 / 3)).toBe(10);
  });

  test('[0, 10, 20, 30], t=2/3이면 20을 반환한다', () => {
    // position = (2/3) * 3 = 2, table[2] = 20
    expect(sampleTableAt([0, 10, 20, 30], 2 / 3)).toBe(20);
  });

  test('[0, 10, 20, 30], t=0.5이면 15를 반환한다', () => {
    // position = 0.5 * 3 = 1.5, lerpRaw(10, 20, 0.5) = 15
    expect(sampleTableAt([0, 10, 20, 30], 0.5)).toBe(15);
  });
});

describe('sampleTableAt barrel export', () => {
  test('domain barrel에서 sampleTableAt이 함수로 export된다', async () => {
    const barrel = await import('../../../src/interpolation/index');
    expect(typeof (barrel as Record<string, unknown>).sampleTableAt).toBe('function');
  });
});
