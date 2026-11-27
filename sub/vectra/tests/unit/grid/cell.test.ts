/**
 * grid cell 변환(gridCellInto / gridCell) 계약 테스트.
 *
 * 원점 (0,0) floor division, 축별 셀 크기, custom origin,
 * negative coordinate floor behavior, positive finite 셀 크기 위반 RangeError, point/origin
 * non-finite RangeError, out subtype 반환 보존, companion plain { col, row } 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { gridCell } from '../../../src/grid/grid-cell';
import { gridCellInto } from '../../../src/grid/grid-cell-into';
import type { GridCellWritable } from '../../../src/types';

/** col/row object storage를 가진 새 GridCellWritable seed를 만든다. */
function makeCell(): GridCellWritable {
  return { col: 0, row: 0 };
}

describe('gridCellInto - world point를 cell coordinate로 변환', () => {
  test('원점 square cell에서 object point를 floor cell로 기록한다', () => {
    const out = makeCell();
    const result = gridCellInto(out, { x: 25, y: 7 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 });
    expect(result).toBe(out);
    expect(out).toEqual({ col: 2, row: 0 });
  });

  test('셀 너비와 높이가 다르면 축별로 floor한다', () => {
    const out = makeCell();
    gridCellInto(out, { x: 25, y: 7 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 5 });
    expect(out).toEqual({ col: 2, row: 1 });
  });

  test('custom origin을 빼고 floor한다', () => {
    const out = makeCell();
    gridCellInto(out, { x: 25, y: 7 }, { originX: 5, originY: 2, cellWidth: 10, cellHeight: 10 });
    expect(out).toEqual({ col: 2, row: 0 });
  });

  test('negative world coordinate는 truncation이 아니라 floor로 처리한다', () => {
    const out = makeCell();
    gridCellInto(out, { x: -1, y: -10 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 });
    expect(out).toEqual({ col: -1, row: -1 });
  });

  test('cell 경계 점은 더 큰 cell에 속한다', () => {
    const out = makeCell();
    gridCellInto(out, { x: 10, y: 20 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 });
    expect(out).toEqual({ col: 1, row: 2 });
  });

  test.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    '셀 크기 %s는 RangeError다',
    (cellSize) => {
      expect(() =>
        gridCellInto(makeCell(), { x: 1, y: 1 }, { originX: 0, originY: 0, cellWidth: cellSize, cellHeight: cellSize })
      ).toThrow(RangeError);
    }
  );

  test('셀 너비와 높이 중 한 축만 invalid여도 RangeError다', () => {
    expect(() =>
      gridCellInto(makeCell(), { x: 1, y: 1 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 0 })
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('point 성분 %s는 RangeError다', (bad) => {
    expect(() =>
      gridCellInto(makeCell(), { x: bad, y: 1 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 })
    ).toThrow(RangeError);
  });

  test('origin 성분이 non-finite이면 RangeError다', () => {
    expect(() =>
      gridCellInto(makeCell(), { x: 1, y: 1 }, { originX: Number.NaN, originY: 0, cellWidth: 10, cellHeight: 10 })
    ).toThrow(RangeError);
  });

  test('origin 필드가 빠진 grid 객체는 원점 0을 가정하지 않고 RangeError다', () => {
    const spec = { cellWidth: 10, cellHeight: 10 };
    expect(() =>
      // @ts-expect-error GridSpec의 originX와 originY는 필수다.
      gridCellInto(makeCell(), { x: 1, y: 1 }, spec)
    ).toThrow(RangeError);
  });

  test('계산된 cell coordinate가 non-finite이면 RangeError이고 out을 수정하지 않는다', () => {
    const out: GridCellWritable = { col: -7, row: -9 };
    expect(() =>
      gridCellInto(
        out,
        { x: Number.MAX_VALUE, y: 0 },
        { originX: 0, originY: 0, cellWidth: Number.MIN_VALUE, cellHeight: Number.MIN_VALUE }
      )
    ).toThrow(RangeError);
    expect(out).toEqual({ col: -7, row: -9 });
  });
});

describe('gridCell - allocating companion', () => {
  test('새 plain { col, row } object를 반환한다', () => {
    const cell = gridCell({ x: 25, y: 7 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 });
    expect(cell).toEqual({ col: 2, row: 0 });
  });

  test('companion도 negative coordinate를 floor로 처리한다', () => {
    expect(gridCell({ x: -1, y: -10 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 })).toEqual({
      col: -1,
      row: -1,
    });
  });

  test('companion도 invalid 셀 크기에서 RangeError다', () => {
    expect(() => gridCell({ x: 1, y: 1 }, { originX: 0, originY: 0, cellWidth: 0, cellHeight: 0 })).toThrow(RangeError);
  });
});
