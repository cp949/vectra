import { describe, expect, expectTypeOf, test } from 'vitest';
import { boundsFrom } from '../../../src/bounds/bounds-from';
import { createBounds } from '../../../src/bounds/create-bounds';
import { circleFrom } from '../../../src/circle/circle-from';
import { createCircle } from '../../../src/circle/create-circle';
import { createMatrix } from '../../../src/matrix/create-matrix';
import { matrixFrom } from '../../../src/matrix/matrix-from';
import { createPolygon } from '../../../src/polygon/create-polygon';
import { polygonFrom } from '../../../src/polygon/polygon-from';
import { createPolyline } from '../../../src/polyline/create-polyline';
import { polylineFrom } from '../../../src/polyline/polyline-from';
import { createRect } from '../../../src/rect/create-rect';
import { rectFrom } from '../../../src/rect/rect-from';
import { createSegment } from '../../../src/segment/create-segment';
import { segmentFrom } from '../../../src/segment/segment-from';
import type {
  BoundsWritable,
  CircleWritable,
  MatrixWritable,
  PolygonWritable,
  PolylineWritable,
  RectWritable,
  SegmentWritable,
} from '../../../src/types';

describe('shape create/xFrom factories', () => {
  test('createRect()는 zero seed를 만들고 rectFrom은 source/component를 복사한다', () => {
    expectTypeOf(createRect()).toEqualTypeOf<RectWritable>();
    expectTypeOf(rectFrom(1, 2, 3, 4)).toEqualTypeOf<RectWritable>();
    expect(createRect()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(rectFrom(1, 2, 3, 4)).toEqual({ x: 1, y: 2, width: 3, height: 4 });
    expect(rectFrom([5, 6, 7, 8])).toEqual({ x: 5, y: 6, width: 7, height: 8 });
  });

  test('createBounds()는 zero seed를 만들고 boundsFrom은 source/endpoint를 복사한다', () => {
    expectTypeOf(createBounds()).toEqualTypeOf<BoundsWritable>();
    expect(createBounds()).toEqual({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } });

    const result = boundsFrom([1, 2], { x: 5, y: 6 });
    expectTypeOf(result).toEqualTypeOf<BoundsWritable>();
    expect(result).toEqual({ min: { x: 1, y: 2 }, max: { x: 5, y: 6 } });

    const src = { min: [3, 4] as const, max: [7, 8] as const };
    expect(boundsFrom(src)).toEqual({ min: { x: 3, y: 4 }, max: { x: 7, y: 8 } });
    expect(boundsFrom(src).min).not.toBe(src.min);
  });

  test('createCircle()는 zero seed를 만들고 circleFrom은 source/component를 복사한다', () => {
    expectTypeOf(createCircle()).toEqualTypeOf<CircleWritable>();
    expect(createCircle()).toEqual({ center: { x: 0, y: 0 }, radius: 0 });

    const result = circleFrom([3, 4], 5);
    expectTypeOf(result).toEqualTypeOf<CircleWritable>();
    expect(result).toEqual({ center: { x: 3, y: 4 }, radius: 5 });
    expect(circleFrom([[6, 7], 8])).toEqual({ center: { x: 6, y: 7 }, radius: 8 });
  });

  test('createSegment()는 zero seed를 만들고 segmentFrom은 source/endpoint를 복사한다', () => {
    expectTypeOf(createSegment()).toEqualTypeOf<SegmentWritable>();
    expect(createSegment()).toEqual({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } });

    const result = segmentFrom([1, 2], { x: 3, y: 4 });
    expectTypeOf(result).toEqualTypeOf<SegmentWritable>();
    expect(result).toEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 } });
    expect(
      segmentFrom([
        [5, 6],
        [7, 8],
      ])
    ).toEqual({ a: { x: 5, y: 6 }, b: { x: 7, y: 8 } });
  });

  test('createMatrix()는 identity seed를 만들고 matrixFrom은 source/component를 복사한다', () => {
    expectTypeOf(createMatrix()).toEqualTypeOf<MatrixWritable>();
    expectTypeOf(matrixFrom(1, 2, 3, 4, 5, 6)).toEqualTypeOf<MatrixWritable>();
    expect(createMatrix()).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 });
    expect(matrixFrom(1, 2, 3, 4, 5, 6)).toEqual({ a: 1, b: 2, c: 3, d: 4, tx: 5, ty: 6 });
    expect(matrixFrom([7, 8, 9, 10, 11, 12])).toEqual({ a: 7, b: 8, c: 9, d: 10, tx: 11, ty: 12 });
  });

  test('createPolyline()는 빈 list seed를 만들고 polylineFrom은 source를 복사한다', () => {
    expectTypeOf(createPolyline()).toEqualTypeOf<PolylineWritable>();
    expect(createPolyline()).toEqual({ points: [] });

    const points = [{ x: 1, y: 2 }, [3, 4] as const] as const;
    const result = polylineFrom(points);
    expectTypeOf(result).toEqualTypeOf<PolylineWritable>();
    expect(result).toEqual({
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
    });
    expect(result.points).not.toBe(points);
    expect(result.points[0]).not.toBe(points[0]);
  });

  test('polylineFrom은 clonePoints false이면 해석된 points 배열을 공유한다', () => {
    const points = [{ x: 1, y: 2 }, [3, 4] as const] as const;
    const source = { points };
    const result = polylineFrom(source, { clonePoints: false });
    expect(result).toEqual({ points });
    expect(result.points).toBe(points);
  });

  test('createPolygon()는 빈 list seed를 만들고 polygonFrom은 source를 복사한다', () => {
    expectTypeOf(createPolygon()).toEqualTypeOf<PolygonWritable>();
    expect(createPolygon()).toEqual({ points: [] });

    const points = [{ x: 1, y: 2 }, [3, 4] as const] as const;
    const result = polygonFrom({ points });
    expectTypeOf(result).toEqualTypeOf<PolygonWritable>();
    expect(result).toEqual({
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
    });
    expect(result.points).not.toBe(points);
    expect(result.points[0]).not.toBe(points[0]);
  });

  test('polygonFrom은 clonePoints false이면 해석된 points 배열을 공유한다', () => {
    const points = [{ x: 1, y: 2 }, [3, 4] as const] as const;
    const result = polygonFrom(points, { clonePoints: false });
    expect(result).toEqual({ points });
    expect(result.points).toBe(points);
  });
});
