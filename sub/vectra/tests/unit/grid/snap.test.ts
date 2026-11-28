/**
 * grid snap(gridSnapInto / gridSnap) 계약 테스트.
 *
 * 원점 square snap, 축별 셀 크기 snap, negative coordinate snap, halfway
 * Math.round 정책, input/output aliasing 안전, invalid
 * spec과 non-finite point/origin RangeError, companion plain object 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { gridSnap } from '../../../src/grid/grid-snap';
import { gridSnapInto } from '../../../src/grid/grid-snap-into';
import type { PointWritable } from '../../../src/types';

/** x/y object storage를 가진 새 PointWritable seed를 만든다. */
function makeXY(): PointWritable {
  return { x: 0, y: 0 };
}

describe('gridSnapInto - world point를 nearest grid point로 snap', () => {
  test('원점 square grid에서 가까운 grid point로 snap한다', () => {
    const out = makeXY();
    const result = gridSnapInto(out, { x: 23, y: 7 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 20, y: 10 });
  });

  test('셀 너비와 높이가 다르면 축별로 snap한다', () => {
    const out = makeXY();
    gridSnapInto(out, { x: 23, y: 7 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 5 });
    expect(out).toEqual({ x: 20, y: 5 });
  });

  test('custom origin 기준으로 snap한다', () => {
    const out = makeXY();
    gridSnapInto(out, { x: 23, y: 7 }, { originX: 5, originY: 2, cellWidth: 10, cellHeight: 10 });
    expect(out).toEqual({ x: 25, y: 12 });
  });

  test('negative coordinate를 snap한다', () => {
    const out = makeXY();
    gridSnapInto(out, { x: -23, y: -7 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 });
    expect(out).toEqual({ x: -20, y: -10 });
  });

  test('정확히 halfway 점은 Math.round 정책(0.5는 +방향)을 따른다', () => {
    const out = makeXY();
    gridSnapInto(out, { x: 15, y: 25 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 });
    expect(out).toEqual({ x: 20, y: 30 });
  });

  test('out === point aliasing은 안전하다', () => {
    const point: PointWritable = { x: 23, y: 7 };
    const result = gridSnapInto(point, point, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 });
    expect(result).toBe(point);
    expect(point).toEqual({ x: 20, y: 10 });
  });

  test.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY])('셀 크기 %s는 RangeError다', (cellSize) => {
    expect(() =>
      gridSnapInto(makeXY(), { x: 1, y: 1 }, { originX: 0, originY: 0, cellWidth: cellSize, cellHeight: cellSize })
    ).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('point 성분 %s는 RangeError다', (bad) => {
    expect(() =>
      gridSnapInto(makeXY(), { x: bad, y: 1 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 })
    ).toThrow(RangeError);
  });

  test('non-finite origin은 RangeError다', () => {
    expect(() =>
      gridSnapInto(makeXY(), { x: 1, y: 1 }, { originX: Number.NaN, originY: 0, cellWidth: 10, cellHeight: 10 })
    ).toThrow(RangeError);
  });

  test('계산된 snap coordinate가 non-finite이면 RangeError이고 out을 수정하지 않는다', () => {
    const out: PointWritable = { x: -7, y: -9 };
    expect(() =>
      gridSnapInto(
        out,
        { x: Number.MAX_VALUE, y: 0 },
        { originX: 0, originY: 0, cellWidth: Number.MIN_VALUE, cellHeight: Number.MIN_VALUE }
      )
    ).toThrow(RangeError);
    expect(out).toEqual({ x: -7, y: -9 });
  });
});

describe('gridSnap - allocating companion', () => {
  test('새 plain { x, y } object를 반환한다', () => {
    expect(gridSnap({ x: 23, y: 7 }, { originX: 0, originY: 0, cellWidth: 10, cellHeight: 10 })).toEqual({
      x: 20,
      y: 10,
    });
  });

  test('companion도 invalid 셀 크기에서 RangeError다', () => {
    expect(() => gridSnap({ x: 1, y: 1 }, { originX: 0, originY: 0, cellWidth: 0, cellHeight: 0 })).toThrow(RangeError);
  });
});
