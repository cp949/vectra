/**
 * statistics.mean / centerInto / center / variance / standardDeviation /
 *   standardizeInto / standardize — descriptive statistics helper.
 *
 * 검증: mean normal/negative/decimal, mean empty(RangeError), mean non-array(TypeError),
 *   mean NaN/Infinity/-Infinity entry(RangeError), mean sum overflow(RangeError),
 *   centerInto centered sum ~ 0, centerInto empty([]), centerInto signed-zero canonicalize,
 *   centerInto non-finite entry, centerInto arithmetic overflow, centerInto failure atomicity,
 *   centerInto out/values aliasing, center companion delegates and surfaces same errors,
 *   variance population/sample exact denominator, variance empty/sample n<2/invalid mode(RangeError),
 *   variance non-finite entry / sum overflow / squared delta overflow (RangeError),
 *   standardDeviation population/sample sqrt of variance and failure propagation,
 *   standardizeInto population z-score / sample z-score / empty([]) / zero stddev → zero vector,
 *   standardizeInto invalid mode fail-fast even with empty input,
 *   standardizeInto failure atomicity / out/values aliasing / z-score signed-zero canonicalize,
 *   standardize companion delegates.
 */

import { describe, expect, test } from 'vitest';
import { center } from '../../../src/statistics/center';
import { centerInto } from '../../../src/statistics/center-into';
import { mean } from '../../../src/statistics/mean';
import { standardDeviation } from '../../../src/statistics/standard-deviation';
import { standardize } from '../../../src/statistics/standardize';
import { standardizeInto } from '../../../src/statistics/standardize-into';
import { variance } from '../../../src/statistics/variance';

// ---------------------------------------------------------------------------
// mean
// ---------------------------------------------------------------------------

describe('mean — basic case', () => {
  test('정수 평균', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
  });

  test('음수와 소수가 섞인 평균', () => {
    expect(mean([-1.5, 0.5, 1.0])).toBe(0);
  });

  test('단일 entry 평균', () => {
    expect(mean([42])).toBe(42);
  });
});

