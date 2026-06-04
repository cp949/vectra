/**
 * statistics.medianAbsoluteDeviation / skewness / kurtosis — robust and moment helper.
 *
 * 검증: MAD known dataset/odd/even/single, MAD validation, MAD signed-zero canonicalize,
 *   skewness symmetric → 0, skewness known dataset population/sample, skewness zero variance/length<3,
 *   kurtosis known dataset population/sample, kurtosis zero variance/length<4,
 *   moment overflow (third/fourth power sum), validation, non-mutation, signed-zero canonicalize.
 */

import { describe, expect, test } from 'vitest';
import { kurtosis } from '../../../src/statistics/kurtosis';
import { medianAbsoluteDeviation } from '../../../src/statistics/median-absolute-deviation';
import { skewness } from '../../../src/statistics/skewness';

// ---------------------------------------------------------------------------
// medianAbsoluteDeviation
// ---------------------------------------------------------------------------

describe('medianAbsoluteDeviation — basic case', () => {
  test('odd length known dataset', () => {
    // sorted: [1,1,2,2,4,6,9], median=2, |dev|=[1,1,0,0,2,4,7], sorted=[0,0,1,1,2,4,7], median=1
    expect(medianAbsoluteDeviation([1, 1, 2, 2, 4, 6, 9])).toBe(1);
  });

  test('even length known dataset', () => {
    // sorted: [1,2,3,4], median=2.5, |dev|=[1.5,0.5,0.5,1.5], sorted=[0.5,0.5,1.5,1.5], median=1
    expect(medianAbsoluteDeviation([1, 2, 3, 4])).toBe(1);
  });

  test('단일 entry MAD는 0', () => {
    expect(medianAbsoluteDeviation([42])).toBe(0);
  });

  test('모든 entry가 같으면 MAD는 0', () => {
    expect(medianAbsoluteDeviation([5, 5, 5, 5])).toBe(0);
  });

  test('shuffled input도 sorted copy 기준으로 동작', () => {
    expect(medianAbsoluteDeviation([9, 4, 1, 2, 1, 6, 2])).toBe(1);
  });

  test('음수와 소수가 섞인 MAD', () => {
    // sorted: [-2,-1,0,1,2], median=0, |dev|=[2,1,0,1,2], sorted=[0,1,1,2,2], median=1
    expect(medianAbsoluteDeviation([-2, -1, 0, 1, 2])).toBe(1);
  });
});

