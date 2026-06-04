/**
 * statistics digitize / digitizeInto / bincount / bincountInto — S9-RM-011 unit tests.
 */

import { describe, expect, test } from 'vitest';
import { bincount } from '../../../src/statistics/bincount';
import { bincountInto } from '../../../src/statistics/bincount-into';
import { digitize } from '../../../src/statistics/digitize';
import { digitizeInto } from '../../../src/statistics/digitize-into';
import { histogram } from '../../../src/statistics/histogram';

// ---------------------------------------------------------------------------
// digitize / digitizeInto
// ---------------------------------------------------------------------------

describe('digitize — half-open mapping', () => {
  test('각 value의 bin index', () => {
    const idx = digitize([0, 0.5, 1, 1.999, 2, 4], [0, 2, 4]);
    // [0,2): 0,0.5,1,1.999 → 0  /  [2,4]: 2,4 → 1
    expect(idx).toEqual([0, 0, 0, 0, 1, 1]);
  });

  test('마지막 bin은 right-inclusive', () => {
    expect(digitize([10], [0, 5, 10])).toEqual([1]);
  });

  test('out-of-range는 RangeError', () => {
    expect(() => digitize([-1], [0, 1, 2])).toThrow(RangeError);
    expect(() => digitize([3], [0, 1, 2])).toThrow(RangeError);
  });

  test('histogram count와 digitize index가 일관성', () => {
    const values = [0.5, 1.5, 2.5, 3.5, 4.5];
    const binEdges = [0, 1, 2, 3, 4, 5];
    const indices = digitize(values, binEdges);
    const hist = histogram(values, { bins: binEdges });
    const recomputed = new Array<number>(binEdges.length - 1).fill(0);
    for (const i of indices) recomputed[i]++;
    expect(recomputed).toEqual(hist.counts);
  });
});

describe('digitizeInto — atomicity / aliasing', () => {
  test('validation 실패 시 out 미수정', () => {
    const out = [9, 9];
    expect(() => digitizeInto(out, [-1], [0, 1, 2])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('out === values aliasing 안전', () => {
    const arr = [0.5, 1.5, 2.5];
    digitizeInto(arr, arr, [0, 1, 2, 3]);
    expect(arr).toEqual([0, 1, 2]);
  });

  test('binEdges 검증 실패는 RangeError, out 미수정', () => {
    const out = [9];
    expect(() => digitizeInto(out, [0], [0, 0, 1])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('out === binEdges aliasing 안전', () => {
    // out과 binEdges가 같은 배열이어도 매 iteration의 findBinIndex는 binEdges에서만 읽고,
    // commit은 마지막 단계 한 번만 out에 push한다. binEdges 길이 3 → bin index 2개 출력.
    const arr = [0, 5, 10];
    digitizeInto(arr, [1, 6], arr);
    expect(arr).toEqual([0, 1]);
  });
});

// ---------------------------------------------------------------------------
// bincount / bincountInto
// ---------------------------------------------------------------------------

describe('bincount — basic', () => {
  test('bincount([0, 2, 2]) -> [1, 0, 2]', () => {
    expect(bincount([0, 2, 2])).toEqual([1, 0, 2]);
  });

  test('빈 labels는 minLength 미지정 시 []', () => {
    expect(bincount([])).toEqual([]);
  });

  test('빈 labels + minLength', () => {
    expect(bincount([], { minLength: 3 })).toEqual([0, 0, 0]);
  });

  test('minLength가 maxLabel + 1보다 크면 minLength 적용', () => {
    expect(bincount([0, 1, 1], { minLength: 5 })).toEqual([1, 2, 0, 0, 0]);
  });

  test('minLength가 maxLabel + 1보다 작아도 maxLabel + 1로 확장', () => {
    expect(bincount([5], { minLength: 2 })).toEqual([0, 0, 0, 0, 0, 1]);
  });
});

describe('bincount — invalid input', () => {
  test('non-array는 TypeError', () => {
    expect(() => bincount(null as unknown as readonly number[])).toThrow(TypeError);
  });

  test('음수 label은 RangeError', () => {
    expect(() => bincount([0, -1, 2])).toThrow(RangeError);
  });

  test('non-integer label은 RangeError', () => {
    expect(() => bincount([0, 1.5, 2])).toThrow(RangeError);
  });

  test('NaN label은 RangeError', () => {
    expect(() => bincount([0, Number.NaN])).toThrow(RangeError);
  });

  test('Infinity label은 RangeError', () => {
    expect(() => bincount([0, Number.POSITIVE_INFINITY])).toThrow(RangeError);
  });

  test('Number.MAX_SAFE_INTEGER + 1은 RangeError (safe integer 위반)', () => {
    expect(() => bincount([Number.MAX_SAFE_INTEGER + 1])).toThrow(RangeError);
  });

  test('minLength 위반은 RangeError', () => {
    expect(() => bincount([0], { minLength: -1 })).toThrow(RangeError);
    expect(() => bincount([0], { minLength: 1.5 })).toThrow(RangeError);
    expect(() => bincount([0], { minLength: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('minLength가 number가 아니면 TypeError (타입 위반은 TypeError)', () => {
    expect(() => bincount([0], { minLength: '5' as unknown as number })).toThrow(TypeError);
    expect(() => bincount([0], { minLength: null as unknown as number })).toThrow(TypeError);
  });

  test('label이 number가 아니면 TypeError (타입 위반은 TypeError)', () => {
    expect(() => bincount(['0' as unknown as number, 1])).toThrow(TypeError);
    expect(() => bincount([0, null as unknown as number])).toThrow(TypeError);
  });
});

describe('bincountInto — atomicity / aliasing', () => {
  test('validation 실패 시 out 미수정', () => {
    const out = [9, 9];
    expect(() => bincountInto(out, [0, -1])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('out === labels aliasing 안전', () => {
    const arr = [0, 2, 2];
    bincountInto(arr, arr);
    expect(arr).toEqual([1, 0, 2]);
  });

  test('정상 호출은 out 반환', () => {
    const out: number[] = [];
    const ret = bincountInto(out, [1, 1, 3]);
    expect(ret).toBe(out);
    expect(out).toEqual([0, 2, 0, 1]);
  });
});
