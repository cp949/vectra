/**
 * closed primitive boundary shape-pair 교점 collection helper 단위 테스트.
 */

import { describe, expect, test } from 'vitest';
import { circleBoundsIntersections } from '../../../src/intersects/circle-bounds-intersections';
import { circleRectIntersections } from '../../../src/intersects/circle-rect-intersections';
import { circleTriangleIntersections } from '../../../src/intersects/circle-triangle-intersections';
import { ellipseCircleIntersections } from '../../../src/intersects/ellipse-circle-intersections';
import { ellipseTriangleIntersections } from '../../../src/intersects/ellipse-triangle-intersections';
import { triangleTriangleIntersections } from '../../../src/intersects/triangle-triangle-intersections';
import type { XYObjectWritable } from '../../../src/types';

function expectPointClose(p: XYObjectWritable, x: number, y: number, digits = 9): void {
  expect(p.x).toBeCloseTo(x, digits);
  expect(p.y).toBeCloseTo(y, digits);
}

describe('circle × rect/bounds 교점 collection (S10-RM-007)', () => {
  test('edge crossing은 두 점을 circle center turn 오름차순으로 반환한다', () => {
    const points = circleRectIntersections(
      { center: { x: 0, y: 5 }, radius: 3 },
      { x: 0, y: 0, width: 10, height: 10 }
    );
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 8, 6);
    expectPointClose(points[1], 0, 2, 6);
  });

  test('corner tangent는 한 점으로 dedupe된다', () => {
    const points = circleRectIntersections(
      { center: { x: -1, y: -1 }, radius: Math.SQRT2 },
      { x: 0, y: 0, width: 10, height: 10 }
    );
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 0, 0, 6);
  });

  test('circle이 rect 내부에 있고 boundary 교점이 없으면 빈 배열이다', () => {
    const points = circleRectIntersections(
      { center: { x: 5, y: 5 }, radius: 3 },
      { x: 0, y: 0, width: 10, height: 10 }
    );
    expect(points).toEqual([]);
  });

  test('bounds는 rect와 동등한 결과를 반환한다', () => {
    const viaRect = circleRectIntersections(
      { center: { x: 0, y: 5 }, radius: 3 },
      { x: 0, y: 0, width: 10, height: 10 }
    );
    const viaBounds = circleBoundsIntersections(
      { center: { x: 0, y: 5 }, radius: 3 },
      { min: { x: 0, y: 0 }, max: { x: 10, y: 10 } }
    );
    expect(viaBounds).toEqual(viaRect);
  });

  test('zero-extent point bounds가 circle boundary 위에 있으면 한 점을 반환한다', () => {
    const points = circleBoundsIntersections(
      { center: { x: 0, y: 0 }, radius: 5 },
      { min: { x: 5, y: 0 }, max: { x: 5, y: 0 } }
    );
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 5, 0);
  });

  test('zero-extent point bounds가 circle boundary 밖이면 빈 배열이다', () => {
    const points = circleBoundsIntersections(
      { center: { x: 0, y: 0 }, radius: 5 },
      { min: { x: 6, y: 0 }, max: { x: 6, y: 0 } }
    );
    expect(points).toEqual([]);
  });

  test('empty circle / empty rect은 빈 배열이다', () => {
    expect(
      circleRectIntersections({ center: { x: 0, y: 5 }, radius: 0 }, { x: 0, y: 0, width: 10, height: 10 })
    ).toEqual([]);
    expect(
      circleRectIntersections({ center: { x: 0, y: 5 }, radius: 3 }, { x: 0, y: 0, width: 0, height: 10 })
    ).toEqual([]);
  });

  test('tuple 입력과 object 입력 결과가 같다', () => {
    const objs = circleRectIntersections({ center: { x: 0, y: 5 }, radius: 3 }, { x: 0, y: 0, width: 10, height: 10 });
    const tuples = circleRectIntersections([[0, 5], 3], [0, 0, 10, 10]);
    expect(tuples).toEqual(objs);
  });
});

describe('triangle × triangle 교점 collection (S10-RM-007)', () => {
  test('edge crossing은 triangle a boundary traversal 순서로 반환한다', () => {
    const points = triangleTriangleIntersections(
      { a: { x: 0, y: 0 }, b: { x: 6, y: 0 }, c: { x: 0, y: 6 } },
      { a: { x: 2, y: 2 }, b: { x: 8, y: 2 }, c: { x: 2, y: 8 } }
    );
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 4, 2);
    expectPointClose(points[1], 2, 4);
  });

  test('shared vertex는 한 점으로 dedupe된다', () => {
    const points = triangleTriangleIntersections(
      { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 0, y: 2 } },
      { a: { x: 0, y: 0 }, b: { x: -2, y: 0 }, c: { x: 0, y: -2 } }
    );
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 0, 0);
  });

  test('shared edge overlap은 triangle a edge ab 진행 순서(start→end)로 두 점을 반환한다', () => {
    const points = triangleTriangleIntersections(
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 0, y: 4 } },
      { a: { x: 0, y: 0 }, b: { x: 4, y: 0 }, c: { x: 2, y: -3 } }
    );
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 0, 0, 6);
    expectPointClose(points[1], 4, 0, 6);
  });

  test('한 triangle이 다른 triangle 내부에 있으면 빈 배열이다', () => {
    const points = triangleTriangleIntersections(
      { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 0, y: 10 } },
      { a: { x: 1, y: 1 }, b: { x: 2, y: 1 }, c: { x: 1, y: 2 } }
    );
    expect(points).toEqual([]);
  });

  test('degenerate triangle은 빈 배열이다', () => {
    const points = triangleTriangleIntersections(
      { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } },
      { a: { x: 0, y: -1 }, b: { x: 4, y: -1 }, c: { x: 2, y: 3 } }
    );
    expect(points).toEqual([]);
  });

  test('tuple 입력과 object 입력 결과가 같다', () => {
    const objs = triangleTriangleIntersections(
      { a: { x: 0, y: 0 }, b: { x: 6, y: 0 }, c: { x: 0, y: 6 } },
      { a: { x: 2, y: 2 }, b: { x: 8, y: 2 }, c: { x: 2, y: 8 } }
    );
    const tuples = triangleTriangleIntersections(
      [
        [0, 0],
        [6, 0],
        [0, 6],
      ],
      [
        [2, 2],
        [8, 2],
        [2, 8],
      ]
    );
    expect(tuples).toEqual(objs);
  });
});

