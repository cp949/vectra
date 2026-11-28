/** 교차점 기록 함수의 출력 배열 반환 타입과 참조를 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
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
