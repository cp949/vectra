/** 난수 상태의 점 생성 함수가 출력 점의 구체 타입과 참조를 보존하는지 시험한다. */

import { expect, expectTypeOf, test } from 'vitest';
import { createRandomState } from '../../../src/random-state/create-random-state';

/** 점 좌표 외에 호출자 상태를 보관하는 출력 객체다. */
class OutputPoint {
  x = 0;
  y = 0;
  label = 'sample';
}

test('점 생성 Into 함수가 출력 점의 타입과 참조를 보존한다', () => {
  const state = createRandomState(949);
  const out = new OutputPoint();
  const start = { x: 0, y: 0 };
  const end = { x: 2, y: 0 };
  const direction = state.directionInto(out, 2);
  const segmentPoint = state.pointOnSegmentInto(out, { a: start, b: end });
  const trianglePoint = state.pointInTriangleInto(out, start, end, { x: 0, y: 2 });

  expectTypeOf(direction).toEqualTypeOf<OutputPoint>();
  expectTypeOf(segmentPoint).toEqualTypeOf<OutputPoint>();
  expectTypeOf(trianglePoint).toEqualTypeOf<OutputPoint>();
  expect(direction).toBe(out);
  expect(segmentPoint).toBe(out);
  expect(trianglePoint).toBe(out);
});
