import type { XYInput, XYObjectWritable } from '../types';
import { velocityInto } from './velocity-into';

/**
 * 상수 가속도에서 경과 시간 뒤의 속도 벡터를 새 `{ x, y }` object로 반환한다. component-wise
 * 수식은 `initialVelocity + acceleration * time`이다.
 *
 * `initialVelocity`, `acceleration`의 x/y component와 `time`은 모두 finite number여야 한다.
 * `NaN`, `Infinity`, `-Infinity`는 `RangeError`. `time < 0`은 역방향 closed-form evaluation으로
 * 허용한다.
 *
 * overflow로 결과 component가 non-finite면 `RangeError`. `-0` 결과 component는 `0`으로 반환한다.
 *
 * @param initialVelocity 초기 속도 벡터 v0
 * @param acceleration 상수 가속도 벡터 a
 * @param time 경과 시간 t. 음수는 역방향 평가다.
 */
export function velocity(initialVelocity: XYInput, acceleration: XYInput, time: number): XYObjectWritable {
  return velocityInto({ x: 0, y: 0 }, initialVelocity, acceleration, time);
}
