/** 캡슐 Into 함수가 외부 출력 객체의 타입과 참조를 보존하는지 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { boundsInto, closestPointInto } from '../../../src/capsule';

/** 사용자 코드의 경계 상자 출력 클래스다. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  label = 'bounds';
}

/** 사용자 코드의 점 출력 클래스다. */
class ExternalPoint {
  x = 0;
  y = 0;
  label = 'point';
}

test('boundsInto와 closestPointInto는 외부 출력 타입과 참조를 보존한다', () => {
  const capsule = { x1: 0, y1: 0, x2: 3, y2: 0, r: 1 };
  const bounds = new ExternalBounds();
  const point = new ExternalPoint();
  const boundsResult = boundsInto(bounds, capsule);
  const pointResult = closestPointInto(point, capsule, { x: 1, y: 2 });
  expectTypeOf(boundsResult).toEqualTypeOf<ExternalBounds>();
  expectTypeOf(pointResult).toEqualTypeOf<ExternalPoint>();
  expect(boundsResult).toBe(bounds);
  expect(pointResult).toBe(point);
});
