/**
 * statistics.median / quantile / percentile / mode — order statistics helper.
 *
 * 검증: median odd/even, quantile endpoints/midpoint/interpolation/single-entry, percentile wrapper,
 *   mode single/duplicate/tie-break, validation (non-array, empty, NaN/Infinity, invalid q/p),
 *   input non-mutation, signed-zero cleanup, negative/decimal entries.
 */

import { describe, expect, test } from 'vitest';
import { median } from '../../../src/statistics/median';
import { mode } from '../../../src/statistics/mode';
import { percentile } from '../../../src/statistics/percentile';
import { quantile } from '../../../src/statistics/quantile';

// ---------------------------------------------------------------------------
// median
// ---------------------------------------------------------------------------

describe('median — basic case', () => {
  test('홀수 length의 median은 가운데 entry', () => {
    expect(median([1, 2, 3])).toBe(2);
    expect(median([3, 1, 2])).toBe(2);
  });

  test('짝수 length의 median은 가운데 두 entry의 평균', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([4, 2, 1, 3])).toBe(2.5);
  });

  test('단일 entry의 median은 그 entry', () => {
    expect(median([42])).toBe(42);
  });

  test('length 2 boundary는 두 entry의 평균', () => {
    expect(median([1, 3])).toBe(2);
    expect(median([3, 1])).toBe(2);
  });

  test('음수와 소수가 섞인 median', () => {
    expect(median([-3, -1, 0, 1, 3])).toBe(0);
    expect(median([-1.5, 0.5, 2.5])).toBe(0.5);
  });

  test('duplicate entry가 있는 median', () => {
    expect(median([2, 2, 2, 2])).toBe(2);
    expect(median([1, 2, 2, 3])).toBe(2);
  });
});

