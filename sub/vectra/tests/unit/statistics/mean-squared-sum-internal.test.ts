/**
 * statistics mean-squared-sum.internal 단위 테스트.
 *
 * computeSquaredSum이 computeMeanWithSquaredSum(values).squaredSum과 같은 값, 같은 RangeError를
 * 내는지 검증한다. 두 함수는 루프 본문을 복제해 가지므로 한쪽만 고치면 이 테스트가 깨져야 한다.
 */

import { describe, expect, test } from 'vitest';
import { computeMeanWithSquaredSum, computeSquaredSum } from '../../../src/statistics/mean-squared-sum.internal';

type Outcome = { kind: 'value'; value: number } | { kind: 'error'; name: string; message: string };

/**
 * fn 호출 결과를 값 또는 에러(name, message)로 정리한다.
 *
 * 값 비교는 Object.is로 하므로 호출부에서 NaN과 -0을 구분한다.
 */
function capture(fn: () => number): Outcome {
  try {
    return { kind: 'value', value: fn() };
  } catch (error) {
    const e = error as Error;
    return { kind: 'error', name: e.name, message: e.message };
  }
}

function expectSameOutcome(values: readonly number[]): Outcome {
  const squaredOnly = capture(() => computeSquaredSum(values));
  const withDeltas = capture(() => computeMeanWithSquaredSum(values).squaredSum);
  if (squaredOnly.kind === 'value' && withDeltas.kind === 'value') {
    expect(Object.is(squaredOnly.value, withDeltas.value)).toBe(true);
  } else {
    expect(squaredOnly).toEqual(withDeltas);
  }
  return squaredOnly;
}

describe('statistics mean-squared-sum.internal — computeSquaredSum', () => {
  test('정상 입력에서 computeMeanWithSquaredSum의 squaredSum과 같다', () => {
    const cases: number[][] = [
      [1, 2, 3, 4],
      [5],
      [0.1, 0.2, 0.3, 0.4, 0.5],
      [-3.5, 2.25, 1e-7, 4096, -0.001],
      [-0, -0],
      [0, -0],
      Array.from({ length: 1000 }, (_, i) => Math.sin(i) * 100 + i * 0.01),
    ];
    for (const values of cases) {
      const outcome = expectSameOutcome(values);
      expect(outcome.kind).toBe('value');
    }
  });

  test('모든 entry가 같으면 +0을 반환한다', () => {
    const outcome = expectSameOutcome([-0, -0, -0]);
    expect(outcome).toEqual({ kind: 'value', value: 0 });
    expect(Object.is((outcome as { value: number }).value, 0)).toBe(true);
  });

  test('비유한 entry에서 같은 RangeError를 던진다', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const outcome = expectSameOutcome([1, 2, bad, 4]);
      expect(outcome).toEqual({
        kind: 'error',
        name: 'RangeError',
        message: `values[2] must be a finite number, got ${String(bad)}`,
      });
    }
  });

  test('누적 sum이 오버플로하면 같은 RangeError를 던진다', () => {
    const outcome = expectSameOutcome([1.7e308, 1.7e308]);
    expect(outcome.kind).toBe('error');
    if (outcome.kind === 'error') {
      expect(outcome.name).toBe('RangeError');
      expect(outcome.message).toContain('values sum must be finite');
    }
  });

  test('delta 제곱이 오버플로하면 같은 RangeError를 던진다', () => {
    const outcome = expectSameOutcome([1e200, -1e200]);
    expect(outcome.kind).toBe('error');
    if (outcome.kind === 'error') {
      expect(outcome.name).toBe('RangeError');
      expect(outcome.message).toContain('squared delta at index 0 must be finite');
    }
  });

  test('centered delta가 오버플로하면 같은 RangeError를 던진다', () => {
    // sum = -1.7e308, mean = -5.67e307, delta[0] = 1.7e308 + 5.67e307 > Number.MAX_VALUE.
    const outcome = expectSameOutcome([1.7e308, -1.7e308, -1.7e308]);
    expect(outcome).toEqual({
      kind: 'error',
      name: 'RangeError',
      message: 'centered entry at index 0 must be finite, got Infinity',
    });
  });

  test('제곱합 누적이 오버플로하면 같은 RangeError를 던진다', () => {
    const values = Array.from({ length: 4 }, (_, i) => (i % 2 === 0 ? 1e154 : -1e154));
    const outcome = expectSameOutcome(values);
    expect(outcome.kind).toBe('error');
    if (outcome.kind === 'error') {
      expect(outcome.message).toContain('squared sum must be finite');
    }
  });
});