describe('circle × triangle 교점 collection (S10-RM-007)', () => {
  const triangle = { a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, c: { x: 0, y: 10 } };

  test('두 edge crossing은 두 점을 circle center turn 오름차순으로 반환한다', () => {
    const points = circleTriangleIntersections({ center: { x: 0, y: 0 }, radius: 2 }, triangle);
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 2, 0, 6);
    expectPointClose(points[1], 0, 2, 6);
  });

  test('circle이 triangle 내부에 있으면 빈 배열이다', () => {
    const points = circleTriangleIntersections({ center: { x: 2, y: 2 }, radius: 0.5 }, triangle);
    expect(points).toEqual([]);
  });

  test('degenerate triangle / empty circle은 빈 배열이다', () => {
    expect(
      circleTriangleIntersections(
        { center: { x: 0, y: 0 }, radius: 2 },
        { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } }
      )
    ).toEqual([]);
    expect(circleTriangleIntersections({ center: { x: 0, y: 0 }, radius: 0 }, triangle)).toEqual([]);
  });

  test('tuple 입력과 object 입력 결과가 같다', () => {
    const objs = circleTriangleIntersections({ center: { x: 0, y: 0 }, radius: 2 }, triangle);
    const tuples = circleTriangleIntersections(
      [[0, 0], 2],
      [
        [0, 0],
        [10, 0],
        [0, 10],
      ]
    );
    expect(tuples).toEqual(objs);
  });
});

describe('ellipse × circle/triangle 교점 collection (S10-RM-007)', () => {
  test('ellipse-circle two-point는 두 점을 ellipse center turn 오름차순으로 반환한다', () => {
    const points = ellipseCircleIntersections(
      { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 2 },
      { center: { x: 2, y: 0 }, radius: 2 }
    );
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 1, Math.sqrt(3), 6);
    expectPointClose(points[1], 1, -Math.sqrt(3), 6);
  });

  test('ellipse-circle external tangent는 한 점이다', () => {
    const points = ellipseCircleIntersections(
      { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 5 },
      { center: { x: 10, y: 0 }, radius: 5 }
    );
    expect(points).toHaveLength(1);
    expectPointClose(points[0], 5, 0, 6);
  });

  test('ellipse-circle containment은 빈 배열이다', () => {
    const points = ellipseCircleIntersections(
      { center: { x: 0, y: 0 }, radiusX: 5, radiusY: 5 },
      { center: { x: 0, y: 0 }, radius: 2 }
    );
    expect(points).toEqual([]);
  });

  test('empty ellipse / empty circle은 빈 배열이다', () => {
    expect(
      ellipseCircleIntersections(
        { center: { x: 0, y: 0 }, radiusX: 0, radiusY: 5 },
        { center: { x: 2, y: 0 }, radius: 2 }
      )
    ).toEqual([]);
    expect(
      ellipseCircleIntersections(
        { center: { x: 0, y: 0 }, radiusX: 2, radiusY: 2 },
        { center: { x: 2, y: 0 }, radius: 0 }
      )
    ).toEqual([]);
  });

  test('ellipse-triangle edge crossing은 bottom edge 교점 두 점을 turn 오름차순으로 반환한다', () => {
    const points = ellipseTriangleIntersections(
      { center: { x: 0, y: 0 }, radiusX: 4, radiusY: 2 },
      { a: { x: -10, y: 0 }, b: { x: 10, y: 0 }, c: { x: 0, y: 10 } }
    );
    expect(points).toHaveLength(2);
    expectPointClose(points[0], 4, 0, 6);
    expectPointClose(points[1], -4, 0, 6);
  });

  test('ellipse-triangle containment-only는 빈 배열이다', () => {
    const points = ellipseTriangleIntersections(
      { center: { x: 5, y: 3 }, radiusX: 0.5, radiusY: 0.5 },
      { a: { x: 0, y: 0 }, b: { x: 20, y: 0 }, c: { x: 0, y: 20 } }
    );
    expect(points).toEqual([]);
  });

  test('degenerate triangle은 빈 배열이다', () => {
    const points = ellipseTriangleIntersections(
      { center: { x: 0, y: 0 }, radiusX: 4, radiusY: 2 },
      { a: { x: 0, y: 0 }, b: { x: 2, y: 0 }, c: { x: 4, y: 0 } }
    );
    expect(points).toEqual([]);
  });
});
