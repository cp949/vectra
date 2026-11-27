/** 벡터 운동 Into 함수가 출력 객체의 타입과 참조를 보존하는지 검증한다. */
import { expect, expectTypeOf, test } from 'vitest';
import { displacementVectorInto } from '../../../src/motion/displacement-vector-into';
import { positionInto } from '../../../src/motion/position-into';
import { velocityInto } from '../../../src/motion/velocity-into';

/** 운동 결과를 기록할 외부 점 클래스. */
class Output {
  x = 0;
  y = 0;
  label = '운동 결과';
}

test('변위, 속도, 위치는 전달된 점 인스턴스와 구체 타입을 보존한다', () => {
  const point = { x: 1, y: 2 };
  const displacement = new Output();
  const velocity = new Output();
  const position = new Output();

  const displacementResult = displacementVectorInto(displacement, point, point, 1);
  const velocityResult = velocityInto(velocity, point, point, 1);
  const positionResult = positionInto(position, point, point, point, 1);

  expectTypeOf(displacementResult).toEqualTypeOf<Output>();
  expectTypeOf(velocityResult).toEqualTypeOf<Output>();
  expectTypeOf(positionResult).toEqualTypeOf<Output>();
  expect(displacementResult).toBe(displacement);
  expect(velocityResult).toBe(velocity);
  expect(positionResult).toBe(position);
});
