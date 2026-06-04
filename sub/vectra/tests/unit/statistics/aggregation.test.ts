/**
 * statistics.min / max / range / sum / product / geometricMean / harmonicMean / trimmedMean — scalar aggregation helper.
 *
 * 검증: min/max basic/negative/single, range = max - min, range overflow,
 *   sum normal/single/overflow, product normal/negative/overflow,
 *   geometricMean basic/zero/negative/zero-precedes-negative/log-sum overflow/underflow round-trip,
 *   harmonicMean basic/non-positive/reciprocal overflow,
 *   trimmedMean basic/sorted-copy/fraction bounds/negative-zero fraction/floor-zero/sum overflow,
 *   aggregation validation (non-array, empty, NaN/Infinity), signed-zero canonicalize.
 */

import { describe, expect, test } from 'vitest';
import { geometricMean } from '../../../src/statistics/geometric-mean';
import { harmonicMean } from '../../../src/statistics/harmonic-mean';
import { max } from '../../../src/statistics/max';
import { min } from '../../../src/statistics/min';
import { product } from '../../../src/statistics/product';
import { range } from '../../../src/statistics/range';
import { sum } from '../../../src/statistics/sum';
import { trimmedMean } from '../../../src/statistics/trimmed-mean';

// ---------------------------------------------------------------------------
// min
// ---------------------------------------------------------------------------

describe('min — basic case', () => {
  test('positive entry의 최솟값', () => {
    expect(min([3, 1, 2])).toBe(1);
    expect(min([10, 20, 30])).toBe(10);
  });

  test('단일 entry는 그 entry', () => {
    expect(min([42])).toBe(42);
  });

  test('음수가 섞인 최솟값', () => {
    expect(min([-3, -1, -2])).toBe(-3);
    expect(min([-5, 0, 5])).toBe(-5);
  });

  test('소수가 섞인 최솟값', () => {
    expect(min([1.5, 0.5, 2.5])).toBe(0.5);
  });

  test('duplicate entry가 있는 최솟값', () => {
    expect(min([2, 2, 2])).toBe(2);
    expect(min([1, 2, 1, 3])).toBe(1);
  });
});

