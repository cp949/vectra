/**
 * normalize(Into) Euclidean 단위 벡터 변환 unit test.
 *
 * normalizeInto boolean primary 정책, zero vector false 반환 + 미수정,
 * out capacity 부족 + 원자성, out truncate, aliasing, non-finite entry,
 * options.p 차수 변경, huge magnitude scaled normalize,
 * companion undefined 반환 정책을 고정한다.
 */

import { describe, expect, test } from 'vitest';
import { normalize } from '../../../src/linalg/normalize';
import { normalizeInto } from '../../../src/linalg/normalize-into';

describe('normalizeInto — Euclidean default normalize (Into, boolean primary)', () => {
  test('3-4-5 벡터를 단위 벡터로 정규화하고 true를 반환한다', () => {
    const out: number[] = [0, 0];
    const ok = normalizeInto(out, [3, 4]);
    expect(ok).toBe(true);
    expect(out).toEqual([3 / 5, 4 / 5]);
  });

  test('zero vector는 false를 반환하고 out을 수정하지 않는다', () => {
    const out = [9, 9, 9];
    const ok = normalizeInto(out, [0, 0, 0]);
    expect(ok).toBe(false);
    expect(out).toEqual([9, 9, 9]);
  });

  test('out 길이가 vector보다 작으면 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9];
    expect(() => normalizeInto(out, [3, 4])).toThrow(RangeError);
    expect(out).toEqual([9]);
  });

  test('out 길이가 vector보다 크면 vector 길이로 truncate한다', () => {
    const out = [9, 9, 9, 9, 9];
    normalizeInto(out, [3, 4]);
    expect(out).toEqual([3 / 5, 4 / 5]);
  });

  test('out이 vector와 같은 array여도 안전하게 정규화한다', () => {
    const v = [3, 4];
    const ok = normalizeInto(v, v);
    expect(ok).toBe(true);
    expect(v).toEqual([3 / 5, 4 / 5]);
  });

  test('non-finite entry는 RangeError를 던지고 out을 수정하지 않는다', () => {
    const out = [9, 9];
    expect(() => normalizeInto(out, [Number.NaN, 1])).toThrow(RangeError);
    expect(out).toEqual([9, 9]);
  });

  test('options.p = 1로 ℓ1 정규화를 수행한다', () => {
    const out: number[] = [0, 0, 0];
    normalizeInto(out, [1, 1, 2], { p: 1 });
    expect(out).toEqual([0.25, 0.25, 0.5]);
  });

  test('options.p 자체가 invalid면 RangeError', () => {
    expect(() => normalizeInto([], [1, 2], { p: 0 })).toThrow(RangeError);
    expect(() => normalizeInto([], [1, 2], { p: Number.NaN })).toThrow(RangeError);
    expect(() => normalizeInto([], [1, 2], { p: Number.POSITIVE_INFINITY })).toThrow(RangeError);
  });

  test('huge magnitude 입력도 scaled normalize로 finite 단위 벡터를 반환한다', () => {
    const out: number[] = [0, 0];
    const ok = normalizeInto(out, [Number.MAX_VALUE, Number.MAX_VALUE]);
    expect(ok).toBe(true);
    expect(out[0]).toBeCloseTo(Math.SQRT1_2, 12);
    expect(out[1]).toBeCloseTo(Math.SQRT1_2, 12);
  });
});

describe('normalize — Euclidean default normalize (companion)', () => {
  test('정상 vector는 단위 벡터를 새 number[]로 반환한다', () => {
    expect(normalize([3, 4])).toEqual([3 / 5, 4 / 5]);
  });

  test('zero vector는 undefined를 반환한다', () => {
    expect(normalize([0, 0, 0])).toBeUndefined();
  });

  test('빈 vector는 undefined를 반환한다(zero norm)', () => {
    expect(normalize([])).toBeUndefined();
  });

  test('options.p로 정규화 차수를 바꿀 수 있다', () => {
    expect(normalize([1, 1, 2], { p: 1 })).toEqual([0.25, 0.25, 0.5]);
  });

  test('non-finite entry는 RangeError', () => {
    expect(() => normalize([1, Number.NaN])).toThrow(RangeError);
  });

  test('p가 invalid하면 RangeError', () => {
    expect(() => normalize([1, 2], { p: 0 })).toThrow(RangeError);
  });
});
