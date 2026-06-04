/**
 * detail 기반 shape-pair 교점 collection helper 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { ellipseEllipseIntersections } from '../../../src/intersects/ellipse-ellipse-intersections';
import { ellipseEllipseIntersectionsInto } from '../../../src/intersects/ellipse-ellipse-intersections-into';
import { segmentSegmentIntersections } from '../../../src/intersects/segment-segment-intersections';
import { segmentSegmentIntersectionsInto } from '../../../src/intersects/segment-segment-intersections-into';
import type { XYObjectWritable } from '../../../src/types';

function expectPointClose(p: XYObjectWritable, x: number, y: number, digits = 9): void {
  expect(p.x).toBeCloseTo(x, digits);
  expect(p.y).toBeCloseTo(y, digits);
}

describe('segmentSegmentIntersections — point/overlap/none 분기', () => {
  test('proper crossing은 교점 한 점이다', () => {
    const points = segmentSegmentIntersections(
      { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } },
      { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }
    );
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 2, 2);
  });

  test('collinear overlap은 start/end 두 점을 segment a 기준 오름차순으로 반환한다', () => {
    const points = segmentSegmentIntersections(
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 } },
      { a: { x: 2, y: 0 }, b: { x: 6, y: 0 } }
    );
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 2, 0);
    expectPointClose(points[1], 4, 0);
  });

  test('disjoint segment는 빈 배열이다', () => {
    const points = segmentSegmentIntersections(
      { a: { x: 0, y: 0 }, b: { x: 1, y: 0 } },
      { a: { x: 0, y: 5 }, b: { x: 1, y: 5 } }
    );
    expect(points).toEqual([]);
  });

  test('shared endpoint touch는 한 점이다', () => {
    const points = segmentSegmentIntersections(
      { a: { x: 0, y: 0 }, b: { x: 2, y: 0 } },
      { a: { x: 2, y: 0 }, b: { x: 2, y: 2 } }
    );
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 2, 0);
  });

  test('Into는 out array를 clear하고 같은 reference를 반환한다', () => {
    const out: XYObjectWritable[] = [
      { x: 99, y: 99 },
      { x: 88, y: 88 },
    ];
    const result = segmentSegmentIntersectionsInto(
      out,
      { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } },
      { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }
    );
    expect(result).toBe(out);
    expect(out).toHaveLength(1);
    expectPointClose(out[0], 2, 2);
  });

  test('companion은 매 호출 새 point object를 만든다', () => {
    const a = { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } };
    const b = { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } };
    const first = segmentSegmentIntersections(a, b);
    const second = segmentSegmentIntersections(a, b);
    expect(first[0]).not.toBe(second[0]);
  });

  test('tuple 입력과 object 입력 결과가 같다', () => {
    const objs = segmentSegmentIntersections(
      { a: { x: 0, y: 0 }, b: { x: 4, y: 4 } },
      { a: { x: 0, y: 4 }, b: { x: 4, y: 0 } }
    );
    const tuples = segmentSegmentIntersections(
      [
        [0, 0],
        [4, 4],
      ],
      [
        [0, 4],
        [4, 0],
      ]
    );
    expect(tuples).toEqual(objs);
  });
});

describe('ellipseEllipseIntersections — point/two-point/multi-point/empty 분기', () => {
  test('external tangent는 접점 한 점이다', () => {
    const points = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 5 },
      { center: { x: 10, y: 0 }, radiusX: 5, radiusY: 5 }
    );
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 5, 0);
  });

  test('proper two-point는 두 점이다', () => {
    const points = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 2 },
      { center: { x: 2, y: 0 }, radiusX: 2, radiusY: 2 }
    );
    expect(points).toHaveLength(2);
    for (const p of points) {
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(2, 9);
      expect(Math.hypot(p.x - 2, p.y)).toBeCloseTo(2, 9);
    }
  });

  test('4점 교차는 네 점을 ellipse a turn 오름차순으로 반환한다', () => {
    const points = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 1 },
      { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 3 }
    );
    expect(points).toHaveLength(4);
    const turns = points.map((p) => {
      const t = Math.atan2(p.y, p.x / 3) / (2 * Math.PI);
      return t < 0 ? t + 1 : t;
    });
    for (let i = 1; i < turns.length; i++) expect(turns[i]).toBeGreaterThanOrEqual(turns[i - 1]);
  });

  test('3점 교차는 세 점이다', () => {
    const points = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 },
      { center: { x: 0, y: 1 }, radiusX: 1, radiusY: 2 }
    );
    expect(points).toHaveLength(3);
  });

  test('containment은 빈 배열이다', () => {
    const points = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 5 },
      { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 2 }
    );
    expect(points).toEqual([]);
  });

  test('coincident overlap은 임의 점 없이 빈 배열이다', () => {
    const points = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 },
      { center: { x: 0, y: 0 }, radiusX: 3, radiusY: 2 }
    );
    expect(points).toEqual([]);
  });

  test('외부 분리(none)는 빈 배열이다', () => {
    const points = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 1, radiusY: 1 },
      { center: { x: 100, y: 0 }, radiusX: 1, radiusY: 1 }
    );
    expect(points).toEqual([]);
  });

  test('empty ellipse(radiusX ≤ 0)는 빈 배열이다', () => {
    const points = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 5 },
      { center: { x: 1, y: 0 }, radiusX: 2, radiusY: 2 }
    );
    expect(points).toEqual([]);
  });

  test('Into는 out array를 clear하고 같은 reference를 반환한다', () => {
    const out: XYObjectWritable[] = [{ x: 1, y: 1 }];
    const result = ellipseEllipseIntersectionsInto(
      out,
      { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 5 },
      { center: { x: 10, y: 0 }, radiusX: 5, radiusY: 5 }
    );
    expect(result).toBe(out);
    expect(out).toHaveLength(1);
    expectPointClose(out[0], 5, 0);
  });

  test('tuple 입력과 object 입력 결과가 같다', () => {
    const objs = ellipseEllipseIntersections(
      { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 2 },
      { center: { x: 2, y: 0 }, radiusX: 2, radiusY: 2 }
    );
    const tuples = ellipseEllipseIntersections([[0, 0], 2, 2], [[2, 0], 2, 2]);
    expect(tuples).toEqual(objs);
  });
});
