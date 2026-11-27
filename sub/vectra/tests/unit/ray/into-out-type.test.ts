/** 광선 Into 함수의 외부 출력 타입과 참조 보존을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { closestPointInto, copyInto, directionInto, fromAngleInto, fromSegmentInto } from '../../../src/ray';

/** 사용자 코드의 광선 출력 클래스다. */
class ExternalRay {
  ox = 0;
  oy = 0;
  dx = 0;
  dy = 0;
  label = 'ray';
}

/** 사용자 코드의 점 출력 클래스다. */
class ExternalPoint {
  x = 0;
  y = 0;
  label = 'point';
}

test('광선 생성 Into는 외부 광선 타입과 참조를 보존한다', () => {
  const out = new ExternalRay();
  const copied = copyInto(out, { ox: 1, oy: 2, dx: 3, dy: 4 });
  const angled = fromAngleInto(out, { x: 1, y: 2 }, 0);
  const segment = fromSegmentInto(out, { x1: 1, y1: 2, x2: 4, y2: 6 });
  expectTypeOf(copied).toEqualTypeOf<ExternalRay>();
  expectTypeOf(angled).toEqualTypeOf<ExternalRay>();
  expectTypeOf(segment).toEqualTypeOf<ExternalRay>();
  expect(copied).toBe(out);
  expect(angled).toBe(out);
  expect(segment).toBe(out);
});

test('최근접점과 방향 Into는 외부 점 타입과 참조를 보존한다', () => {
  const out = new ExternalPoint();
  const ray = { ox: 1, oy: 2, dx: 3, dy: 4 };
  const closest = closestPointInto(out, ray, { x: 3, y: 2 });
  const direction = directionInto(out, ray);
  expectTypeOf(closest).toEqualTypeOf<ExternalPoint>();
  expectTypeOf(direction).toEqualTypeOf<ExternalPoint>();
  expect(closest).toBe(out);
  expect(direction).toBe(out);
});
