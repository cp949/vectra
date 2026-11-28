/** 교차점 기록 함수의 출력 배열 반환 타입과 참조를 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { rayPolygonIntersectionsInto } from '../../../src/intersects/ray-polygon-intersections-into';
import { infiniteLinePolygonIntersectionsInto } from '../../../src/intersects/infinite-line-polygon-intersections-into';
import { segmentPolygonIntersectionsInto } from '../../../src/intersects/segment-polygon-intersections-into';
import { rayPolygonOverlapIntervalsInto } from '../../../src/intersects/ray-polygon-overlap-intervals-into';
import { infiniteLinePolygonOverlapIntervalsInto } from '../../../src/intersects/infinite-line-polygon-overlap-intervals-into';
import { segmentPolygonOverlapIntervalsInto } from '../../../src/intersects/segment-polygon-overlap-intervals-into';
import { raysFromPointToPolygonInto } from '../../../src/intersects/rays-from-point-to-polygon-into';
import { visibilityPolygonInto } from '../../../src/intersects/visibility-polygon-into';
import type {
  LinePolygonIntersectionHit,
  LinePolygonOverlapIntervalDetail,
  VisibilityRayHit,
} from '../../../src/types';
import { singleIntersectionSegmentInfiniteLineInto } from '../../../src/intersects/single-intersection-segment-infinite-line-into';
import { rayCircleIntersectionsInto } from '../../../src/intersects/ray-circle-intersections-into';
import { rayEllipseIntersectionsInto } from '../../../src/intersects/ray-ellipse-intersections-into';
import { infiniteLineCircleIntersectionsInto } from '../../../src/intersects/infinite-line-circle-intersections-into';
import { infiniteLineEllipseIntersectionsInto } from '../../../src/intersects/infinite-line-ellipse-intersections-into';
import { segmentEllipseIntersectionsInto } from '../../../src/intersects/segment-ellipse-intersections-into';
import { ellipseCircleIntersectionsInto } from '../../../src/intersects/ellipse-circle-intersections-into';
import { ellipseEllipseIntersectionsInto } from '../../../src/intersects/ellipse-ellipse-intersections-into';
import { ellipseTriangleIntersectionsInto } from '../../../src/intersects/ellipse-triangle-intersections-into';
import { circlePolylineIntersectionsInto } from '../../../src/intersects/circle-polyline-intersections-into';
import { polylinePolylineIntersectionsInto } from '../../../src/intersects/polyline-polyline-intersections-into';
import { rayPolygonHitT } from '../../../src/intersects/ray-polygon-hit-t';
import { intersectsRayRay } from '../../../src/intersects/intersects-ray-ray';
import { singleIntersectionSegmentRayInto } from '../../../src/intersects/single-intersection-segment-ray-into';
import { circleBoundsIntersectionsInto } from '../../../src/intersects/circle-bounds-intersections-into';
import { circleTriangleIntersectionsInto } from '../../../src/intersects/circle-triangle-intersections-into';
import { segmentCircleIntersectionsInto } from '../../../src/intersects/segment-circle-intersections-into';
import { circleRectIntersectionsInto } from '../../../src/intersects/circle-rect-intersections-into';
import { circleCircleIntersectionsInto } from '../../../src/intersects/circle-circle-intersections-into';
import type {
  Circle,
  InfiniteLine,
  PointWritable,
  Polygon,
  Ray,
  Segment,
} from '../../../src/types/flat-shapes.internal';

class PolygonOutput<T> extends Array<T> {
  readonly label = '다각형 교차 출력';
}

class IntersectionPoints extends Array<PointWritable> {
  readonly label = '교점';
}

test('circleCircleIntersectionsInto는 전달받은 배열 서브클래스를 그대로 반환한다', () => {
  const a: Circle = { cx: 0, cy: 0, r: 2 };
  const b: Circle = { cx: 4, cy: 0, r: 2 };
  const out = new IntersectionPoints();
  const result = circleCircleIntersectionsInto(out, a, b);

  expectTypeOf(result).toEqualTypeOf<IntersectionPoints>();
  expect(result).toBe(out);
  expect(out[0]).toEqual({ x: 2, y: 0 });
});

test('circleBoundsIntersectionsInto는 전달받은 배열 서브클래스를 그대로 반환한다', () => {
  const out = new IntersectionPoints();
  const result = circleBoundsIntersectionsInto(out, { cx: 0, cy: 5, r: 3 }, { minX: 0, minY: 0, maxX: 10, maxY: 10 });
  expectTypeOf(result).toEqualTypeOf<IntersectionPoints>();
  expect(result).toBe(out);
  expect(out).toHaveLength(2);
});

test('circleRectIntersectionsInto는 전달받은 배열 서브클래스를 그대로 반환한다', () => {
  const out = new IntersectionPoints();
  const result = circleRectIntersectionsInto(out, { cx: 0, cy: 5, r: 3 }, { x: 0, y: 0, width: 10, height: 10 });
  expectTypeOf(result).toEqualTypeOf<IntersectionPoints>();
  expect(result).toBe(out);
  expect(out).toHaveLength(2);
});

test('circleTriangleIntersectionsInto는 전달받은 배열 서브클래스를 그대로 반환한다', () => {
  const out = new IntersectionPoints();
  const result = circleTriangleIntersectionsInto(
    out,
    { cx: 0, cy: 0, r: 2 },
    { x1: 0, y1: 0, x2: 10, y2: 0, x3: 0, y3: 10 }
  );
  expectTypeOf(result).toEqualTypeOf<IntersectionPoints>();
  expect(result).toBe(out);
  expect(out).toHaveLength(2);
});

test('segmentCircleIntersectionsInto는 전달받은 배열 서브클래스를 그대로 반환한다', () => {
  const out = new IntersectionPoints();
  const result = segmentCircleIntersectionsInto(out, { x1: -3, y1: 0, x2: 3, y2: 0 }, { cx: 0, cy: 0, r: 2 });
  expectTypeOf(result).toEqualTypeOf<IntersectionPoints>();
  expect(result).toBe(out);
  expect(out).toHaveLength(2);
});

test('반직선 판정과 선분 교점에 평평한 도형을 전달한다', () => {
  expectTypeOf(intersectsRayRay).parameter(0).toEqualTypeOf<Ray>();
  expectTypeOf(singleIntersectionSegmentRayInto).parameter(0).toEqualTypeOf<PointWritable>();
  expectTypeOf(singleIntersectionSegmentRayInto).parameter(1).toEqualTypeOf<Segment>();
});

test('선분과 직선의 교점은 평평한 입력과 점 출력을 받는다', () => {
  expectTypeOf(singleIntersectionSegmentInfiniteLineInto).parameter(0).toEqualTypeOf<PointWritable>();
  expectTypeOf(singleIntersectionSegmentInfiniteLineInto).parameter(1).toEqualTypeOf<Segment>();
  expectTypeOf(singleIntersectionSegmentInfiniteLineInto).parameter(2).toEqualTypeOf<InfiniteLine>();
});

test('원과 타원의 직선 계열 교점 함수는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new IntersectionPoints();
  const ray = { ox: -3, oy: 0, dx: 1, dy: 0 };
  const segment = { x1: -3, y1: 0, x2: 3, y2: 0 };
  const circle = { cx: 0, cy: 0, r: 2 };
  const ellipse = { cx: 0, cy: 0, rx: 2, ry: 1 };
  const rayCircle = rayCircleIntersectionsInto(out, ray, circle);
  const rayEllipse = rayEllipseIntersectionsInto(out, ray, ellipse);
  const lineCircle = infiniteLineCircleIntersectionsInto(out, ray, circle);
  const lineEllipse = infiniteLineEllipseIntersectionsInto(out, ray, ellipse);
  const segmentEllipse = segmentEllipseIntersectionsInto(out, segment, ellipse);
  expectTypeOf(rayCircle).toEqualTypeOf<IntersectionPoints>();
  expectTypeOf(rayEllipse).toEqualTypeOf<IntersectionPoints>();
  expectTypeOf(lineCircle).toEqualTypeOf<IntersectionPoints>();
  expectTypeOf(lineEllipse).toEqualTypeOf<IntersectionPoints>();
  expectTypeOf(segmentEllipse).toEqualTypeOf<IntersectionPoints>();
  for (const result of [rayCircle, rayEllipse, lineCircle, lineEllipse, segmentEllipse]) {
    expect(result).toBe(out);
  }
  expect(out).toHaveLength(2);
});

test('타원 경계의 교점 함수는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new IntersectionPoints();
  const ellipse = { cx: 0, cy: 0, rx: 2, ry: 1 };
  const circle = { cx: 2, cy: 0, r: 2 };
  const other = { cx: 2, cy: 0, rx: 2, ry: 1 };
  const triangle = { x1: 0, y1: 0, x2: 10, y2: 0, x3: 0, y3: 10 };
  const circleResult = ellipseCircleIntersectionsInto(out, ellipse, circle);
  const ellipseResult = ellipseEllipseIntersectionsInto(out, ellipse, other);
  const triangleResult = ellipseTriangleIntersectionsInto(out, ellipse, triangle);
  expectTypeOf(circleResult).toEqualTypeOf<IntersectionPoints>();
  expectTypeOf(ellipseResult).toEqualTypeOf<IntersectionPoints>();
  expectTypeOf(triangleResult).toEqualTypeOf<IntersectionPoints>();
  for (const result of [circleResult, ellipseResult, triangleResult]) {
    expect(result).toBe(out);
  }
  expect(out).toHaveLength(2);
});

test('polyline 교점 함수는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new IntersectionPoints();
  const horizontal = [
    { x: -3, y: 0 },
    { x: 3, y: 0 },
  ];
  const vertical = [
    { x: 0, y: -3 },
    { x: 0, y: 3 },
  ];
  const circleResult = circlePolylineIntersectionsInto(out, { cx: 0, cy: 0, r: 2 }, horizontal);
  expectTypeOf(circleResult).toEqualTypeOf<IntersectionPoints>();
  expect(circleResult).toBe(out);
  expect(out).toHaveLength(2);

  const polylineResult = polylinePolylineIntersectionsInto(out, horizontal, vertical);
  expectTypeOf(polylineResult).toEqualTypeOf<IntersectionPoints>();
  expect(polylineResult).toBe(out);
  expect(out[0]).toEqual({ x: 0, y: 0 });
});

test('rayPolygonHitT는 평평한 반직선과 다각형을 받는다', () => {
  expectTypeOf(rayPolygonHitT).parameter(0).toEqualTypeOf<Ray>();
  expectTypeOf(rayPolygonHitT).parameter(1).toEqualTypeOf<Polygon>();
});

test('rayPolygonIntersectionsInto는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new PolygonOutput<LinePolygonIntersectionHit<PointWritable>>();
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = rayPolygonIntersectionsInto(out, { ox: -1, oy: 0, dx: 1, dy: 0 }, polygon);
  expectTypeOf(result).toEqualTypeOf<PolygonOutput<LinePolygonIntersectionHit<PointWritable>>>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});

test('infiniteLinePolygonIntersectionsInto는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new PolygonOutput<LinePolygonIntersectionHit<PointWritable>>();
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = infiniteLinePolygonIntersectionsInto(out, { ox: -1, oy: 0, dx: 1, dy: 0 }, polygon);
  expectTypeOf(result).toEqualTypeOf<PolygonOutput<LinePolygonIntersectionHit<PointWritable>>>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});

test('segmentPolygonIntersectionsInto는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new PolygonOutput<LinePolygonIntersectionHit<PointWritable>>();
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = segmentPolygonIntersectionsInto(out, { x1: -1, y1: 0, x2: 3, y2: 0 }, polygon);
  expectTypeOf(result).toEqualTypeOf<PolygonOutput<LinePolygonIntersectionHit<PointWritable>>>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});

test('rayPolygonOverlapIntervalsInto는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new PolygonOutput<LinePolygonOverlapIntervalDetail<PointWritable>>();
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = rayPolygonOverlapIntervalsInto(out, { ox: -1, oy: 0, dx: 1, dy: 0 }, polygon);
  expectTypeOf(result).toEqualTypeOf<PolygonOutput<LinePolygonOverlapIntervalDetail<PointWritable>>>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});

test('infiniteLinePolygonOverlapIntervalsInto는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new PolygonOutput<LinePolygonOverlapIntervalDetail<PointWritable>>();
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = infiniteLinePolygonOverlapIntervalsInto(out, { ox: -1, oy: 0, dx: 1, dy: 0 }, polygon);
  expectTypeOf(result).toEqualTypeOf<PolygonOutput<LinePolygonOverlapIntervalDetail<PointWritable>>>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});

test('segmentPolygonOverlapIntervalsInto는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new PolygonOutput<LinePolygonOverlapIntervalDetail<PointWritable>>();
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = segmentPolygonOverlapIntervalsInto(out, { x1: -1, y1: 0, x2: 3, y2: 0 }, polygon);
  expectTypeOf(result).toEqualTypeOf<PolygonOutput<LinePolygonOverlapIntervalDetail<PointWritable>>>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});

test('raysFromPointToPolygonInto는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new PolygonOutput<VisibilityRayHit<PointWritable>>();
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = raysFromPointToPolygonInto(out, { x: 1, y: 1 }, [polygon]);
  expectTypeOf(result).toEqualTypeOf<PolygonOutput<VisibilityRayHit<PointWritable>>>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});

test('visibilityPolygonInto는 출력 배열 서브클래스를 그대로 반환한다', () => {
  const out = new PolygonOutput<number>();
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = visibilityPolygonInto(out, { x: 1, y: 1 }, [polygon]);
  expectTypeOf(result).toEqualTypeOf<PolygonOutput<number>>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});
