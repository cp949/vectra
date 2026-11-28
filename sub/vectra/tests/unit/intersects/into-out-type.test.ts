/**
 * 교차 결과를 기록하는 Into 함수의 입력·출력 타입과 참조를 검증한다.
 * 새 원소를 push하는 출력 배열은 원소 타입을 함수가 만드는 타입으로 고정한다.
 * 좁은 원소 타입 배열을 넘겨도 반환 타입이 넓어진 실제 원소 타입인지 확인한다.
 */
import { expect, expectTypeOf, test } from 'vitest';
import { infiniteLineBoundsIntersectionsInto } from '../../../src/intersects/infinite-line-bounds-intersections-into';

import { infiniteLineRectIntersectionsInto } from '../../../src/intersects/infinite-line-rect-intersections-into';

import { rayBoundsIntersectionsInto } from '../../../src/intersects/ray-bounds-intersections-into';

import { rayRectIntersectionsInto } from '../../../src/intersects/ray-rect-intersections-into';

import { segmentBoundsIntersectionsInto } from '../../../src/intersects/segment-bounds-intersections-into';

import { segmentRectIntersectionsInto } from '../../../src/intersects/segment-rect-intersections-into';
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
  PolygonWritable,
  Ray,
  Segment,
} from '../../../src/types/flat-shapes.internal';

/** 호출자가 점에 표지를 붙여 쓰는 좁은 원소 타입. 함수가 push한 점은 이 클래스의 인스턴스가 아니다. */
class TaggedPoint {
  x = 0;
  y = 0;
  readonly tag = '호출자 점';
}

type TaggedHit = LinePolygonIntersectionHit & { tag: string };
type TaggedInterval = LinePolygonOverlapIntervalDetail & { tag: string };
type TaggedRayHit = VisibilityRayHit & { tag: string };

test('circleCircleIntersectionsInto는 새 점을 push하므로 원소 타입을 PointWritable로 고정한다', () => {
  const a: Circle = { cx: 0, cy: 0, r: 2 };
  const b: Circle = { cx: 4, cy: 0, r: 2 };
  const out: TaggedPoint[] = [];
  const result = circleCircleIntersectionsInto(out, a, b);

  expectTypeOf(result).toEqualTypeOf<PointWritable[]>();
  expect(result).toBe(out);
  expect(out[0]).toEqual({ x: 2, y: 0 });
  expect(out[0]).not.toBeInstanceOf(TaggedPoint);
});

