/** 교차점 기록 함수의 출력 배열 반환 타입과 참조를 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { circleBoundsIntersectionsInto } from '../../../src/intersects/circle-bounds-intersections-into';
import { circleTriangleIntersectionsInto } from '../../../src/intersects/circle-triangle-intersections-into';
import { segmentCircleIntersectionsInto } from '../../../src/intersects/segment-circle-intersections-into';
import { circleRectIntersectionsInto } from '../../../src/intersects/circle-rect-intersections-into';
import { circleCircleIntersectionsInto } from '../../../src/intersects/circle-circle-intersections-into';
import type { Circle, PointWritable } from '../../../src/types/flat-shapes.internal';

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