describe('median — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => median([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => median(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => median(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => median('abc' as unknown as readonly number[])).toThrow(TypeError);
    expect(() => median({ length: 1 } as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => median([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => median([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => median([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('median — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    median(input);
    expect(input).toEqual(snapshot);
  });
});

describe('median — signed zero canonicalize', () => {
  test('odd length에서 -0은 +0으로 canonicalize', () => {
    const result = median([-0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('even length에서 두 zero의 평균이 +0으로 canonicalize', () => {
    const result = median([-0, -0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// quantile
// ---------------------------------------------------------------------------

describe('quantile — endpoints', () => {
  test('q === 0은 minimum', () => {
    expect(quantile([3, 1, 2], 0)).toBe(1);
    expect(quantile([-5, 0, 5], 0)).toBe(-5);
  });

  test('q === 1은 maximum', () => {
    expect(quantile([3, 1, 2], 1)).toBe(3);
    expect(quantile([-5, 0, 5], 1)).toBe(5);
  });

  test('q === 0.5는 median과 같다', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([1, 2, 3], 0.5)).toBe(2);
  });
});

describe('quantile — linear interpolation (type 7)', () => {
  test('정수 rank 위치는 interpolation 없음', () => {
    // n = 5, q = 0.25, pos = 1.0 → sorted[1] = 2
    expect(quantile([1, 2, 3, 4, 5], 0.25)).toBe(2);
    // n = 5, q = 0.75, pos = 3.0 → sorted[3] = 4
    expect(quantile([1, 2, 3, 4, 5], 0.75)).toBe(4);
  });

  test('non-integer rank는 linear interpolation', () => {
    // n = 4, q = 0.5, pos = 1.5 → sorted[1] + 0.5 * (sorted[2] - sorted[1]) = 2 + 0.5 * 1 = 2.5
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    // n = 4, q = 0.25, pos = 0.75 → 1 + 0.75 * 1 = 1.75
    expect(quantile([1, 2, 3, 4], 0.25)).toBe(1.75);
    // n = 4, q = 0.75, pos = 2.25 → 3 + 0.25 * 1 = 3.25
    expect(quantile([1, 2, 3, 4], 0.75)).toBe(3.25);
  });

  test('shuffled input도 sorted copy 기준으로 동작', () => {
    expect(quantile([4, 1, 3, 2], 0.5)).toBe(2.5);
    expect(quantile([4, 1, 3, 2], 0.25)).toBe(1.75);
  });

  test('단일 entry는 q와 무관하게 그 entry', () => {
    expect(quantile([7], 0)).toBe(7);
    expect(quantile([7], 0.5)).toBe(7);
    expect(quantile([7], 1)).toBe(7);
  });

  test('음수와 소수가 섞인 quantile', () => {
    // sorted: [-2, -1, 0, 1, 2], q = 0.5, pos = 2 → 0
    expect(quantile([-2, -1, 0, 1, 2], 0.5)).toBe(0);
    // n=5, q=0.25, pos=1 → -1
    expect(quantile([-2, -1, 0, 1, 2], 0.25)).toBe(-1);
  });
});

describe('quantile — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => quantile([], 0.5)).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => quantile(null as unknown as readonly number[], 0.5)).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => quantile([1, Number.NaN], 0.5)).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => quantile([1, Number.POSITIVE_INFINITY], 0.5)).toThrow(RangeError);
    expect(() => quantile([1, Number.NEGATIVE_INFINITY], 0.5)).toThrow(RangeError);
  });

  test('q가 0 미만이면 RangeError', () => {
    expect(() => quantile([1, 2], -0.1)).toThrow(RangeError);
  });

  test('q가 1 초과면 RangeError', () => {
    expect(() => quantile([1, 2], 1.1)).toThrow(RangeError);
  });

  test('q가 NaN이면 RangeError', () => {
    expect(() => quantile([1, 2], Number.NaN)).toThrow(RangeError);
  });

  test('q가 Infinity면 RangeError', () => {
    expect(() => quantile([1, 2], Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => quantile([1, 2], Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });
});

describe('quantile — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    quantile(input, 0.5);
    expect(input).toEqual(snapshot);
  });
});

describe('quantile — signed zero canonicalize', () => {
  test('interpolation 결과의 -0은 +0으로 canonicalize', () => {
    // 모든 entry가 -0인 입력. q = 0.5 → interpolation 결과 -0이 +0으로 canonicalize된다.
    const result = quantile([-0, -0], 0.5);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('단일 -0 entry는 +0으로 canonicalize', () => {
    const result = quantile([-0], 0);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

describe('quantile — arithmetic overflow', () => {
  test('interpolation 도중 결과가 non-finite면 RangeError', () => {
    // sorted[hi] - sorted[lo] = Number.MAX_VALUE - (-Number.MAX_VALUE) = Infinity → result Infinity.
    expect(() => quantile([-Number.MAX_VALUE, Number.MAX_VALUE], 0.5)).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// percentile
// ---------------------------------------------------------------------------

describe('percentile — quantile wrapper', () => {
  test('p === 0은 minimum', () => {
    expect(percentile([3, 1, 2], 0)).toBe(1);
  });

  test('p === 100은 maximum', () => {
    expect(percentile([3, 1, 2], 100)).toBe(3);
  });

  test('p === 50은 median', () => {
    expect(percentile([1, 2, 3, 4], 50)).toBe(2.5);
  });

  test('p === 25는 quantile(values, 0.25)와 같다', () => {
    expect(percentile([1, 2, 3, 4], 25)).toBe(quantile([1, 2, 3, 4], 0.25));
  });

  test('p === 75는 quantile(values, 0.75)와 같다', () => {
    expect(percentile([1, 2, 3, 4], 75)).toBe(quantile([1, 2, 3, 4], 0.75));
  });
});

describe('percentile — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => percentile([], 50)).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => percentile(null as unknown as readonly number[], 50)).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => percentile([1, Number.NaN], 50)).toThrow(RangeError);
  });

  test('+Infinity entry는 RangeError', () => {
    expect(() => percentile([1, Number.POSITIVE_INFINITY], 50)).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => percentile([1, Number.NEGATIVE_INFINITY], 50)).toThrow(RangeError);
  });

  test('p가 0 미만이면 RangeError', () => {
    expect(() => percentile([1, 2], -1)).toThrow(RangeError);
  });

  test('p가 100 초과면 RangeError', () => {
    expect(() => percentile([1, 2], 101)).toThrow(RangeError);
  });

  test('p가 NaN이면 RangeError', () => {
    expect(() => percentile([1, 2], Number.NaN)).toThrow(RangeError);
  });

  test('p가 Infinity면 RangeError', () => {
    expect(() => percentile([1, 2], Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => percentile([1, 2], Number.NEGATIVE_INFINITY)).toThrow(RangeError);
  });
});

describe('percentile — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    percentile(input, 50);
    expect(input).toEqual(snapshot);
  });
});

describe('percentile — signed zero canonicalize', () => {
  test('-0 결과는 +0으로 canonicalize', () => {
    const result = percentile([-0], 0);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// mode
// ---------------------------------------------------------------------------

describe('mode — basic case', () => {
  test('단일 entry는 그 entry', () => {
    expect(mode([42])).toBe(42);
  });

  test('명확한 최빈값', () => {
    expect(mode([1, 2, 2, 3])).toBe(2);
    expect(mode([5, 1, 5, 5, 2])).toBe(5);
  });

  test('모든 entry가 같으면 그 값', () => {
    expect(mode([7, 7, 7])).toBe(7);
  });

  test('음수가 섞인 mode', () => {
    expect(mode([-1, -1, 2, 3])).toBe(-1);
  });

  test('소수가 섞인 mode', () => {
    expect(mode([1.5, 2.5, 1.5])).toBe(1.5);
  });
});

describe('mode — tie-break', () => {
  test('빈도가 동률이면 sorted ascending에서 가장 작은 값', () => {
    // [1, 1, 2, 2] → counts: 1→2, 2→2 → tie → 더 작은 1
    expect(mode([1, 1, 2, 2])).toBe(1);
  });

  test('모든 entry가 유일하면 sorted ascending 최솟값', () => {
    // n=4, 각 entry frequency 1, tie → 최솟값
    expect(mode([3, 1, 4, 2])).toBe(1);
  });

  test('세 그룹 동률이면 최솟값', () => {
    expect(mode([3, 3, 1, 1, 2, 2])).toBe(1);
  });

  test('동률이 아닌 그룹이 더 작은 그룹보다 뒤에 있어도 최빈값을 반환', () => {
    // 1이 두 번, 2가 세 번 → 2가 최빈
    expect(mode([1, 1, 2, 2, 2])).toBe(2);
  });
});

describe('mode — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => mode([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => mode(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => mode('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => mode([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => mode([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => mode([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('mode — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3, 1];
    const snapshot = [...input];
    mode(input);
    expect(input).toEqual(snapshot);
  });
});

describe('mode — signed zero canonicalize', () => {
  test('-0이 최빈값이면 +0으로 canonicalize', () => {
    const result = mode([-0, -0, -0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('-0과 +0이 섞여 있어도 결과는 +0', () => {
    // -0 === 0이므로 같은 run으로 묶인다.
    const result = mode([-0, 0, -0, 1]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});
