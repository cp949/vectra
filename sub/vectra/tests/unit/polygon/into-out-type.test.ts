/** Polygon의 평평한 입출력 계약을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { boundsInto } from '../../../src/polygon/bounds-into';
import { boundingCircleInto } from '../../../src/polygon/bounding-circle-into';
import type { Polygon } from '../../../src/types/flat-shapes.internal';

/** 외부 경계 객체를 흉내 낸다. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  tag = 'bounds';
}

/** 외부 원 객체를 흉내 낸다. */
class ExternalCircle {
  cx = 0;
  cy = 0;
  r = 0;
  tag = 'circle';
}

test('boundsInto는 외부 경계 객체의 참조와 타입을 보존한다', () => {
  const polygon: Polygon = [0, 0, 2, 0, 0, 2];
  const out = new ExternalBounds();
  const result = boundsInto(out, polygon);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});

test('boundingCircleInto는 외부 원 객체의 참조와 타입을 보존한다', () => {
  const out = new ExternalCircle();
  const result = boundingCircleInto(out, [0, 0, 2, 0, 0, 2]);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalCircle>();
});
