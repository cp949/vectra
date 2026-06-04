/**
 * grid rect cell collection(gridCellsInRectInto / gridCellsInRect) 계약 테스트.
 *
 * default/custom origin과 square/rectangular cellSize의 row-major cell list, negative coordinate
 * floor behavior, right/bottom boundary touch exclusion, zero width/height empty, invalid cellSize /
 * non-finite rect·origin / inverted rect / oversized count RangeError, Into 같은 array ref 반환과
 * 성공 시 content 교체, validation 실패 시 out 미수정, companion 새 plain array 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { gridCellsInRect } from '../../../src/grid/grid-cells-in-rect';
import { gridCellsInRectInto } from '../../../src/grid/grid-cells-in-rect-into';
import type { GridCellWritable } from '../../../src/types';

describe('gridCellsInRectInto - world rect가 덮는 cell collection', () => {
  test('default origin square cell에서 row-major cell list를 기록한다', () => {
    const out: GridCellWritable[] = [];
    const result = gridCellsInRectInto(out, { x: 0, y: 0, width: 20, height: 20 }, { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ]);
  });

  test('custom origin과 rectangular cellSize를 축별로 floor한다', () => {
    const out: GridCellWritable[] = [];
    gridCellsInRectInto(
      out,
      { x: 5, y: 2, width: 20, height: 10 },
      { origin: { x: 5, y: 2 }, cellSize: { x: 10, y: 5 } }
    );
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ]);
  });

  test('tuple rect input을 object rect와 동일하게 처리한다', () => {
    const out: GridCellWritable[] = [];
    gridCellsInRectInto(out, [0, 0, 20, 10], { cellSize: 10 });
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
    ]);
  });

  test('negative world coordinate는 truncation이 아니라 floor로 처리한다', () => {
    const out: GridCellWritable[] = [];
    gridCellsInRectInto(out, { x: -15, y: -5, width: 10, height: 10 }, { cellSize: 10 });
    expect(out).toEqual([
      { col: -2, row: -1 },
      { col: -1, row: -1 },
      { col: -2, row: 0 },
      { col: -1, row: 0 },
    ]);
  });

  test('right/bottom boundary touch는 다음 cell을 포함하지 않는다', () => {
    const out: GridCellWritable[] = [];
    gridCellsInRectInto(out, { x: 0, y: 0, width: 10, height: 10 }, { cellSize: 10 });
    expect(out).toEqual([{ col: 0, row: 0 }]);
  });

  test('partial extent는 닿는 cell만 포함한다', () => {
    const out: GridCellWritable[] = [];
    gridCellsInRectInto(out, { x: 5, y: 5, width: 10, height: 10 }, { cellSize: 10 });
    expect(out).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 1 },
      { col: 1, row: 1 },
    ]);
  });

  test.each([
    { x: 0, y: 0, width: 0, height: 10 },
    { x: 0, y: 0, width: 10, height: 0 },
  ])('zero width/height rect는 empty array다', (rect) => {
    const out: GridCellWritable[] = [{ col: 9, row: 9 }];
    const result = gridCellsInRectInto(out, rect, { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual([]);
  });

  test.each([
    0,
    -10,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('cellSize %s는 RangeError다', (cellSize) => {
    expect(() => gridCellsInRectInto([], { x: 0, y: 0, width: 10, height: 10 }, { cellSize })).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('rect 성분 %s는 RangeError다', (bad) => {
    expect(() => gridCellsInRectInto([], { x: bad, y: 0, width: 10, height: 10 }, { cellSize: 10 })).toThrow(
      RangeError
    );
  });

  test('non-finite origin은 RangeError다', () => {
    expect(() =>
      gridCellsInRectInto([], { x: 0, y: 0, width: 10, height: 10 }, { origin: { x: Number.NaN, y: 0 }, cellSize: 10 })
    ).toThrow(RangeError);
  });

  test.each([
    { x: 0, y: 0, width: -10, height: 10 },
    { x: 0, y: 0, width: 10, height: -10 },
  ])('inverted rect %o는 RangeError다', (rect) => {
    expect(() => gridCellsInRectInto([], rect, { cellSize: 10 })).toThrow(RangeError);
  });

  test('safe array length를 넘는 cell count는 RangeError다', () => {
    expect(() =>
      gridCellsInRectInto([], { x: 0, y: 0, width: Number.MAX_VALUE, height: 1 }, { cellSize: Number.MIN_VALUE })
    ).toThrow(RangeError);
  });

  test('computed cell range가 safe integer 범위를 벗어나면 RangeError다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridCellsInRectInto(out, { x: 2 ** 53, y: 0, width: 1, height: 1 }, { cellSize: 1 })).toThrow(
      RangeError
    );
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });

  test('positive extent가 정밀도 손실로 collapse되면 RangeError다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() =>
      gridCellsInRectInto(out, { x: 1_000_000_000_000_000, y: 0, width: 0.01, height: 1 }, { cellSize: 1 })
    ).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });

  test('Into는 같은 array ref를 반환하고 성공 시 기존 content를 교체한다', () => {
    const out: GridCellWritable[] = [
      { col: 7, row: 7 },
      { col: 8, row: 8 },
    ];
    const result = gridCellsInRectInto(out, { x: 0, y: 0, width: 10, height: 10 }, { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual([{ col: 0, row: 0 }]);
  });

  test('validation 실패 시 out을 수정하지 않는다', () => {
    const out: GridCellWritable[] = [{ col: 7, row: 7 }];
    expect(() => gridCellsInRectInto(out, { x: 0, y: 0, width: 10, height: 10 }, { cellSize: 0 })).toThrow(RangeError);
    expect(out).toEqual([{ col: 7, row: 7 }]);
  });
});

describe('gridCellsInRect - allocating companion', () => {
  test('새 plain { col, row }[] 배열을 반환한다', () => {
    expect(gridCellsInRect({ x: 0, y: 0, width: 20, height: 10 }, { cellSize: 10 })).toEqual([
      { col: 0, row: 0 },
      { col: 1, row: 0 },
    ]);
  });

  test('zero width rect는 empty array를 반환한다', () => {
    expect(gridCellsInRect({ x: 0, y: 0, width: 0, height: 10 }, { cellSize: 10 })).toEqual([]);
  });

  test('companion도 invalid cellSize에서 RangeError다', () => {
    expect(() => gridCellsInRect({ x: 0, y: 0, width: 10, height: 10 }, { cellSize: 0 })).toThrow(RangeError);
  });
});
