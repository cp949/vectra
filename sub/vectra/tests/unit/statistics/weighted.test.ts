/**
 * statistics.weightedMean / weightedVariance — weighted statistics helper.
 *
 * 검증: weightedMean equal weights == unweighted mean, weightedMean unequal weights,
 *   weightedVariance population/sample denominator, weightedVariance equal weights == unweighted variance,
 *   weighted validation (non-array values/weights, length mismatch, empty, negative/NaN/Infinity weight, all-zero weights),
 *   weighted overflow (total weight, weighted sum, weighted squared sum),
 *   weighted sample length 1 RangeError, signed-zero canonicalize.
 */

import { describe, expect, test } from 'vitest';
import { mean } from '../../../src/statistics/mean';
import { variance } from '../../../src/statistics/variance';
import { weightedMean } from '../../../src/statistics/weighted-mean';
import { weightedVariance } from '../../../src/statistics/weighted-variance';

// ---------------------------------------------------------------------------
// weightedMean
// ---------------------------------------------------------------------------

describe('weightedMean — basic case', () => {
  test('equal weights는 unweighted mean과 일치', () => {
    expect(weightedMean([1, 2, 3, 4], [1, 1, 1, 1])).toBe(mean([1, 2, 3, 4]));
    expect(weightedMean([10, 20, 30], [2.5, 2.5, 2.5])).toBe(mean([10, 20, 30]));
  });

  test('unequal weights는 weighted average', () => {
    // (1*1 + 2*2 + 3*3) / (1+2+3) = 14 / 6 = 2.3333...
    expect(weightedMean([1, 2, 3], [1, 2, 3])).toBeCloseTo(14 / 6, 12);
    // (10*1 + 20*4) / (1+4) = 90 / 5 = 18
    expect(weightedMean([10, 20], [1, 4])).toBe(18);
  });

  test('단일 entry의 weightedMean은 그 entry', () => {
    expect(weightedMean([42], [1])).toBe(42);
    expect(weightedMean([42], [0.001])).toBe(42);
  });

  test('zero weight는 해당 entry를 평균에서 제외', () => {
    // values=[10, 100], weights=[1, 0] → (10*1 + 100*0) / (1+0) = 10
    expect(weightedMean([10, 100], [1, 0])).toBe(10);
    // values=[1, 999, 3], weights=[1, 0, 1] → (1 + 0 + 3) / 2 = 2
    expect(weightedMean([1, 999, 3], [1, 0, 1])).toBe(2);
  });

  test('음수와 소수가 섞인 weightedMean', () => {
    // (-1*1 + 1*1) / 2 = 0
    expect(weightedMean([-1, 1], [1, 1])).toBe(0);
    // (0.5*2 + 1.5*2) / 4 = 4 / 4 = 1
    expect(weightedMean([0.5, 1.5], [2, 2])).toBe(1);
  });
});

