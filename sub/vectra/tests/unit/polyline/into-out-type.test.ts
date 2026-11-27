/** polyline Into의 입력 타입과 외부 출력 객체의 참조·반환 타입을 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { boundsInto } from '../../../src/polyline/bounds-into';
import type { Polyline } from '../../../src/types/flat-shapes.internal';

/** 호출자가 제공하는 bounds 클래스다. */
class ExternalBounds {
  minX = 0;
  minY = 0;
  maxX = 0;
  maxY = 0;
  tag = 'bounds';
}

test('boundsInto는 점 배열을 읽고 외부 bounds의 타입과 참조를 보존한다', () => {
  expectTypeOf(boundsInto).parameter(1).toEqualTypeOf<Polyline>();
  const out = new ExternalBounds();
  const result = boundsInto(out, [{ x: 1, y: 2 }]);
  expect(result).toBe(out);
  expectTypeOf(result).toEqualTypeOf<ExternalBounds>();
});
