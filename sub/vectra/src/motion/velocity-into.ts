import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import { assertFiniteScalar } from './scalar.internal';
import { assertFiniteVector, finalizeVectorComponent } from './vector.internal';

/**
 * 상수 가속도에서 경과 시간 뒤의 속도 벡터를 out에 기록하고 out을 반환한다. component-wise
 * 수식은 `initialVelocity + acceleration * time`이다.
 *
 * `initialVelocity`, `acceleration`의 x/y component와 `time`은 모두 finite number여야 한다.
 * `NaN`, `Infinity`, `-Infinity`는 `RangeError`. `time < 0`은 역방향 closed-form evaluation으로
 * 허용한다.
 *
 * overflow로 결과 component가 non-finite면 `RangeError`이고, 실패 전에는 out을 수정하지 않는다.
 * 모든 component를 계산·마감한 뒤 한 번에 commit하므로 out이 `initialVelocity` 또는
 * `acceleration`과 같은 object여도 원래 input 값을 기준으로 계산한다. `-0` 결과 component는 `0`으로
 * 반환한다.
 *
 * @param out 결과를 기록할 writable output
 * @param initialVelocity 초기 속도 벡터 v0
 * @param acceleration 상수 가속도 벡터 a
 * @param time 경과 시간 t. 음수는 역방향 평가다.
 */
export function velocityInto<Out extends XYWritable>(
  out: Out,
  initialVelocity: XYInput,
  acceleration: XYInput,
  time: number
): Out {
  assertFiniteVector(initialVelocity, 'initialVelocity');
  assertFiniteVector(acceleration, 'acceleration');
  assertFiniteScalar(time, 'time');

  // aliasing 안전: writeXY 전에 모든 input component를 읽는다.
  const v0x = readX(initialVelocity);
  const v0y = readY(initialVelocity);
  const ax = readX(acceleration);
  const ay = readY(acceleration);

  const x = finalizeVectorComponent(v0x + ax * time, 'velocity.x');
  const y = finalizeVectorComponent(v0y + ay * time, 'velocity.y');

  return writeXY(out, x, y);
}
