/**
 * grid cell center/bounds(gridCellCenter* / gridCellBounds*) 계약 테스트.
 *
 * default/custom origin과 square/rectangular cell center, negative cell, bounds x/y/width/height
 * 기록, tuple cell input, tuple/object XYWritable output, out subtype 반환 보존, non-integer cell /
 * invalid cellSize / non-finite origin / computed non-finite RangeError, companion plain object 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { gridCellBounds } from '../../../src/grid/grid-cell-bounds';
import { gridCellBoundsInto } from '../../../src/grid/grid-cell-bounds-into';
import { gridCellCenter } from '../../../src/grid/grid-cell-center';
import { gridCellCenterInto } from '../../../src/grid/grid-cell-center-into';
import type { RectWritable, XYObjectWritable, XYTupleWritable } from '../../../src/types';

/** x/y object storage를 가진 새 XYObjectWritable seed를 만든다. */
function makeXY(): XYObjectWritable {
  return { x: 0, y: 0 };
}

/** rect storage를 가진 새 RectWritable seed를 만든다. */
function makeRect(): RectWritable {
  return { x: 0, y: 0, width: 0, height: 0 };
}

describe('gridCellCenterInto - cell coordinate를 world center로 변환', () => {
  test('default origin square cell의 center를 기록한다', () => {
    const out = makeXY();
    const result = gridCellCenterInto(out, { col: 2, row: 3 }, { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 25, y: 35 });
  });

  test('custom origin rectangular cell의 center를 기록한다', () => {
    const out = makeXY();
    gridCellCenterInto(out, { col: 1, row: 2 }, { origin: { x: 5, y: 1 }, cellSize: { x: 10, y: 4 } });
    expect(out).toEqual({ x: 20, y: 11 });
  });

  test('negative cell의 center를 기록한다', () => {
    const out = makeXY();
    gridCellCenterInto(out, { col: -1, row: -2 }, { cellSize: 10 });
    expect(out).toEqual({ x: -5, y: -15 });
  });

  test('tuple cell input을 object cell과 동일하게 처리한다', () => {
    const out = makeXY();
    gridCellCenterInto(out, [2, 3], { cellSize: 10 });
    expect(out).toEqual({ x: 25, y: 35 });
  });

  test('tuple XYWritable output에 기록하고 같은 ref를 반환한다', () => {
    const out: XYTupleWritable = [0, 0];
    const result = gridCellCenterInto(out, { col: 2, row: 3 }, { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual([25, 35]);
  });

  test.each([
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('non-integer/non-finite cell col %s는 RangeError다', (col) => {
    expect(() => gridCellCenterInto(makeXY(), { col, row: 0 }, { cellSize: 10 })).toThrow(RangeError);
  });

  test('invalid cellSize는 RangeError다', () => {
    expect(() => gridCellCenterInto(makeXY(), { col: 1, row: 1 }, { cellSize: 0 })).toThrow(RangeError);
  });

  test('non-finite origin은 RangeError다', () => {
    expect(() =>
      gridCellCenterInto(makeXY(), { col: 1, row: 1 }, { origin: { x: Number.POSITIVE_INFINITY, y: 0 }, cellSize: 10 })
    ).toThrow(RangeError);
  });

  test('계산된 center coordinate가 non-finite이면 RangeError이고 out을 수정하지 않는다', () => {
    const out: XYObjectWritable = { x: -7, y: -9 };
    expect(() => gridCellCenterInto(out, { col: Number.MAX_VALUE, row: 0 }, { cellSize: 2 })).toThrow(RangeError);
    expect(out).toEqual({ x: -7, y: -9 });
  });
});

describe('gridCellCenter - allocating companion', () => {
  test('새 plain { x, y } object를 반환한다', () => {
    expect(gridCellCenter({ col: 2, row: 3 }, { cellSize: 10 })).toEqual({ x: 25, y: 35 });
  });

  test('companion도 non-integer cell에서 RangeError다', () => {
    expect(() => gridCellCenter({ col: 0.5, row: 0 }, { cellSize: 10 })).toThrow(RangeError);
  });
});

describe('gridCellBoundsInto - cell coordinate를 rect region으로 변환', () => {
  test('default origin square cell의 bounds를 기록한다', () => {
    const out = makeRect();
    const result = gridCellBoundsInto(out, { col: 2, row: 3 }, { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 20, y: 30, width: 10, height: 10 });
  });

  test('custom origin rectangular cell의 bounds를 기록한다', () => {
    const out = makeRect();
    gridCellBoundsInto(out, { col: 1, row: 2 }, { origin: { x: 5, y: 1 }, cellSize: { x: 10, y: 4 } });
    expect(out).toEqual({ x: 15, y: 9, width: 10, height: 4 });
  });

  test('negative cell의 bounds를 기록한다', () => {
    const out = makeRect();
    gridCellBoundsInto(out, { col: -1, row: -2 }, { cellSize: 10 });
    expect(out).toEqual({ x: -10, y: -20, width: 10, height: 10 });
  });

  test('tuple cell input을 object cell과 동일하게 처리한다', () => {
    const out = makeRect();
    gridCellBoundsInto(out, [2, 3], { cellSize: 10 });
    expect(out).toEqual({ x: 20, y: 30, width: 10, height: 10 });
  });

  test.each([2.5, Number.NaN, Number.POSITIVE_INFINITY])('non-integer/non-finite cell row %s는 RangeError다', (row) => {
    expect(() => gridCellBoundsInto(makeRect(), { col: 0, row }, { cellSize: 10 })).toThrow(RangeError);
  });

  test('invalid cellSize는 RangeError다', () => {
    expect(() => gridCellBoundsInto(makeRect(), { col: 1, row: 1 }, { cellSize: { x: -1, y: 10 } })).toThrow(
      RangeError
    );
  });

  test('계산된 min corner가 non-finite이면 RangeError이고 out을 수정하지 않는다', () => {
    const out: RectWritable = { x: -7, y: -9, width: 3, height: 4 };
    expect(() => gridCellBoundsInto(out, { col: Number.MAX_VALUE, row: 0 }, { cellSize: 2 })).toThrow(RangeError);
    expect(out).toEqual({ x: -7, y: -9, width: 3, height: 4 });
  });
});

describe('gridCellBounds - allocating companion', () => {
  test('새 plain rect object를 반환한다', () => {
    expect(gridCellBounds({ col: 2, row: 3 }, { cellSize: 10 })).toEqual({ x: 20, y: 30, width: 10, height: 10 });
  });
});
