/**
 * grid cell 변환(gridCellInto / gridCell) 계약 테스트.
 *
 * default origin (0,0) floor division, tuple point input, rectangular cellSize, custom origin,
 * negative coordinate floor behavior, positive finite cellSize 위반 RangeError, point/origin
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
  test('default origin square cell에서 object point를 floor cell로 기록한다', () => {
    const out = makeCell();
    const result = gridCellInto(out, { x: 25, y: 7 }, { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual({ col: 2, row: 0 });
  });

  test('tuple point input을 object point와 동일하게 처리한다', () => {
    const out = makeCell();
    gridCellInto(out, [25, 7], { cellSize: 10 });
    expect(out).toEqual({ col: 2, row: 0 });
  });

  test('rectangular cellSize는 축별 size로 floor한다', () => {
    const out = makeCell();
    gridCellInto(out, { x: 25, y: 7 }, { cellSize: { x: 10, y: 5 } });
    expect(out).toEqual({ col: 2, row: 1 });
  });

  test('custom origin을 빼고 floor한다', () => {
    const out = makeCell();
    gridCellInto(out, { x: 25, y: 7 }, { origin: { x: 5, y: 2 }, cellSize: 10 });
    expect(out).toEqual({ col: 2, row: 0 });
  });

  test('negative world coordinate는 truncation이 아니라 floor로 처리한다', () => {
    const out = makeCell();
    gridCellInto(out, { x: -1, y: -10 }, { cellSize: 10 });
    expect(out).toEqual({ col: -1, row: -1 });
  });

  test('cell 경계 점은 더 큰 cell에 속한다', () => {
    const out = makeCell();
    gridCellInto(out, { x: 10, y: 20 }, { cellSize: 10 });
    expect(out).toEqual({ col: 1, row: 2 });
  });

  test.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'cellSize %s는 RangeError다',
    (cellSize) => {
      expect(() => gridCellInto(makeCell(), { x: 1, y: 1 }, { cellSize })).toThrow(RangeError);
    }
  );

  test('rectangular cellSize의 한 축만 invalid여도 RangeError다', () => {
    expect(() => gridCellInto(makeCell(), { x: 1, y: 1 }, { cellSize: { x: 10, y: 0 } })).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('point 성분 %s는 RangeError다', (bad) => {
    expect(() => gridCellInto(makeCell(), { x: bad, y: 1 }, { cellSize: 10 })).toThrow(RangeError);
  });

  test('origin 성분이 non-finite이면 RangeError다', () => {
    expect(() => gridCellInto(makeCell(), { x: 1, y: 1 }, { origin: { x: Number.NaN, y: 0 }, cellSize: 10 })).toThrow(
      RangeError
    );
  });

  test('계산된 cell coordinate가 non-finite이면 RangeError이고 out을 수정하지 않는다', () => {
    const out: GridCellWritable = { col: -7, row: -9 };
    expect(() => gridCellInto(out, { x: Number.MAX_VALUE, y: 0 }, { cellSize: Number.MIN_VALUE })).toThrow(RangeError);
    expect(out).toEqual({ col: -7, row: -9 });
  });
});

describe('gridCell - allocating companion', () => {
  test('새 plain { col, row } object를 반환한다', () => {
    const cell = gridCell({ x: 25, y: 7 }, { cellSize: 10 });
    expect(cell).toEqual({ col: 2, row: 0 });
  });

  test('companion도 negative coordinate를 floor로 처리한다', () => {
    expect(gridCell({ x: -1, y: -10 }, { cellSize: 10 })).toEqual({ col: -1, row: -1 });
  });

  test('companion도 invalid cellSize에서 RangeError다', () => {
    expect(() => gridCell({ x: 1, y: 1 }, { cellSize: 0 })).toThrow(RangeError);
  });
});
