/**
 * bounds grid split(boundsSplitGridInto / boundsSplitGrid) 계약 테스트.
 *
 * rows x cols 균등 분할 row-major rect collection, rectangular bounds와 non-zero min, 마지막
 * row/col edge가 source max와 일치, zero-width/height bounds의 rows*cols zero-extent rect,
 * invalid rows/cols / inverted / non-finite bounds RangeError, Into 같은 array ref 반환과 성공 시
 * content 교체, validation 실패 시 out 미수정, companion 새 plain array 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { boundsSplitGrid } from '../../../src/grid/bounds-split-grid';
import { boundsSplitGridInto } from '../../../src/grid/bounds-split-grid-into';
import type { RectWritable } from '../../../src/types';

describe('boundsSplitGridInto - bounds를 rows x cols로 균등 분할', () => {
  test('2 rows x 3 cols에서 6개 rect를 row-major로 기록한다', () => {
    const out: RectWritable[] = [];
    const result = boundsSplitGridInto(out, { min: { x: 0, y: 0 }, max: { x: 30, y: 20 } }, 2, 3);
    expect(result).toBe(out);
    expect(out).toEqual([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
      { x: 20, y: 0, width: 10, height: 10 },
      { x: 0, y: 10, width: 10, height: 10 },
      { x: 10, y: 10, width: 10, height: 10 },
      { x: 20, y: 10, width: 10, height: 10 },
    ]);
  });

  test('rectangular bounds와 non-zero min을 분할한다', () => {
    const out: RectWritable[] = [];
    boundsSplitGridInto(out, { min: { x: 5, y: 5 }, max: { x: 25, y: 15 } }, 2, 2);
    expect(out).toEqual([
      { x: 5, y: 5, width: 10, height: 5 },
      { x: 15, y: 5, width: 10, height: 5 },
      { x: 5, y: 10, width: 10, height: 5 },
      { x: 15, y: 10, width: 10, height: 5 },
    ]);
  });

  test('tuple bounds input을 object bounds와 동일하게 처리한다', () => {
    const out: RectWritable[] = [];
    boundsSplitGridInto(
      out,
      [
        [0, 0],
        [20, 10],
      ],
      1,
      2
    );
    expect(out).toEqual([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
    ]);
  });

  test('마지막 col/row edge가 source max와 정확히 일치한다', () => {
    const out: RectWritable[] = [];
    boundsSplitGridInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, 3, 3);
    const last = out[out.length - 1];
    expect(last.x + last.width).toBe(10);
    expect(last.y + last.height).toBe(10);
  });

  test('large finite extent를 3개 이상으로 나눠도 internal edge가 finite다', () => {
    const out: RectWritable[] = [];
    boundsSplitGridInto(out, { min: { x: 0, y: 0 }, max: { x: Number.MAX_VALUE, y: 3 } }, 1, 3);
    expect(out).toHaveLength(3);
    for (const rect of out) {
      expect(Number.isFinite(rect.x)).toBe(true);
      expect(Number.isFinite(rect.width)).toBe(true);
      expect(Number.isFinite(rect.y)).toBe(true);
      expect(Number.isFinite(rect.height)).toBe(true);
    }
    const last = out[out.length - 1];
    expect(last.x + last.width).toBe(Number.MAX_VALUE);
  });

  test('zero-width bounds는 rows*cols개의 zero-width rect를 반환한다', () => {
    const out: RectWritable[] = [];
    boundsSplitGridInto(out, { min: { x: 0, y: 0 }, max: { x: 0, y: 10 } }, 1, 2);
    expect(out).toEqual([
      { x: 0, y: 0, width: 0, height: 10 },
      { x: 0, y: 0, width: 0, height: 10 },
    ]);
  });

  test.each([
    0,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])('invalid rows %s는 RangeError다', (rows) => {
    expect(() => boundsSplitGridInto([], { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, rows, 2)).toThrow(RangeError);
  });

  test.each([0, -1, 2.5, Number.NaN, Number.NEGATIVE_INFINITY])('invalid cols %s는 RangeError다', (cols) => {
    expect(() => boundsSplitGridInto([], { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, 2, cols)).toThrow(RangeError);
  });

  test('inverted bounds는 RangeError다', () => {
    expect(() => boundsSplitGridInto([], { min: { x: 10, y: 0 }, max: { x: 0, y: 10 } }, 2, 2)).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY])('non-finite bounds 성분 %s는 RangeError다', (bad) => {
    expect(() => boundsSplitGridInto([], { min: { x: bad, y: 0 }, max: { x: 10, y: 10 } }, 2, 2)).toThrow(RangeError);
  });

  test('Into는 같은 array ref를 반환하고 성공 시 기존 content를 교체한다', () => {
    const out: RectWritable[] = [{ x: 7, y: 7, width: 7, height: 7 }];
    const result = boundsSplitGridInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, 1, 1);
    expect(result).toBe(out);
    expect(out).toEqual([{ x: 0, y: 0, width: 10, height: 10 }]);
  });

  test('validation 실패 시 out을 수정하지 않는다', () => {
    const out: RectWritable[] = [{ x: 7, y: 7, width: 7, height: 7 }];
    expect(() => boundsSplitGridInto(out, { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, 0, 2)).toThrow(RangeError);
    expect(out).toEqual([{ x: 7, y: 7, width: 7, height: 7 }]);
  });
});

describe('boundsSplitGrid - allocating companion', () => {
  test('새 plain rect 배열을 반환한다', () => {
    expect(boundsSplitGrid({ min: { x: 0, y: 0 }, max: { x: 20, y: 10 } }, 1, 2)).toEqual([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
    ]);
  });

  test('companion도 invalid cols에서 RangeError다', () => {
    expect(() => boundsSplitGrid({ min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }, 2, 0)).toThrow(RangeError);
  });
});