test('원과 사각 경계·삼각형·선분의 교점 함수는 원소 타입을 PointWritable로 고정한다', () => {
  const circle = { cx: 0, cy: 5, r: 3 };
  const out: TaggedPoint[] = [];
  const bounds = circleBoundsIntersectionsInto(out, circle, { minX: 0, minY: 0, maxX: 10, maxY: 10 });
  const rect = circleRectIntersectionsInto(out, circle, { x: 0, y: 0, width: 10, height: 10 });
  const triangle = circleTriangleIntersectionsInto(
    out,
    { cx: 0, cy: 0, r: 2 },
    { x1: 0, y1: 0, x2: 10, y2: 0, x3: 0, y3: 10 }
  );
  const segment = segmentCircleIntersectionsInto(out, { x1: -3, y1: 0, x2: 3, y2: 0 }, { cx: 0, cy: 0, r: 2 });
  expectTypeOf(bounds).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(rect).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(triangle).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(segment).toEqualTypeOf<PointWritable[]>();
  for (const result of [bounds, rect, triangle, segment]) {
    expect(result).toBe(out);
  }
  expect(out).toHaveLength(2);
  expect(out[0]).not.toBeInstanceOf(TaggedPoint);
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

test('원과 타원의 직선 계열 교점 함수는 원소 타입을 PointWritable로 고정한다', () => {
  const out: TaggedPoint[] = [];
  const ray = { ox: -3, oy: 0, dx: 1, dy: 0 };
  const segment = { x1: -3, y1: 0, x2: 3, y2: 0 };
  const circle = { cx: 0, cy: 0, r: 2 };
  const ellipse = { cx: 0, cy: 0, rx: 2, ry: 1 };
  const rayCircle = rayCircleIntersectionsInto(out, ray, circle);
  const rayEllipse = rayEllipseIntersectionsInto(out, ray, ellipse);
  const lineCircle = infiniteLineCircleIntersectionsInto(out, ray, circle);
  const lineEllipse = infiniteLineEllipseIntersectionsInto(out, ray, ellipse);
  const segmentEllipse = segmentEllipseIntersectionsInto(out, segment, ellipse);
  expectTypeOf(rayCircle).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(rayEllipse).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(lineCircle).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(lineEllipse).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(segmentEllipse).toEqualTypeOf<PointWritable[]>();
  for (const result of [rayCircle, rayEllipse, lineCircle, lineEllipse, segmentEllipse]) {
    expect(result).toBe(out);
  }
  expect(out).toHaveLength(2);
  expect(out[0]).not.toBeInstanceOf(TaggedPoint);
});

test('타원 경계의 교점 함수는 원소 타입을 PointWritable로 고정한다', () => {
  const out: TaggedPoint[] = [];
  const ellipse = { cx: 0, cy: 0, rx: 2, ry: 1 };
  const circle = { cx: 2, cy: 0, r: 2 };
  const other = { cx: 2, cy: 0, rx: 2, ry: 1 };
  const triangle = { x1: 0, y1: 0, x2: 10, y2: 0, x3: 0, y3: 10 };
  const circleResult = ellipseCircleIntersectionsInto(out, ellipse, circle);
  const ellipseResult = ellipseEllipseIntersectionsInto(out, ellipse, other);
  const triangleResult = ellipseTriangleIntersectionsInto(out, ellipse, triangle);
  expectTypeOf(circleResult).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(ellipseResult).toEqualTypeOf<PointWritable[]>();
  expectTypeOf(triangleResult).toEqualTypeOf<PointWritable[]>();
  for (const result of [circleResult, ellipseResult, triangleResult]) {
    expect(result).toBe(out);
  }
  expect(out).toHaveLength(2);
  expect(out[0]).not.toBeInstanceOf(TaggedPoint);
});

test('polyline 교점 함수는 원소 타입을 PointWritable로 고정한다', () => {
  const out: TaggedPoint[] = [];
  const horizontal = [
    { x: -3, y: 0 },
    { x: 3, y: 0 },
  ];
  const vertical = [
    { x: 0, y: -3 },
    { x: 0, y: 3 },
  ];
  const circleResult = circlePolylineIntersectionsInto(out, { cx: 0, cy: 0, r: 2 }, horizontal);
  expectTypeOf(circleResult).toEqualTypeOf<PointWritable[]>();
  expect(circleResult).toBe(out);
  expect(out).toHaveLength(2);
  expect(out[0]).not.toBeInstanceOf(TaggedPoint);

  const polylineResult = polylinePolylineIntersectionsInto(out, horizontal, vertical);
  expectTypeOf(polylineResult).toEqualTypeOf<PointWritable[]>();
  expect(polylineResult).toBe(out);
  expect(out[0]).toEqual({ x: 0, y: 0 });
});

test('rayPolygonHitT는 평평한 반직선과 다각형을 받는다', () => {
  expectTypeOf(rayPolygonHitT).parameter(0).toEqualTypeOf<Ray>();
  expectTypeOf(rayPolygonHitT).parameter(1).toEqualTypeOf<Polygon>();
});

test('다각형 교점 함수는 새 hit을 push하므로 원소 타입을 LinePolygonIntersectionHit로 고정한다', () => {
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const out: TaggedHit[] = [];
  const ray = rayPolygonIntersectionsInto(out, { ox: -1, oy: 0, dx: 1, dy: 0 }, polygon);
  const line = infiniteLinePolygonIntersectionsInto(out, { ox: -1, oy: 0, dx: 1, dy: 0 }, polygon);
  const segment = segmentPolygonIntersectionsInto(out, { x1: -1, y1: 0, x2: 3, y2: 0 }, polygon);
  expectTypeOf(ray).toEqualTypeOf<LinePolygonIntersectionHit[]>();
  expectTypeOf(line).toEqualTypeOf<LinePolygonIntersectionHit[]>();
  expectTypeOf(segment).toEqualTypeOf<LinePolygonIntersectionHit[]>();
  for (const result of [ray, line, segment]) {
    expect(result).toBe(out);
  }
  expect(out.length).toBeGreaterThan(0);
  expect('tag' in out[0]).toBe(false);
});

test('다각형 겹침 구간 함수는 원소 타입을 LinePolygonOverlapIntervalDetail로 고정한다', () => {
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const out: TaggedInterval[] = [];
  const ray = rayPolygonOverlapIntervalsInto(out, { ox: -1, oy: 0, dx: 1, dy: 0 }, polygon);
  const line = infiniteLinePolygonOverlapIntervalsInto(out, { ox: -1, oy: 0, dx: 1, dy: 0 }, polygon);
  const segment = segmentPolygonOverlapIntervalsInto(out, { x1: -1, y1: 0, x2: 3, y2: 0 }, polygon);
  expectTypeOf(ray).toEqualTypeOf<LinePolygonOverlapIntervalDetail[]>();
  expectTypeOf(line).toEqualTypeOf<LinePolygonOverlapIntervalDetail[]>();
  expectTypeOf(segment).toEqualTypeOf<LinePolygonOverlapIntervalDetail[]>();
  for (const result of [ray, line, segment]) {
    expect(result).toBe(out);
  }
  expect(out.length).toBeGreaterThan(0);
  expect('tag' in out[0]).toBe(false);
});

test('raysFromPointToPolygonInto는 원소 타입을 VisibilityRayHit로 고정한다', () => {
  const out: TaggedRayHit[] = [];
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = raysFromPointToPolygonInto(out, { x: 1, y: 1 }, [polygon]);
  expectTypeOf(result).toEqualTypeOf<VisibilityRayHit[]>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
  expect('tag' in out[0]).toBe(false);
});

test('visibilityPolygonInto는 좌표 배열을 받아 PolygonWritable로 반환한다', () => {
  const out: Array<0 | 1> = [];
  const polygon = [0, 0, 2, 0, 2, 2, 0, 2];
  const result = visibilityPolygonInto(out, { x: 1, y: 1 }, [polygon]);
  expectTypeOf(result).toEqualTypeOf<PolygonWritable>();
  expect(result).toBe(out);
  expect(out.length).toBeGreaterThan(0);
});

test('직선 계열과 사각 경계의 교점 배열 타입을 고정한다', () => {
  const out: TaggedPoint[] = [];
  const bounds = { minX: 0, minY: 0, maxX: 2, maxY: 2 };
  const rect = { x: 0, y: 0, width: 2, height: 2 };
  const line = { ox: -1, oy: 1, dx: 1, dy: 0 };
  const segment = { x1: -1, y1: 1, x2: 3, y2: 1 };
  const infiniteLineBoundsIntersectionsIntoResult = infiniteLineBoundsIntersectionsInto(out, line, bounds);
  expectTypeOf(infiniteLineBoundsIntersectionsIntoResult).toEqualTypeOf<PointWritable[]>();
  expect(infiniteLineBoundsIntersectionsIntoResult).toBe(out);
  const infiniteLineRectIntersectionsIntoResult = infiniteLineRectIntersectionsInto(out, line, rect);
  expectTypeOf(infiniteLineRectIntersectionsIntoResult).toEqualTypeOf<PointWritable[]>();
  expect(infiniteLineRectIntersectionsIntoResult).toBe(out);
  const rayBoundsIntersectionsIntoResult = rayBoundsIntersectionsInto(out, line, bounds);
  expectTypeOf(rayBoundsIntersectionsIntoResult).toEqualTypeOf<PointWritable[]>();
  expect(rayBoundsIntersectionsIntoResult).toBe(out);
  const rayRectIntersectionsIntoResult = rayRectIntersectionsInto(out, line, rect);
  expectTypeOf(rayRectIntersectionsIntoResult).toEqualTypeOf<PointWritable[]>();
  expect(rayRectIntersectionsIntoResult).toBe(out);
  const segmentBoundsIntersectionsIntoResult = segmentBoundsIntersectionsInto(out, segment, bounds);
  expectTypeOf(segmentBoundsIntersectionsIntoResult).toEqualTypeOf<PointWritable[]>();
  expect(segmentBoundsIntersectionsIntoResult).toBe(out);
  const segmentRectIntersectionsIntoResult = segmentRectIntersectionsInto(out, segment, rect);
  expectTypeOf(segmentRectIntersectionsIntoResult).toEqualTypeOf<PointWritable[]>();
  expect(segmentRectIntersectionsIntoResult).toBe(out);
});
