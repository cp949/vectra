/**
 * grid snap(gridSnapInto / gridSnap) 계약 테스트.
 *
 * default/custom origin square snap, rectangular cellSize snap, negative coordinate snap, halfway
 * Math.round 정책, tuple point input과 tuple/object output, input/output aliasing 안전, invalid
 * spec과 non-finite point/origin RangeError, companion plain object 반환을 검증한다.
 */

import { describe, expect, test } from 'vitest';
import { gridSnap } from '../../../src/grid/grid-snap';
import { gridSnapInto } from '../../../src/grid/grid-snap-into';
import type { XYObjectWritable, XYTupleWritable } from '../../../src/types';

/** x/y object storage를 가진 새 XYObjectWritable seed를 만든다. */
function makeXY(): XYObjectWritable {
  return { x: 0, y: 0 };
}

describe('gridSnapInto - world point를 nearest grid point로 snap', () => {
  test('default origin square grid에서 가까운 grid point로 snap한다', () => {
    const out = makeXY();
    const result = gridSnapInto(out, { x: 23, y: 7 }, { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual({ x: 20, y: 10 });
  });

  test('rectangular cellSize는 축별로 snap한다', () => {
    const out = makeXY();
    gridSnapInto(out, { x: 23, y: 7 }, { cellSize: { x: 10, y: 5 } });
    expect(out).toEqual({ x: 20, y: 5 });
  });

  test('custom origin 기준으로 snap한다', () => {
    const out = makeXY();
    gridSnapInto(out, { x: 23, y: 7 }, { origin: { x: 5, y: 2 }, cellSize: 10 });
    expect(out).toEqual({ x: 25, y: 12 });
  });

  test('negative coordinate를 snap한다', () => {
    const out = makeXY();
    gridSnapInto(out, { x: -23, y: -7 }, { cellSize: 10 });
    expect(out).toEqual({ x: -20, y: -10 });
  });

  test('정확히 halfway 점은 Math.round 정책(0.5는 +방향)을 따른다', () => {
    const out = makeXY();
    gridSnapInto(out, { x: 15, y: 25 }, { cellSize: 10 });
    expect(out).toEqual({ x: 20, y: 30 });
  });

  test('tuple point input과 tuple output을 지원하고 같은 ref를 반환한다', () => {
    const out: XYTupleWritable = [0, 0];
    const result = gridSnapInto(out, [23, 7], { cellSize: 10 });
    expect(result).toBe(out);
    expect(out).toEqual([20, 10]);
  });

  test('out === point aliasing은 안전하다', () => {
    const point: XYObjectWritable = { x: 23, y: 7 };
    const result = gridSnapInto(point, point, { cellSize: 10 });
    expect(result).toBe(point);
    expect(point).toEqual({ x: 20, y: 10 });
  });

  test.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY])('cellSize %s는 RangeError다', (cellSize) => {
    expect(() => gridSnapInto(makeXY(), { x: 1, y: 1 }, { cellSize })).toThrow(RangeError);
  });

  test.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])('point 성분 %s는 RangeError다', (bad) => {
    expect(() => gridSnapInto(makeXY(), { x: bad, y: 1 }, { cellSize: 10 })).toThrow(RangeError);
  });

  test('non-finite origin은 RangeError다', () => {
    expect(() => gridSnapInto(makeXY(), { x: 1, y: 1 }, { origin: { x: Number.NaN, y: 0 }, cellSize: 10 })).toThrow(
      RangeError
    );
  });

  test('계산된 snap coordinate가 non-finite이면 RangeError이고 out을 수정하지 않는다', () => {
    const out: XYObjectWritable = { x: -7, y: -9 };
    expect(() => gridSnapInto(out, { x: Number.MAX_VALUE, y: 0 }, { cellSize: Number.MIN_VALUE })).toThrow(RangeError);
    expect(out).toEqual({ x: -7, y: -9 });
  });
});

describe('gridSnap - allocating companion', () => {
  test('새 plain { x, y } object를 반환한다', () => {
    expect(gridSnap({ x: 23, y: 7 }, { cellSize: 10 })).toEqual({ x: 20, y: 10 });
  });

  test('companion도 invalid cellSize에서 RangeError다', () => {
    expect(() => gridSnap({ x: 1, y: 1 }, { cellSize: 0 })).toThrow(RangeError);
  });
});
