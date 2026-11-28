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
  const direction = state.directionInto(out, 2);
  const segmentPoint = state.pointOnSegmentInto(out, { x1: 0, y1: 0, x2: 2, y2: 0 });
  const trianglePoint = state.pointInTriangleInto(out, { x1: 0, y1: 0, x2: 2, y2: 0, x3: 0, y3: 2 });

  expectTypeOf(direction).toEqualTypeOf<OutputPoint>();
  expectTypeOf(segmentPoint).toEqualTypeOf<OutputPoint>();
  expectTypeOf(trianglePoint).toEqualTypeOf<OutputPoint>();
  expect(direction).toBe(out);
  expect(segmentPoint).toBe(out);
  expect(trianglePoint).toBe(out);
});
