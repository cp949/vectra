import { describe, expect, test } from 'vitest';
import { lerpArray } from '../../../src/interpolation/lerp-array';
import { lerpArrayInto } from '../../../src/interpolation/lerp-array-into';
import { sampleParameters } from '../../../src/interpolation/sample-parameters';
import { sampleParametersInto } from '../../../src/interpolation/sample-parameters-into';

describe('interpolation.sampleParameters — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const out: number[] = [];
    sampleParametersInto(out, 5);
    expect(sampleParameters(5)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = sampleParameters(5);
    const result2 = sampleParameters(5);
    expect(result1).not.toBe(result2);
  });

  test('count=2이면 [0, 1]을 반환한다', () => {
    expect(sampleParameters(2)).toEqual([0, 1]);
  });

  test('count=5이면 5개 균등 분포 값을 반환한다', () => {
    const result = sampleParameters(5);
    expect(result).toHaveLength(5);
    expect(result[0]).toBe(0);
    expect(result[4]).toBe(1);
    expect(result[2]).toBeCloseTo(0.5, 10);
  });

  test('count < 2이면 RangeError를 던진다', () => {
    expect(() => sampleParameters(1)).toThrow(RangeError);
    expect(() => sampleParameters(0)).toThrow(RangeError);
  });
});

describe('interpolation.lerpArray — 새 배열 반환', () => {
  test('Into와 동일한 결과를 반환한다', () => {
    const out: number[] = [];
    lerpArrayInto(out, [0, 10, 20], [2, 12, 22], 0.5);
    expect(lerpArray([0, 10, 20], [2, 12, 22], 0.5)).toEqual(out);
  });

  test('새 배열을 반환한다', () => {
    const result1 = lerpArray([0, 10], [2, 12], 0.5);
    const result2 = lerpArray([0, 10], [2, 12], 0.5);
    expect(result1).not.toBe(result2);
  });

  test('t=0이면 a를 반환한다', () => {
    expect(lerpArray([1, 2, 3], [4, 5, 6], 0)).toEqual([1, 2, 3]);
  });

  test('t=1이면 b를 반환한다', () => {
    expect(lerpArray([1, 2, 3], [4, 5, 6], 1)).toEqual([4, 5, 6]);
  });

  test('t=0.5이면 중간값을 반환한다', () => {
    const result = lerpArray([0, 0, 0], [2, 4, 6], 0.5);
    expect(result).toEqual([1, 2, 3]);
  });

  test('빈 배열은 빈 배열을 반환한다', () => {
    expect(lerpArray([], [], 0.5)).toEqual([]);
  });

  test('길이가 다르면 RangeError를 던진다', () => {
    expect(() => lerpArray([1, 2], [1], 0.5)).toThrow(RangeError);
  });

  test('non-finite t이면 RangeError를 던진다', () => {
    expect(() => lerpArray([1], [2], NaN)).toThrow(RangeError);
    expect(() => lerpArray([1], [2], Infinity)).toThrow(RangeError);
  });
});