describe('min — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => min([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => min(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => min(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => min('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => min([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => min([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => min([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('min — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    min(input);
    expect(input).toEqual(snapshot);
  });
});

describe('min — signed zero canonicalize', () => {
  test('-0이 최솟값이면 +0으로 canonicalize', () => {
    const result = min([-0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('positive entry 사이의 -0도 +0으로 canonicalize', () => {
    const result = min([-0, 1, 2]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// max
// ---------------------------------------------------------------------------

describe('max — basic case', () => {
  test('positive entry의 최댓값', () => {
    expect(max([3, 1, 2])).toBe(3);
    expect(max([10, 20, 30])).toBe(30);
  });

  test('단일 entry는 그 entry', () => {
    expect(max([42])).toBe(42);
  });

  test('음수가 섞인 최댓값', () => {
    expect(max([-3, -1, -2])).toBe(-1);
    expect(max([-5, 0, 5])).toBe(5);
  });

  test('소수가 섞인 최댓값', () => {
    expect(max([1.5, 0.5, 2.5])).toBe(2.5);
  });

  test('duplicate entry가 있는 최댓값', () => {
    expect(max([2, 2, 2])).toBe(2);
    expect(max([1, 3, 1, 3])).toBe(3);
  });
});

describe('max — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => max([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => max(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => max(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => max('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => max([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => max([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => max([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('max — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    max(input);
    expect(input).toEqual(snapshot);
  });
});

describe('max — signed zero canonicalize', () => {
  test('-0이 최댓값이면 +0으로 canonicalize', () => {
    const result = max([-0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('negative entry 사이의 -0도 +0으로 canonicalize', () => {
    const result = max([-2, -1, -0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// range
// ---------------------------------------------------------------------------

describe('range — basic case', () => {
  test('range는 max - min', () => {
    expect(range([1, 2, 3])).toBe(2);
    expect(range([10, 20, 30])).toBe(20);
  });

  test('단일 entry의 range는 0', () => {
    expect(range([42])).toBe(0);
  });

  test('음수가 섞인 range', () => {
    expect(range([-3, -1, -2])).toBe(2);
    expect(range([-5, 0, 5])).toBe(10);
  });

  test('소수가 섞인 range', () => {
    expect(range([0.5, 1.5, 2.5])).toBe(2);
  });

  test('duplicate entry만 있으면 range는 0', () => {
    expect(range([2, 2, 2])).toBe(0);
  });
});

describe('range — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => range([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => range(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => range('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => range([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => range([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => range([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('range — arithmetic overflow', () => {
  test('max - min이 non-finite면 RangeError', () => {
    // Number.MAX_VALUE - (-Number.MAX_VALUE) = Infinity
    expect(() => range([-Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });

  test('순서가 뒤바뀐 입력도 동일하게 RangeError', () => {
    // 입력 순서에 의존하지 않음을 명시: 단일 패스로 min/max를 동시에 산출한다.
    expect(() => range([Number.MAX_VALUE, -Number.MAX_VALUE])).toThrow(RangeError);
  });
});

describe('range — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    range(input);
    expect(input).toEqual(snapshot);
  });
});

describe('range — signed zero canonicalize', () => {
  test('단일 -0 entry의 range는 +0', () => {
    const result = range([-0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('[0, -0] range는 +0으로 canonicalize', () => {
    // max = 0, min = -0, max - min = 0 - (-0) = 0 (IEEE 754는 0이 결과지만 안전망).
    const result = range([0, -0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('동일 entry의 range는 +0', () => {
    // x - x = +0 in IEEE 754. canonicalize는 항상 안전망.
    const result = range([5, 5, 5]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// sum
// ---------------------------------------------------------------------------

describe('sum — basic case', () => {
  test('positive entry의 합', () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(sum([10, 20, 30])).toBe(60);
  });

  test('단일 entry는 그 entry', () => {
    expect(sum([42])).toBe(42);
  });

  test('음수가 섞인 합', () => {
    expect(sum([-1, -2, -3])).toBe(-6);
    expect(sum([-5, 0, 5])).toBe(0);
  });

  test('소수가 섞인 합', () => {
    expect(sum([0.5, 1.5, 2])).toBe(4);
  });
});

describe('sum — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => sum([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => sum(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => sum(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => sum('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => sum([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => sum([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => sum([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('sum — arithmetic overflow', () => {
  test('누적 sum이 non-finite면 RangeError', () => {
    expect(() => sum([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });

  test('음수 방향 overflow도 RangeError', () => {
    expect(() => sum([-Number.MAX_VALUE, -Number.MAX_VALUE])).toThrow(RangeError);
  });
});

describe('sum — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    sum(input);
    expect(input).toEqual(snapshot);
  });
});

describe('sum — signed zero canonicalize', () => {
  test('단일 -0 entry의 sum은 +0', () => {
    // IEEE 754: 0 + -0 = +0이지만 canonicalize로 일관성 보장.
    const result = sum([-0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('모든 entry가 -0이어도 +0으로 canonicalize', () => {
    const result = sum([-0, -0, -0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// product
// ---------------------------------------------------------------------------

describe('product — basic case', () => {
  test('positive entry의 곱', () => {
    expect(product([1, 2, 3])).toBe(6);
    expect(product([2, 3, 4])).toBe(24);
  });

  test('단일 entry는 그 entry', () => {
    expect(product([42])).toBe(42);
  });

  test('음수가 섞인 곱', () => {
    expect(product([-1, -2, -3])).toBe(-6);
    expect(product([-2, 3])).toBe(-6);
    expect(product([-2, -3])).toBe(6);
  });

  test('소수가 섞인 곱', () => {
    expect(product([0.5, 2])).toBe(1);
    expect(product([2, 2.5])).toBe(5);
  });

  test('0이 포함되면 결과는 0', () => {
    expect(product([1, 2, 0, 3])).toBe(0);
  });
});

describe('product — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => product([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => product(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => product(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => product('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => product([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => product([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => product([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('product — arithmetic overflow', () => {
  test('누적 product가 non-finite면 RangeError', () => {
    expect(() => product([Number.MAX_VALUE, 2])).toThrow(RangeError);
  });

  test('음수 방향 overflow도 RangeError', () => {
    expect(() => product([-Number.MAX_VALUE, 2])).toThrow(RangeError);
  });

  test('product([0, NaN])은 0 * NaN이 아니라 entry-finite 검증으로 RangeError', () => {
    // entry-finite 검증이 누적 곱셈보다 먼저 수행되어 index 1에서 차단된다.
    // message가 "values[1]"을 포함해 entry-level error임을 명확히 한다.
    expect(() => product([0, Number.NaN])).toThrow(/values\[1\]/);
  });
});

describe('product — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    product(input);
    expect(input).toEqual(snapshot);
  });
});

describe('product — signed zero canonicalize', () => {
  test('-0과 positive entry의 곱은 +0으로 canonicalize', () => {
    // -0 * 1 = -0 in IEEE 754. canonicalize로 +0.
    const result = product([-0, 1]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('단일 -0 entry의 product는 +0', () => {
    const result = product([-0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('짝수 개의 음수 인자에 0 포함도 +0', () => {
    // -1 * -2 * 0 = +0인데 sign 보존 확인.
    const result = product([-1, -2, 0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// geometricMean
// ---------------------------------------------------------------------------

describe('geometricMean — basic case', () => {
  test('positive entry의 기하 평균', () => {
    expect(geometricMean([1, 4, 9])).toBeCloseTo(36 ** (1 / 3), 12);
    expect(geometricMean([2, 8])).toBeCloseTo(4, 12);
  });

  test('단일 entry는 그 entry', () => {
    expect(geometricMean([42])).toBeCloseTo(42, 12);
  });

  test('동일 entry의 기하 평균은 그 값', () => {
    expect(geometricMean([5, 5, 5])).toBeCloseTo(5, 12);
  });

  test('소수가 섞인 기하 평균', () => {
    expect(geometricMean([0.5, 2])).toBeCloseTo(1, 12);
  });

  test('0이 포함되면 결과는 0', () => {
    expect(geometricMean([0, 2, 8])).toBe(0);
    expect(geometricMean([2, 0])).toBe(0);
  });
});

describe('geometricMean — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => geometricMean([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => geometricMean(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => geometricMean(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => geometricMean('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('음수 entry는 RangeError', () => {
    expect(() => geometricMean([-1, 2])).toThrow(RangeError);
    expect(() => geometricMean([2, -3, 4])).toThrow(RangeError);
  });

  test('0 포함이 음수 검증을 우회하지 않는다', () => {
    // [0, -1]은 index 0에서 hasZero flag만 세우고 early return하지 않는다.
    // 나머지 entry를 끝까지 검증하므로 index 1의 음수가 RangeError로 차단된다.
    expect(() => geometricMean([0, -1])).toThrow(RangeError);
    expect(() => geometricMean([-1, 0])).toThrow(RangeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => geometricMean([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => geometricMean([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => geometricMean([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('geometricMean — log-sum overflow 회피', () => {
  test('[MAX_VALUE, MAX_VALUE]는 log-sum 경로로 finite 결과를 반환한다', () => {
    // 곱 기반이면 MAX_VALUE * MAX_VALUE = Infinity. log-sum 평균은 finite를 유지한다.
    const result = geometricMean([Number.MAX_VALUE, Number.MAX_VALUE]);
    expect(Number.isFinite(result)).toBe(true);
    // log-sum 평균은 exp/log round-trip 오차만 남는다. 상대 오차로 근접을 검증한다.
    expect(Math.abs(result - Number.MAX_VALUE) / Number.MAX_VALUE).toBeLessThan(1e-10);
  });

  test('[MIN_VALUE, MIN_VALUE]는 underflow 없이 MIN_VALUE를 보존한다', () => {
    // 곱 기반이면 MIN_VALUE * MIN_VALUE = 0으로 underflow. log-sum 평균은 동일 값을 복원한다.
    const result = geometricMean([Number.MIN_VALUE, Number.MIN_VALUE]);
    expect(Number.isFinite(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
    expect(result).toBe(Number.MIN_VALUE);
  });
});

describe('geometricMean — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    geometricMean(input);
    expect(input).toEqual(snapshot);
  });
});

describe('geometricMean — signed zero canonicalize', () => {
  test('-0 entry는 0 포함 정책으로 +0을 반환한다', () => {
    const result = geometricMean([-0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('positive entry 사이의 -0도 +0', () => {
    const result = geometricMean([-0, 2, 8]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// harmonicMean
// ---------------------------------------------------------------------------

describe('harmonicMean — basic case', () => {
  test('positive entry의 조화 평균', () => {
    expect(harmonicMean([1, 2, 4])).toBeCloseTo(3 / 1.75, 12);
    expect(harmonicMean([2, 8])).toBeCloseTo(3.2, 12);
  });

  test('단일 entry는 그 entry', () => {
    expect(harmonicMean([42])).toBeCloseTo(42, 12);
  });

  test('동일 entry의 조화 평균은 그 값', () => {
    expect(harmonicMean([5, 5, 5])).toBeCloseTo(5, 12);
  });

  test('소수가 섞인 조화 평균', () => {
    expect(harmonicMean([0.5, 2])).toBeCloseTo(0.8, 12);
  });
});

describe('harmonicMean — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => harmonicMean([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => harmonicMean(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => harmonicMean(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => harmonicMean('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('0 entry는 RangeError', () => {
    expect(() => harmonicMean([1, 0, 4])).toThrow(RangeError);
  });

  test('-0 entry는 RangeError', () => {
    expect(() => harmonicMean([1, -0, 4])).toThrow(RangeError);
  });

  test('음수 entry는 RangeError', () => {
    expect(() => harmonicMean([1, -2, 4])).toThrow(RangeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => harmonicMean([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => harmonicMean([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => harmonicMean([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('harmonicMean — arithmetic overflow', () => {
  test('reciprocal sum이 non-finite면 RangeError', () => {
    // 1 / Number.MIN_VALUE = Infinity. 매 step finite 검증으로 차단.
    expect(() => harmonicMean([Number.MIN_VALUE])).toThrow(RangeError);
  });
});

describe('harmonicMean — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    harmonicMean(input);
    expect(input).toEqual(snapshot);
  });
});

// ---------------------------------------------------------------------------
// trimmedMean
// ---------------------------------------------------------------------------

describe('trimmedMean — basic case', () => {
  test('양끝 floor(n * fraction)개 제거 후 평균', () => {
    // floor(4 * 0.25) = 1, sorted [1, 2, 100, 200]에서 양끝 1개 제거 → (2 + 100) / 2.
    expect(trimmedMean([1, 2, 100, 200], 0.25)).toBe(51);
  });

  test('정렬되지 않은 입력도 sorted copy로 trimming한다', () => {
    expect(trimmedMean([100, 1, 200, 2], 0.25)).toBe(51);
  });

  test('fraction 0은 일반 평균과 같다', () => {
    expect(trimmedMean([1, 2, 3, 4], 0)).toBe(2.5);
  });

  test('floor(n * fraction) === 0이면 전체 평균', () => {
    // floor(3 * 0.3) = 0 → trimming 없이 전체 평균.
    expect(trimmedMean([1, 2, 3], 0.3)).toBe(2);
  });

  test('upper-bound 근처 fraction 0.49', () => {
    // floor(10 * 0.49) = 4 → 양끝 4개 제거 → [5, 6] → 5.5.
    expect(trimmedMean([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.49)).toBe(5.5);
  });

  test('단일 entry는 그 entry', () => {
    expect(trimmedMean([42], 0.25)).toBe(42);
  });

  test('fraction -0은 fraction 0과 동일하게 전체 평균', () => {
    // Number.isFinite(-0)이고 -0 < 0은 false, -0 >= 0.5도 false라 통과한다.
    // Math.floor(n * -0) = -0이므로 trimming 없이 전체 평균이다.
    expect(trimmedMean([1, 2, 3, 4], -0)).toBe(2.5);
  });
});

describe('trimmedMean — invalid fraction', () => {
  test('fraction 0.5는 RangeError', () => {
    expect(() => trimmedMean([1, 2, 3, 4], 0.5)).toThrow(RangeError);
  });

  test('음수 fraction은 RangeError', () => {
    expect(() => trimmedMean([1, 2, 3, 4], -0.1)).toThrow(RangeError);
  });

  test('NaN fraction은 RangeError', () => {
    expect(() => trimmedMean([1, 2, 3, 4], Number.NaN)).toThrow(RangeError);
  });

  test('Infinity fraction은 RangeError', () => {
    expect(() => trimmedMean([1, 2, 3, 4], Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  test('fraction 검증은 values 검증보다 먼저 fail-fast한다', () => {
    // 빈 입력이어도 invalid fraction이 우선 차단된다.
    expect(() => trimmedMean([], 0.5)).toThrow(RangeError);
  });
});

describe('trimmedMean — invalid values', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => trimmedMean([], 0.25)).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => trimmedMean(null as unknown as readonly number[], 0.25)).toThrow(TypeError);
    expect(() => trimmedMean(undefined as unknown as readonly number[], 0.25)).toThrow(TypeError);
    expect(() => trimmedMean('abc' as unknown as readonly number[], 0.25)).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => trimmedMean([1, Number.NaN, 3, 4], 0.25)).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => trimmedMean([1, Number.POSITIVE_INFINITY, 3, 4], 0.25)).toThrow(RangeError);
  });

  test('-Infinity entry는 RangeError', () => {
    expect(() => trimmedMean([1, Number.NEGATIVE_INFINITY, 3, 4], 0.25)).toThrow(RangeError);
  });
});

describe('trimmedMean — arithmetic overflow', () => {
  test('누적 sum이 non-finite면 RangeError', () => {
    // fraction 0이면 모든 entry를 평균낸다. MAX_VALUE + MAX_VALUE = Infinity.
    expect(() => trimmedMean([Number.MAX_VALUE, Number.MAX_VALUE], 0)).toThrow(RangeError);
  });
});

describe('trimmedMean — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    trimmedMean(input, 0.2);
    expect(input).toEqual(snapshot);
  });
});

describe('trimmedMean — signed zero canonicalize', () => {
  test('-0만 남은 평균은 +0으로 canonicalize', () => {
    const result = trimmedMean([-0, -0], 0);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('대칭 입력의 평균 0도 +0', () => {
    const result = trimmedMean([-4, 4], 0);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});