describe('weightedMean — invalid input', () => {
  test('values가 array가 아니면 TypeError', () => {
    expect(() => weightedMean(null as unknown as readonly number[], [1])).toThrow(TypeError);
    expect(() => weightedMean(undefined as unknown as readonly number[], [1])).toThrow(TypeError);
    expect(() => weightedMean('abc' as unknown as readonly number[], [1])).toThrow(TypeError);
  });

  test('weights가 array가 아니면 TypeError', () => {
    expect(() => weightedMean([1], null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => weightedMean([1], undefined as unknown as readonly number[])).toThrow(TypeError);
    expect(() => weightedMean([1], 'abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('빈 values는 RangeError', () => {
    expect(() => weightedMean([], [])).toThrow(RangeError);
  });

  test('values.length와 weights.length가 다르면 RangeError', () => {
    expect(() => weightedMean([1, 2, 3], [1, 1])).toThrow(RangeError);
    expect(() => weightedMean([1], [1, 2])).toThrow(RangeError);
  });

  test('NaN values entry는 RangeError', () => {
    expect(() => weightedMean([1, Number.NaN], [1, 1])).toThrow(RangeError);
  });

  test('Infinity values entry는 RangeError', () => {
    expect(() => weightedMean([1, Number.POSITIVE_INFINITY], [1, 1])).toThrow(RangeError);
    expect(() => weightedMean([1, Number.NEGATIVE_INFINITY], [1, 1])).toThrow(RangeError);
  });

  test('음수 weight는 RangeError', () => {
    expect(() => weightedMean([1, 2], [1, -0.5])).toThrow(RangeError);
  });

  test('NaN weight는 RangeError', () => {
    expect(() => weightedMean([1, 2], [1, Number.NaN])).toThrow(RangeError);
  });

  test('Infinity weight는 RangeError', () => {
    expect(() => weightedMean([1, 2], [1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
    expect(() => weightedMean([1, 2], [1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });

  test('모든 weight가 0이면 RangeError', () => {
    expect(() => weightedMean([1, 2, 3], [0, 0, 0])).toThrow(RangeError);
  });
});

describe('weightedMean — arithmetic overflow', () => {
  test('weight가 너무 커서 weightSquared overflow가 발생하면 RangeError', () => {
    // computeWeightedMean의 검증 순서는 weightedEntry → weightedSum → totalWeight → weightSquared이다.
    // weight=MAX_VALUE면 weightSquared = MAX² = Infinity로 항상 squared weight 분기에서 throw된다.
    // values=[0,0]/[1,1] 어느 쪽이든 i=0 시점에 같은 분기로 도달한다.
    expect(() => weightedMean([0, 0], [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
    expect(() => weightedMean([1, 1], [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });

  test('weighted sum이 누적 도중 non-finite면 RangeError', () => {
    expect(() => weightedMean([Number.MAX_VALUE, Number.MAX_VALUE], [1, 1])).toThrow(RangeError);
  });

  test('단일 step에서 weight*value가 non-finite면 RangeError', () => {
    // Number.MAX_VALUE * 2 = Infinity
    expect(() => weightedMean([Number.MAX_VALUE], [2])).toThrow(RangeError);
  });
});

describe('weightedMean — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const values = [1, 2, 3, 4];
    const weights = [4, 3, 2, 1];
    const valuesSnapshot = [...values];
    const weightsSnapshot = [...weights];
    weightedMean(values, weights);
    expect(values).toEqual(valuesSnapshot);
    expect(weights).toEqual(weightsSnapshot);
  });
});

describe('weightedMean — signed zero canonicalize', () => {
  test('결과가 -0이면 +0으로 canonicalize', () => {
    // (-0 * 1) / 1 = -0
    const result = weightedMean([-0], [1]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });

  test('모든 entry가 -0이어도 결과는 +0', () => {
    const result = weightedMean([-0, -0, -0], [1, 2, 3]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// weightedVariance
// ---------------------------------------------------------------------------

describe('weightedVariance — basic case (population)', () => {
  test('equal weights는 unweighted population variance와 일치', () => {
    expect(weightedVariance([1, 2, 3, 4], [1, 1, 1, 1])).toBeCloseTo(variance([1, 2, 3, 4]), 12);
    expect(weightedVariance([10, 20, 30], [5, 5, 5])).toBeCloseTo(variance([10, 20, 30]), 12);
  });

  test('단일 entry population variance는 0', () => {
    expect(weightedVariance([42], [1])).toBe(0);
  });

  test('모든 entry가 같으면 variance는 0', () => {
    expect(weightedVariance([5, 5, 5], [1, 2, 3])).toBe(0);
  });

  test('unequal weights population variance', () => {
    // values=[1, 3], weights=[1, 3] → mean=(1+9)/4=2.5. Σw(x-m)² = 1*(1-2.5)² + 3*(3-2.5)² = 2.25 + 0.75 = 3
    // population denom = W = 4. result = 3/4 = 0.75.
    expect(weightedVariance([1, 3], [1, 3])).toBeCloseTo(0.75, 12);
  });

  test('zero weight entry는 variance에 기여하지 않는다', () => {
    // values=[1, 100, 3], weights=[1, 0, 1] → mean=2. Σw(x-m)² = 1 + 0 + 1 = 2. denom=2. var=1.
    expect(weightedVariance([1, 100, 3], [1, 0, 1])).toBeCloseTo(1, 12);
  });
});

describe('weightedVariance — basic case (sample)', () => {
  test('equal weights는 unweighted sample variance와 일치', () => {
    expect(weightedVariance([1, 2, 3, 4], [1, 1, 1, 1], { mode: 'sample' })).toBeCloseTo(
      variance([1, 2, 3, 4], { mode: 'sample' }),
      12
    );
    expect(weightedVariance([10, 20, 30], [5, 5, 5], { mode: 'sample' })).toBeCloseTo(
      variance([10, 20, 30], { mode: 'sample' }),
      12
    );
  });

  test('reliability-weights sample denominator: W - Σwᵢ²/W', () => {
    // values=[1, 3], weights=[1, 3] → W=4, Σw²=10, denom=4 - 10/4 = 1.5
    // Σw(x-m)² = 3 (mean=2.5 위 case와 동일). var = 3/1.5 = 2
    expect(weightedVariance([1, 3], [1, 3], { mode: 'sample' })).toBeCloseTo(2, 12);
  });

  test('sample mode에서 단일 entry는 RangeError', () => {
    // length=1, weight=w → denom = w - w²/w = w - w = 0 → RangeError
    expect(() => weightedVariance([5], [1], { mode: 'sample' })).toThrow(RangeError);
    expect(() => weightedVariance([5], [3.14], { mode: 'sample' })).toThrow(RangeError);
  });

  test('sample mode에서 한 weight만 non-zero면 RangeError', () => {
    // values=[1, 2], weights=[1, 0] → W=1, Σw²=1, denom = 1 - 1/1 = 0 → RangeError
    expect(() => weightedVariance([1, 2], [1, 0], { mode: 'sample' })).toThrow(RangeError);
  });

  test('default mode는 population', () => {
    expect(weightedVariance([1, 3], [1, 3])).toBe(weightedVariance([1, 3], [1, 3], { mode: 'population' }));
  });
});

describe('weightedVariance — invalid input', () => {
  test('values가 array가 아니면 TypeError', () => {
    expect(() => weightedVariance(null as unknown as readonly number[], [1])).toThrow(TypeError);
    expect(() => weightedVariance('abc' as unknown as readonly number[], [1])).toThrow(TypeError);
    expect(() => weightedVariance(undefined as unknown as readonly number[], [1])).toThrow(TypeError);
  });

  test('weights가 array가 아니면 TypeError', () => {
    expect(() => weightedVariance([1], null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => weightedVariance([1], 'abc' as unknown as readonly number[])).toThrow(TypeError);
    expect(() => weightedVariance([1], undefined as unknown as readonly number[])).toThrow(TypeError);
  });

  test('invalid mode는 RangeError', () => {
    expect(() =>
      weightedVariance([1, 2], [1, 1], {
        mode: 'foo' as unknown as 'population',
      })
    ).toThrow(RangeError);
  });

  test('빈 values는 RangeError', () => {
    expect(() => weightedVariance([], [])).toThrow(RangeError);
  });

  test('length mismatch는 RangeError', () => {
    expect(() => weightedVariance([1, 2, 3], [1, 1])).toThrow(RangeError);
    expect(() => weightedVariance([1], [1, 2])).toThrow(RangeError);
  });

  test('NaN values entry는 RangeError', () => {
    expect(() => weightedVariance([1, Number.NaN], [1, 1])).toThrow(RangeError);
  });

  test('Infinity values entry는 RangeError', () => {
    expect(() => weightedVariance([1, Number.POSITIVE_INFINITY], [1, 1])).toThrow(RangeError);
    expect(() => weightedVariance([1, Number.NEGATIVE_INFINITY], [1, 1])).toThrow(RangeError);
  });

  test('음수 weight는 RangeError', () => {
    expect(() => weightedVariance([1, 2], [1, -1])).toThrow(RangeError);
  });

  test('NaN weight는 RangeError', () => {
    expect(() => weightedVariance([1, 2], [1, Number.NaN])).toThrow(RangeError);
  });

  test('Infinity weight는 RangeError', () => {
    expect(() => weightedVariance([1, 2], [1, Number.POSITIVE_INFINITY])).toThrow(RangeError);
    expect(() => weightedVariance([1, 2], [1, Number.NEGATIVE_INFINITY])).toThrow(RangeError);
  });

  test('모든 weight가 0이면 RangeError', () => {
    expect(() => weightedVariance([1, 2, 3], [0, 0, 0])).toThrow(RangeError);
  });
});

describe('weightedVariance — arithmetic overflow', () => {
  test('weight가 너무 커서 weightSquared overflow가 발생하면 RangeError', () => {
    // computeWeightedMean의 검증 순서는 weightedEntry → weightedSum → totalWeight → weightSquared이다.
    // weight=MAX_VALUE면 weightSquared = MAX² = Infinity로 항상 squared weight 분기에서 throw된다.
    expect(() => weightedVariance([0, 0], [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
    expect(() => weightedVariance([1, 1], [Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });

  test('weighted sum overflow는 RangeError', () => {
    expect(() => weightedVariance([Number.MAX_VALUE, Number.MAX_VALUE], [1, 1])).toThrow(RangeError);
  });

  test('squared weight overflow는 RangeError', () => {
    // weight=1e200이면 weightSquared = 1e400 = Infinity → squared weight finite 분기에서 throw.
    expect(() => weightedVariance([1, 1], [1e200, 1])).toThrow(RangeError);
  });

  test('centered delta가 non-finite면 RangeError', () => {
    // mean = (1 + (-MAX)) / 2 ≈ -MAX/2, delta(MAX) ≈ MAX/2*3 → 결국 squared 단계에서 overflow.
    // 좀 더 결정적인 시나리오: 매우 큰 값 두 개 → 제곱에서 overflow.
    expect(() => weightedVariance([-Number.MAX_VALUE, Number.MAX_VALUE], [1, 1])).toThrow(RangeError);
  });

  test('weighted squared sum overflow는 RangeError', () => {
    // values=[1e154, -1e154, 1e154]. mean = 1e154/3. delta² ≈ (2e154/3)² ≈ 4.4e308 → Infinity.
    expect(() => weightedVariance([1e154, -1e154, 1e154], [1, 1, 1])).toThrow(RangeError);
  });
});

describe('weightedVariance — non-mutation', () => {
  test('input 배열을 mutate하지 않는다', () => {
    const values = [1, 2, 3, 4];
    const weights = [4, 3, 2, 1];
    const valuesSnapshot = [...values];
    const weightsSnapshot = [...weights];
    weightedVariance(values, weights);
    expect(values).toEqual(valuesSnapshot);
    expect(weights).toEqual(weightsSnapshot);
  });
});

describe('weightedVariance — signed zero canonicalize', () => {
  test('모든 entry가 같으면 결과 -0이 +0으로 canonicalize', () => {
    // x - x = -0이 발생할 수 있음. 결과 0 / W = 0. canonicalize는 안전망.
    const result = weightedVariance([5, 5, 5], [1, 2, 3]);
    expect(Object.is(result, 0)).toBe(true);
    expect(Object.is(result, -0)).toBe(false);
  });
});
