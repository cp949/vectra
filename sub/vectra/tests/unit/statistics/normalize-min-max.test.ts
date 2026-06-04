/**
 * statistics normalizeMinMax / normalizeMinMaxInto — S9-RM-011 unit tests.
 */

import { describe, expect, test } from 'vitest';
import { normalizeMinMax } from '../../../src/statistics/normalize-min-max';
import { normalizeMinMaxInto } from '../../../src/statistics/normalize-min-max-into';

// ---------------------------------------------------------------------------
// normalizeMinMax / normalizeMinMaxInto
// ---------------------------------------------------------------------------

describe('normalizeMinMax — default [0, 1]', () => {
  test('[2, 4, 6] → [0, 0.5, 1]', () => {
    expect(normalizeMinMax([2, 4, 6])).toEqual([0, 0.5, 1]);
  });

  test('음수가 포함된 데이터', () => {
    expect(normalizeMinMax([-1, 0, 1])).toEqual([0, 0.5, 1]);
  });

  test('정렬되지 않은 데이터', () => {
    expect(normalizeMinMax([6, 2, 4])).toEqual([1, 0, 0.5]);
  });
});

describe('normalizeMinMax — custom range', () => {
  test('range: [10, 20]', () => {
    expect(normalizeMinMax([0, 5, 10], { range: [10, 20] })).toEqual([10, 15, 20]);
  });

  test('range: [-1, 1]', () => {
    expect(normalizeMinMax([0, 0.5, 1], { range: [-1, 1] })).toEqual([-1, 0, 1]);
  });
});

describe('normalizeMinMax — zero input range', () => {
  test('max === min은 targetMin으로 fill', () => {
    expect(normalizeMinMax([5, 5, 5])).toEqual([0, 0, 0]);
    expect(normalizeMinMax([5, 5, 5], { range: [10, 20] })).toEqual([10, 10, 10]);
  });

  test('single value는 targetMin', () => {
    expect(normalizeMinMax([7])).toEqual([0]);
    expect(normalizeMinMax([7], { range: [-1, 1] })).toEqual([-1]);
  });
});

describe('normalizeMinMax — empty input', () => {
  test('빈 배열은 [] no-op', () => {
    expect(normalizeMinMax([])).toEqual([]);
    expect(normalizeMinMax([], { range: [-1, 1] })).toEqual([]);
  });
});

describe('normalizeMinMax — invalid input', () => {
  test('non-array는 TypeError', () => {
    expect(() => normalizeMinMax(null as unknown as readonly number[])).toThrow(TypeError);
    expect(() => normalizeMinMax('abc' as unknown as readonly number[])).toThrow(TypeError);
  });

  test('entry non-finite는 RangeError', () => {
    expect(() => normalizeMinMax([1, Number.NaN, 3])).toThrow(RangeError);
    expect(() => normalizeMinMax([Number.POSITIVE_INFINITY, 1])).toThrow(RangeError);
  });

  test('range length != 2 또는 min >= max는 RangeError', () => {
    expect(() => normalizeMinMax([0, 1], { range: [0] as unknown as readonly [number, number] })).toThrow(RangeError);
    expect(() => normalizeMinMax([0, 1], { range: [5, 5] })).toThrow(RangeError);
    expect(() => normalizeMinMax([0, 1], { range: [10, 1] })).toThrow(RangeError);
  });

  test('range entry non-finite는 RangeError', () => {
    expect(() => normalizeMinMax([0, 1], { range: [0, Number.POSITIVE_INFINITY] })).toThrow(RangeError);
    expect(() => normalizeMinMax([0, 1], { range: [Number.NaN, 1] })).toThrow(RangeError);
  });

  test('옵션 검증은 빈 입력에서도 fail-fast', () => {
    expect(() => normalizeMinMax([], { range: [5, 5] })).toThrow(RangeError);
  });

  test('overflow input span은 RangeError', () => {
    expect(() => normalizeMinMax([-Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
  });
});

describe('normalizeMinMaxInto — atomicity / aliasing', () => {
  test('validation 실패 시 out 미수정', () => {
    const out = [9, 9, 9];
    expect(() => normalizeMinMaxInto(out, [1, Number.NaN, 3])).toThrow(RangeError);
    expect(out).toEqual([9, 9, 9]);
  });

  test('out === values aliasing 안전', () => {
    const arr = [2, 4, 6];
    normalizeMinMaxInto(arr, arr);
    expect(arr).toEqual([0, 0.5, 1]);
  });

  test('정상 호출은 out 반환', () => {
    const out: number[] = [];
    const ret = normalizeMinMaxInto(out, [0, 10], { range: [-1, 1] });
    expect(ret).toBe(out);
    expect(out).toEqual([-1, 1]);
  });
});

describe('normalizeMinMax — signed zero', () => {
  test('결과 entry의 -0은 0으로 canonicalize', () => {
    // [-2, 0]을 [0, 1]로 정규화: [(-2 - -2) / 2 = 0, (0 - -2) / 2 = 1]
    const result = normalizeMinMax([-2, 0]);
    expect(Object.is(result[0], 0)).toBe(true);
    expect(Object.is(result[0], -0)).toBe(false);
  });
});