describe('mean — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => mean([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => mean('abc' as unknown as readonly number[])).toThrow(TypeError);
    expect(() => mean(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => mean(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => mean({ length: 1 } as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => mean([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => mean([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => mean([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });

  test('sum overflow는 RangeError', () => {
    expect(() => mean([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// centerInto (Into)
// ---------------------------------------------------------------------------

describe('centerInto — basic case', () => {
  test('centered 결과 합계가 0', () => {
    const out: number[] = [];
    const result = centerInto(out, [1, 2, 3]);
    expect(result).toBe(out);
    expect(out).toEqual([-1, 0, 1]);
    const total = out.reduce((acc, v) => acc + v, 0);
    expect(total).toBe(0);
  });

  test('단일 entry는 [0]', () => {
    const out: number[] = [];
    const result = centerInto(out, [7]);
    expect(result).toBe(out);
    expect(out).toEqual([0]);
  });

  test('out 사전 length는 무시된다', () => {
    const out: number[] = [99, 88, 77, 66, 55];
    centerInto(out, [1, 2, 3]);
    expect(out).toEqual([-1, 0, 1]);
  });
});

describe('centerInto — empty', () => {
  test('빈 배열은 out length를 0으로 commit한다', () => {
    const out: number[] = [99, 88];
    const result = centerInto(out, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });
});

describe('centerInto — signed zero', () => {
  test('zero delta entry는 +0으로 canonicalize된다', () => {
    // mean([-0, 0]) = 0. delta0 = -0 - 0 = -0. canonicalize → +0.
    // delta1 = 0 - 0 = +0. 두 entry 모두 -0이 아닌 +0이어야 한다.
    const out: number[] = [];
    centerInto(out, [-0, 0]);
    expect(out).toHaveLength(2);
    expect(Object.is(out[0], 0)).toBe(true);
    expect(Object.is(out[0], -0)).toBe(false);
    expect(Object.is(out[1], 0)).toBe(true);
    expect(Object.is(out[1], -0)).toBe(false);
  });

  test('모든 entry가 -0이어도 결과는 모두 +0으로 canonicalize된다', () => {
    // mean([-0, -0]) = 0. delta = -0 - 0 = -0 for each entry → canonicalize → +0.
    const out: number[] = [];
    centerInto(out, [-0, -0]);
    expect(out).toHaveLength(2);
    expect(Object.is(out[0], 0)).toBe(true);
    expect(Object.is(out[0], -0)).toBe(false);
    expect(Object.is(out[1], 0)).toBe(true);
    expect(Object.is(out[1], -0)).toBe(false);
  });
});

describe('centerInto — invalid input', () => {
  test('non-array values는 TypeError', () => {
    const out: number[] = [];
    expect(() => centerInto(out, 'abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => centerInto([], [1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => centerInto([], [1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => centerInto([], [1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });

  test('sum overflow는 RangeError', () => {
    expect(() => centerInto([], [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });
});

describe('centerInto — failure atomicity', () => {
  test('비어 있지 않은 invalid input은 out을 호출 전 상태로 유지한다', () => {
    const out: number[] = [1, 2, 3];
    expect(() => centerInto(out, [1, Number.NaN])).toThrow(RangeError);
    expect(out).toEqual([1, 2, 3]);
  });

  test('sum overflow 실패 시 out 상태 유지', () => {
    const out: number[] = [9, 8, 7];
    expect(() => centerInto(out, [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
    expect(out).toEqual([9, 8, 7]);
  });

  test('non-array TypeError에서도 out 상태 유지', () => {
    const out: number[] = [5, 6];
    expect(() => centerInto(out, 42 as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([5, 6]);
  });
});

describe('centerInto — out/values aliasing', () => {
  test('같은 배열을 out과 values로 넘겨도 안전하다', () => {
    const arr: number[] = [1, 2, 3];
    const result = centerInto(arr, arr);
    expect(result).toBe(arr);
    expect(arr).toEqual([-1, 0, 1]);
  });

  test('빈 배열 aliasing도 안전하다', () => {
    const arr: number[] = [];
    const result = centerInto(arr, arr);
    expect(result).toBe(arr);
    expect(arr).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// center (companion)
// ---------------------------------------------------------------------------

describe('center — companion', () => {
  test('새 배열을 반환한다', () => {
    expect(center([1, 2, 3])).toEqual([-1, 0, 1]);
  });

  test('단일 entry는 [0]', () => {
    expect(center([42])).toEqual([0]);
  });

  test('빈 배열은 []', () => {
    expect(center([])).toEqual([]);
  });

  test('non-array values는 TypeError', () => {
    expect(() => center(null as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => center([1, Number.NaN])).toThrow(RangeError);
  });

  test('sum overflow는 RangeError', () => {
    expect(() => center([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// variance
// ---------------------------------------------------------------------------

describe('variance — population/sample denominator', () => {
  test('population denominator는 n', () => {
    // mean([2, 4]) = 3, squaredSum = 1 + 1 = 2, population variance = 2/2 = 1
    expect(variance([2, 4])).toBe(1);
    expect(variance([2, 4], { mode: 'population' })).toBe(1);
  });

  test('sample denominator는 n - 1', () => {
    // squaredSum = 2, sample variance = 2/1 = 2
    expect(variance([2, 4], { mode: 'sample' })).toBe(2);
  });

  test('default mode는 population', () => {
    expect(variance([1, 2, 3, 4])).toBe(1.25);
  });

  test('단일 entry population variance는 0', () => {
    expect(variance([42])).toBe(0);
  });

  test('동일 값들의 variance는 0', () => {
    expect(variance([5, 5, 5, 5])).toBe(0);
    expect(variance([5, 5, 5, 5], { mode: 'sample' })).toBe(0);
  });
});

describe('variance — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => variance([])).toThrow(RangeError);
    expect(() => variance([], { mode: 'sample' })).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => variance(null as unknown as readonly number[])).toThrow(TypeError);
  });

  test('sample mode에서 length < 2이면 RangeError', () => {
    expect(() => variance([42], { mode: 'sample' })).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => variance([1, 2], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('invalid mode는 빈 입력에서도 RangeError', () => {
    expect(() => variance([], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => variance([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => variance([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('sum overflow는 RangeError', () => {
    expect(() => variance([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });

  test('squared delta overflow는 RangeError', () => {
    // sum = 0 (finite), mean = 0, delta = ±MAX_VALUE (finite), squared = Infinity → fail
    expect(() => variance([Number.MAX_VALUE, -Number.MAX_VALUE])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// standardDeviation
// ---------------------------------------------------------------------------

describe('standardDeviation — population/sample', () => {
  test('population stddev', () => {
    // population variance([2, 4]) = 1, sqrt = 1
    expect(standardDeviation([2, 4])).toBe(1);
    expect(standardDeviation([2, 4], { mode: 'population' })).toBe(1);
  });

  test('sample stddev', () => {
    // sample variance([2, 4]) = 2, sqrt = sqrt(2)
    expect(standardDeviation([2, 4], { mode: 'sample' })).toBe(Math.sqrt(2));
  });

  test('동일 값 stddev는 0', () => {
    expect(standardDeviation([3, 3, 3])).toBe(0);
  });

  test('단일 entry population stddev는 0', () => {
    expect(standardDeviation([7])).toBe(0);
  });
});

describe('standardDeviation — variance 실패 전파', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => standardDeviation([])).toThrow(RangeError);
  });

  test('sample n<2는 RangeError', () => {
    expect(() => standardDeviation([42], { mode: 'sample' })).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => standardDeviation([1, 2], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => standardDeviation([1, Number.NaN])).toThrow(RangeError);
  });

  test('sum overflow는 RangeError', () => {
    expect(() => standardDeviation([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// standardizeInto (Into)
// ---------------------------------------------------------------------------

describe('standardizeInto — population z-score', () => {
  test('basic [2, 4]는 [-1, 1]', () => {
    const out: number[] = [];
    const result = standardizeInto(out, [2, 4]);
    expect(result).toBe(out);
    expect(out).toEqual([-1, 1]);
  });

  test('default mode는 population', () => {
    expect(standardizeInto([], [2, 4])).toEqual([-1, 1]);
  });

  test('대칭 분포는 합이 0', () => {
    const out = standardizeInto([], [-2, -1, 0, 1, 2]);
    expect(out).toHaveLength(5);
    const total = out.reduce((acc, v) => acc + v, 0);
    expect(Math.abs(total)).toBeLessThan(1e-12);
  });
});

describe('standardizeInto — sample z-score', () => {
  test('basic [2, 4] sample mode는 ±1/sqrt(2)', () => {
    const out = standardizeInto([], [2, 4], { mode: 'sample' });
    expect(out).toHaveLength(2);
    const expected = 1 / Math.sqrt(2);
    expect(out[0]).toBeCloseTo(-expected, 12);
    expect(out[1]).toBeCloseTo(expected, 12);
  });
});

describe('standardizeInto — empty', () => {
  test('빈 배열은 out length를 0으로 commit한다', () => {
    const out: number[] = [99, 88];
    const result = standardizeInto(out, []);
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test('valid mode + 빈 배열은 sample이어도 [] 반환', () => {
    // length 0 분기가 sample n<2 검증보다 먼저 실행된다.
    const out = standardizeInto([], [], { mode: 'sample' });
    expect(out).toEqual([]);
  });
});

describe('standardizeInto — zero standard deviation', () => {
  test('모든 entry가 같으면 zero vector를 반환한다 (population)', () => {
    const out = standardizeInto([], [5, 5, 5]);
    expect(out).toEqual([0, 0, 0]);
  });

  test('모든 entry가 같으면 zero vector를 반환한다 (sample)', () => {
    const out = standardizeInto([], [5, 5, 5], { mode: 'sample' });
    expect(out).toEqual([0, 0, 0]);
  });

  test('zero vector entry는 모두 +0이다', () => {
    const out = standardizeInto([], [-0, -0, -0]);
    expect(out).toHaveLength(3);
    expect(Object.is(out[0], 0)).toBe(true);
    expect(Object.is(out[0], -0)).toBe(false);
    expect(Object.is(out[1], -0)).toBe(false);
    expect(Object.is(out[2], -0)).toBe(false);
  });
});

describe('standardizeInto — invalid input fail-fast', () => {
  test('non-array values는 TypeError', () => {
    expect(() => standardizeInto([], null as unknown as readonly number[])).toThrow(TypeError);
  });

  test('invalid mode는 RangeError (빈 입력에서도 fail-fast)', () => {
    expect(() => standardizeInto([], [], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('invalid mode는 RangeError (정상 입력)', () => {
    expect(() => standardizeInto([], [1, 2], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('sample mode에서 length<2이면 RangeError', () => {
    expect(() => standardizeInto([], [42], { mode: 'sample' })).toThrow(RangeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => standardizeInto([], [1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => standardizeInto([], [1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('sum overflow는 RangeError', () => {
    expect(() => standardizeInto([], [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });

  test('squared delta overflow는 RangeError', () => {
    expect(() => standardizeInto([], [Number.MAX_VALUE, -Number.MAX_VALUE])).toThrow(RangeError);
  });
});

describe('standardizeInto — failure atomicity', () => {
  test('non-array TypeError에서도 out 상태 유지', () => {
    const out: number[] = [1, 2, 3];
    expect(() => standardizeInto(out, 'x' as unknown as readonly number[])).toThrow(TypeError);
    expect(out).toEqual([1, 2, 3]);
  });

  test('invalid mode에서 out 상태 유지 (빈 입력 호출 시)', () => {
    const out: number[] = [9, 8];
    expect(() => standardizeInto(out, [], { mode: 'bad' as never })).toThrow(RangeError);
    expect(out).toEqual([9, 8]);
  });

  test('sample n<2에서 out 상태 유지', () => {
    const out: number[] = [9, 8];
    expect(() => standardizeInto(out, [42], { mode: 'sample' })).toThrow(RangeError);
    expect(out).toEqual([9, 8]);
  });

  test('non-finite entry에서 out 상태 유지', () => {
    const out: number[] = [9, 8, 7];
    expect(() => standardizeInto(out, [1, Number.NaN])).toThrow(RangeError);
    expect(out).toEqual([9, 8, 7]);
  });

  test('squared delta overflow에서 out 상태 유지', () => {
    const out: number[] = [3, 2, 1];
    expect(() => standardizeInto(out, [Number.MAX_VALUE, -Number.MAX_VALUE])).toThrow(RangeError);
    expect(out).toEqual([3, 2, 1]);
  });
});

describe('standardizeInto — out/values aliasing', () => {
  test('같은 배열을 out과 values로 넘겨도 안전하다', () => {
    const arr: number[] = [2, 4];
    const result = standardizeInto(arr, arr);
    expect(result).toBe(arr);
    expect(arr).toEqual([-1, 1]);
  });

  test('aliasing + zero stddev', () => {
    const arr: number[] = [5, 5, 5];
    standardizeInto(arr, arr);
    expect(arr).toEqual([0, 0, 0]);
  });

  test('빈 배열 aliasing도 안전하다', () => {
    const arr: number[] = [];
    const result = standardizeInto(arr, arr);
    expect(result).toBe(arr);
    expect(arr).toEqual([]);
  });
});

describe('standardizeInto — signed zero canonicalize', () => {
  test('z-score -0은 +0으로 canonicalize된다', () => {
    // values = [-0, 2, -2]: mean = 0, delta = [-0, 2, -2], stddev = sqrt(8/3).
    // z[0] = -0 / stddev = -0 → canonicalize → +0.
    const out = standardize([-0, 2, -2]);
    expect(out).toHaveLength(3);
    expect(Object.is(out[0], 0)).toBe(true);
    expect(Object.is(out[0], -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// standardize (companion)
// ---------------------------------------------------------------------------

describe('standardize — companion', () => {
  test('새 배열을 반환한다 (population)', () => {
    expect(standardize([2, 4])).toEqual([-1, 1]);
  });

  test('sample mode delegate', () => {
    const result = standardize([2, 4], { mode: 'sample' });
    const expected = 1 / Math.sqrt(2);
    expect(result[0]).toBeCloseTo(-expected, 12);
    expect(result[1]).toBeCloseTo(expected, 12);
  });

  test('빈 배열은 []', () => {
    expect(standardize([])).toEqual([]);
  });

  test('zero stddev는 zero vector', () => {
    expect(standardize([7, 7])).toEqual([0, 0]);
  });

  test('invalid mode는 RangeError (빈 입력에서도)', () => {
    expect(() => standardize([], { mode: 'bad' as never })).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => standardize(undefined as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => standardize([1, Number.NaN])).toThrow(RangeError);
  });

  test('sample n<2는 RangeError', () => {
    expect(() => standardize([42], { mode: 'sample' })).toThrow(RangeError);
  });
});
