/** 도형 샘플링 입력과 외부 클래스 출력 계약을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { directionInto } from '../../../src/random/direction-into';
import { pointInTriangleInto } from '../../../src/random/point-in-triangle-into';
import { pointOnSegmentInto } from '../../../src/random/point-on-segment-into';
import type { Bounds, Circle, Ellipse, Polygon, Polyline, Rect } from '../../../src/types/flat-shapes.internal';
import { pointInBoundsInto } from '../../../src/random/point-in-bounds-into';
import { pointInCircleInto } from '../../../src/random/point-in-circle-into';
import { pointInEllipseInto } from '../../../src/random/point-in-ellipse-into';
import { pointInPolygonInto } from '../../../src/random/point-in-polygon-into';
import { pointInRectInto } from '../../../src/random/point-in-rect-into';
import { pointOnPolylineInto } from '../../../src/random/point-on-polyline-into';

/** 출력 참조와 구체 타입을 확인할 외부 클래스. */
class OutputPoint {
  x = 0;
  y = 0;
  tag = 'keep';
}

test('도형 샘플링은 평평한 입력을 받는다', () => {
  expectTypeOf(pointInBoundsInto).parameter(1).toEqualTypeOf<Bounds>();
  expectTypeOf(pointInCircleInto).parameter(1).toEqualTypeOf<Circle>();
  expectTypeOf(pointInEllipseInto).parameter(1).toEqualTypeOf<Ellipse>();
  expectTypeOf(pointInPolygonInto).parameter(1).toEqualTypeOf<Polygon>();
  expectTypeOf(pointInRectInto).parameter(1).toEqualTypeOf<Rect>();
  expectTypeOf(pointOnPolylineInto).parameter(1).toEqualTypeOf<Polyline>();
});

test('방향과 선분 및 삼각형 샘플링은 출력 참조와 타입을 보존한다', () => {
  const out = new OutputPoint();
  const direction = directionInto(out, 1, () => 0);
  const segment = pointOnSegmentInto(out, { x1: 0, y1: 0, x2: 2, y2: 0 }, () => 0.5);
  const triangle = pointInTriangleInto(out, { x1: 0, y1: 0, x2: 2, y2: 0, x3: 0, y3: 2 }, () => 0.25);
  expect(direction).toBe(out);
  expect(segment).toBe(out);
  expect(triangle).toBe(out);
  expectTypeOf(direction).toEqualTypeOf<OutputPoint>();
  expectTypeOf(segment).toEqualTypeOf<OutputPoint>();
  expectTypeOf(triangle).toEqualTypeOf<OutputPoint>();
});