describe('medianAbsoluteDeviation — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => medianAbsoluteDeviation([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => medianAbsoluteDeviation(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => medianAbsoluteDeviation(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => medianAbsoluteDeviation('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => medianAbsoluteDeviation([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => medianAbsoluteDeviation([1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
    expect(() => medianAbsoluteDeviation([1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });
});

describe('medianAbsoluteDeviation — finite arithmetic sanity', () => {
  test('절댓값 deviation이 MAX_VALUE로 finite하면 정상 반환', () => {
    // sorted: [-MAX, 0, MAX], median = 0, |dev| = [MAX, 0, MAX], median = MAX.
    // MAD 계산에서 difference 자체가 MAX로 finite이므로 RangeError 없이 통과.
    // 단일 entry 차이만으로 Infinity를 만들기 어렵기 때문에 finite 분기는 안전망으로 유지하고
    // 이 sanity 케이스로 정상 경로만 검증한다.
    expect(medianAbsoluteDeviation([-Number.MAX_VALUE, 0, Number.MAX_VALUE])).toBe(Number.MAX_VALUE);
  });
});

describe('medianAbsoluteDeviation — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    const snapshot = [...input];
    medianAbsoluteDeviation(input);
    expect(input).toEqual(snapshot);
  });
});

describe('medianAbsoluteDeviation — signed zero canonicalize', () => {
  test('단일 -0 entry의 MAD는 +0', () => {
    const result = medianAbsoluteDeviation([-0]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('모든 entry가 같으면 결과 -0이 +0으로 canonicalize', () => {
    const result = medianAbsoluteDeviation([5, 5, 5]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// skewness
// ---------------------------------------------------------------------------

describe('skewness — basic case (population)', () => {
  test('symmetric distribution skewness는 0', () => {
    // [1,2,3,4,5] mean=3, deltas=[-2,-1,0,1,2], m3 = 0 → skewness 0
    expect(skewness([1, 2, 3, 4, 5])).toBe(0);
  });

  test('symmetric 2-point dataset skewness는 0', () => {
    // [1,3] mean=2, deltas=[-1,1], m3 = (-1+1)/2 = 0
    expect(skewness([1, 3])).toBe(0);
  });

  test('right-skewed known dataset', () => {
    // [0,0,0,0,1] mean=0.2, m2=0.16, m3=0.096, m2^1.5=0.064, g1=0.096/0.064=1.5
    expect(skewness([0, 0, 0, 0, 1])).toBeCloseTo(1.5, 12);
  });

  test('left-skewed dataset(symmetric 음수)', () => {
    // [-1,0,0,0,0] mean=-0.2, deltas=[-0.8,0.2,0.2,0.2,0.2], m3 = (-0.512+0.008*4)/5 = -0.096
    // skewness = -0.096/0.064 = -1.5
    expect(skewness([-1, 0, 0, 0, 0])).toBeCloseTo(-1.5, 12);
  });

  test('default mode는 population', () => {
    expect(skewness([0, 0, 0, 0, 1])).toBe(skewness([0, 0, 0, 0, 1], { mode: 'population' }));
  });
});

describe('skewness — sample bias correction', () => {
  test('sample skewness는 sqrt(N(N-1))/(N-2) * g1_population', () => {
    // N=5, g1=1.5 → sqrt(20)/3 * 1.5 = sqrt(20)/2 ≈ 2.23607
    expect(skewness([0, 0, 0, 0, 1], { mode: 'sample' })).toBeCloseTo(Math.sqrt(20) / 2, 12);
  });

  test('sample symmetric도 0', () => {
    // [1,2,3,4,5] sample skewness = sqrt(20)/3 * 0 = 0
    expect(skewness([1, 2, 3, 4, 5], { mode: 'sample' })).toBe(0);
  });

  test('sample mode N=3 boundary', () => {
    // N=3 OK. [0,0,1] mean=1/3, deltas=[-1/3,-1/3,2/3], m2=(1/9+1/9+4/9)/3=6/27=2/9
    // m3=(-1/27 - 1/27 + 8/27)/3 = 6/27/3 = 2/27
    // m2^1.5 = (2/9)^1.5
    // g1 = (2/27) / (2/9)^1.5
    // sample = sqrt(3*2)/1 * g1 = sqrt(6) * g1
    const m2 = 2 / 9;
    const m3 = 2 / 27;
    const g1 = m3 / m2 ** 1.5;
    const expected = Math.sqrt(6) * g1;
    expect(skewness([0, 0, 1], { mode: 'sample' })).toBeCloseTo(expected, 12);
  });
});

describe('skewness — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => skewness([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => skewness(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => skewness(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => skewness('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => skewness([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => skewness([1, Number.POSITIVE_INFINITY, 3])).toThrow(RangeError);
    expect(() => skewness([1, Number.NEGATIVE_INFINITY, 3])).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => skewness([1, 2, 3], { mode: 'foo' as unknown as 'population' })).toThrow(RangeError);
  });

  test('zero variance는 RangeError', () => {
    expect(() => skewness([5, 5, 5])).toThrow(RangeError);
    expect(() => skewness([5, 5, 5], { mode: 'sample' })).toThrow(RangeError);
  });

  test('sample mode에서 N < 3이면 RangeError', () => {
    expect(() => skewness([1, 2], { mode: 'sample' })).toThrow(RangeError);
    expect(() => skewness([1], { mode: 'sample' })).toThrow(RangeError);
  });

  test('population mode에서 단일 entry는 zero variance → RangeError', () => {
    expect(() => skewness([42])).toThrow(RangeError);
  });
});

describe('skewness — arithmetic overflow', () => {
  test('cubed sum overflow는 RangeError', () => {
    // delta ≈ 1e154일 때 delta³ ≈ 1e462 → Infinity.
    expect(() => skewness([1e154, -1e154, 1e154])).toThrow(RangeError);
  });
});

describe('skewness — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [0, 0, 0, 0, 1];
    const snapshot = [...input];
    skewness(input);
    expect(input).toEqual(snapshot);
  });
});

describe('skewness — signed zero canonicalize', () => {
  test('symmetric 결과 -0이 +0으로 canonicalize', () => {
    // [1,2,3,4,5] g1 = 0/denom. 0/x는 +0이지만 canonicalize는 안전망.
    const result = skewness([1, 2, 3, 4, 5]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// kurtosis
// ---------------------------------------------------------------------------

describe('kurtosis — basic case (population)', () => {
  test('uniform discrete dataset known excess kurtosis', () => {
    // [1,2,3,4,5] mean=3, m2=2, m4=34/5=6.8, g2 = 6.8/4 - 3 = -1.3
    expect(kurtosis([1, 2, 3, 4, 5])).toBeCloseTo(-1.3, 12);
  });

  test('symmetric two-point excess kurtosis', () => {
    // [-1,1] mean=0, m2=1, m4=1, g2 = 1/1 - 3 = -2
    expect(kurtosis([-1, 1])).toBe(-2);
  });

  test('peaked dataset positive excess', () => {
    // [0,0,0,0,1,-1,0,0,0,0] mean=0, m2 = 2/10 = 0.2, m4 = 2/10 = 0.2, g2 = 0.2/0.04 - 3 = 5 - 3 = 2
    expect(kurtosis([0, 0, 0, 0, 1, -1, 0, 0, 0, 0])).toBeCloseTo(2, 12);
  });

  test('default mode는 population', () => {
    expect(kurtosis([1, 2, 3, 4, 5])).toBe(kurtosis([1, 2, 3, 4, 5], { mode: 'population' }));
  });
});

describe('kurtosis — sample bias correction', () => {
  test('sample kurtosis는 표준 Fisher-Pearson 변환', () => {
    // N=5, population excess = -1.3
    // result = (4)/((3)(2)) * (6 * -1.3 + 6) = 0.6667 * (-1.8) = -1.2
    expect(kurtosis([1, 2, 3, 4, 5], { mode: 'sample' })).toBeCloseTo(-1.2, 12);
  });

  test('sample kurtosis N=4 boundary', () => {
    // [1,2,3,4] mean=2.5, deltas=[-1.5,-0.5,0.5,1.5], m2=(2.25+0.25+0.25+2.25)/4=5/4=1.25
    // m4=(5.0625+0.0625+0.0625+5.0625)/4 = 10.25/4 = 2.5625
    // g2_pop = 2.5625/1.5625 - 3 = 1.64 - 3 = -1.36
    // result = (3)/((2)(1)) * (5 * -1.36 + 6) = 1.5 * (-0.8) = -1.2
    const m2 = 1.25;
    const m4 = 2.5625;
    const g2pop = m4 / (m2 * m2) - 3;
    const N = 4;
    const expected = ((N - 1) / ((N - 2) * (N - 3))) * ((N + 1) * g2pop + 6);
    expect(kurtosis([1, 2, 3, 4], { mode: 'sample' })).toBeCloseTo(expected, 12);
  });
});

describe('kurtosis — invalid input', () => {
  test('빈 배열은 RangeError', () => {
    expect(() => kurtosis([])).toThrow(RangeError);
  });

  test('non-array는 TypeError', () => {
    expect(() => kurtosis(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => kurtosis(undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => kurtosis('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('NaN entry는 RangeError', () => {
    expect(() => kurtosis([1, Number.NaN, 3])).toThrow(RangeError);
  });

  test('Infinity entry는 RangeError', () => {
    expect(() => kurtosis([1, Number.POSITIVE_INFINITY, 3])).toThrow(RangeError);
    expect(() => kurtosis([1, Number.NEGATIVE_INFINITY, 3])).toThrow(RangeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() => kurtosis([1, 2, 3, 4], { mode: 'foo' as unknown as 'population' })).toThrow(RangeError);
  });

  test('zero variance는 RangeError', () => {
    expect(() => kurtosis([5, 5, 5, 5])).toThrow(RangeError);
    expect(() => kurtosis([5, 5, 5, 5], { mode: 'sample' })).toThrow(RangeError);
  });

  test('sample mode에서 N < 4이면 RangeError', () => {
    expect(() => kurtosis([1, 2, 3], { mode: 'sample' })).toThrow(RangeError);
    expect(() => kurtosis([1, 2], { mode: 'sample' })).toThrow(RangeError);
    expect(() => kurtosis([1], { mode: 'sample' })).toThrow(RangeError);
  });

  test('population mode에서 단일 entry는 zero variance → RangeError', () => {
    expect(() => kurtosis([42])).toThrow(RangeError);
  });
});

describe('kurtosis — arithmetic overflow', () => {
  test('fourth power sum overflow는 RangeError', () => {
    // delta ≈ 1e80일 때 delta⁴ ≈ 1e320 → Infinity. 최소 entry: delta가 큰 dataset.
    expect(() => kurtosis([1e80, -1e80, 1e80, -1e80])).toThrow(RangeError);
  });
});

describe('kurtosis — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = [...input];
    kurtosis(input);
    expect(input).toEqual(snapshot);
  });
});

describe('kurtosis — finite result sanity', () => {
  test('정상 finite 결과는 그대로 반환된다', () => {
    // 결과가 정확히 -0이 되는 dataset 구성은 까다롭다. canonicalize는 다른 leaf와 같은
    // 안전망 패턴으로 적용해 두고, 여기서는 정상 finite 결과 path만 검증한다.
    // kurtosis([-1, 1]) = m4/m2² - 3 = 1/1 - 3 = -2.
    const result = kurtosis([-1, 1]);
    expect(Object.is(result, -2)).toBe(true);
  });
});
