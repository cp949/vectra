/**
 * grid index/coordinates(gridIndex / gridCoordinates*) 계약 테스트.
 *
 * row-major flat index 변환, tuple cell input, index→col/row 역변환, out subtype 반환 보존,
 * col/row/index non-negative safe integer guard, columnCount positive integer guard, safe integer
 * overflow RangeError, 실패 시 out 미수정 atomicity, companion plain object 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { gridCoordinates } from '../../../src/grid/grid-coordinates';
import { gridCoordinatesInto } from '../../../src/grid/grid-coordinates-into';
import { gridIndex } from '../../../src/grid/grid-index';
import type { GridCellWritable } from '../../../src/types';

/** col/row object storage를 가진 새 GridCellWritable seed를 만든다. */
function makeCell(): GridCellWritable {
  return { col: 0, row: 0 };
}

describe('gridIndex - col/row를 flat index로 변환', () => {
  test('cell { col: 2, row: 3 }, columnCount 10은 index 32다', () => {
    expect(gridIndex({ col: 2, row: 3 }, 10)).toBe(32);
  });

  test('tuple cell input을 object cell과 동일하게 처리한다', () => {
    expect(gridIndex([2, 3], 10)).toBe(32);
  });

  test('첫 cell { col: 0, row: 0 }은 index 0이다', () => {
    expect(gridIndex({ col: 0, row: 0 }, 10)).toBe(0);
  });

  test.each([
    -1,
    0.5,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('cell col %s는 RangeError다', (col) => {
    expect(() => gridIndex({ col, row: 0 }, 10)).toThrow(RangeError);
  });

  test.each([-1, 2.5, Number.NaN, Number.POSITIVE_INFINITY])('cell row %s는 RangeError다', (row) => {
    expect(() => gridIndex({ col: 0, row }, 10)).toThrow(RangeError);
  });

  test('cell col이 columnCount 이상이면 RangeError다', () => {
    expect(() => gridIndex({ col: 10, row: 0 }, 10)).toThrow(RangeError);
  });

  test.each([0, -10, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('columnCount %s는 RangeError다', (columnCount) => {
    expect(() => gridIndex({ col: 1, row: 1 }, columnCount)).toThrow(RangeError);
  });

  test('safe integer를 벗어나는 index는 RangeError다', () => {
    expect(() => gridIndex({ col: 0, row: Number.MAX_SAFE_INTEGER }, 10)).toThrow(RangeError);
  });
});

describe('gridCoordinatesInto - flat index를 col/row로 변환', () => {
  test('index 32, columnCount 10은 { col: 2, row: 3 }이다', () => {
    const out = makeCell();
    const result = gridCoordinatesInto(out, 32, 10);
    expect(result).toBe(out);
    expect(out).toEqual({ col: 2, row: 3 });
  });

  test('index 0은 { col: 0, row: 0 }이다', () => {
    const out = makeCell();
    gridCoordinatesInto(out, 0, 10);
    expect(out).toEqual({ col: 0, row: 0 });
  });

  test('gridIndex와 round-trip한다', () => {
    const index = gridIndex({ col: 7, row: 4 }, 12);
    const out = makeCell();
    gridCoordinatesInto(out, index, 12);
    expect(out).toEqual({ col: 7, row: 4 });
  });

  test.each([
    -1,
    0.5,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('index %s는 RangeError다', (index) => {
    expect(() => gridCoordinatesInto(makeCell(), index, 10)).toThrow(RangeError);
  });

  test.each([0, -10, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('columnCount %s는 RangeError다', (columnCount) => {
    expect(() => gridCoordinatesInto(makeCell(), 32, columnCount)).toThrow(RangeError);
  });

  test('실패 시 out을 수정하지 않는다', () => {
    const out: GridCellWritable = { col: -7, row: -9 };
    expect(() => gridCoordinatesInto(out, -1, 10)).toThrow(RangeError);
    expect(out).toEqual({ col: -7, row: -9 });
  });
});

describe('gridCoordinates - allocating companion', () => {
  test('새 plain { col, row } object를 반환한다', () => {
    expect(gridCoordinates(32, 10)).toEqual({ col: 2, row: 3 });
  });

  test('companion도 invalid columnCount에서 RangeError다', () => {
    expect(() => gridCoordinates(32, 0)).toThrow(RangeError);
  });
});
