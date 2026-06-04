import { readX, readY, writeXY } from '../internal/xy';
import type { XYInput, XYWritable } from '../types';
import { assertFiniteScalar } from './scalar.internal';
import { assertFiniteVector, finalizeVectorComponent } from './vector.internal';

/**
 * 상수 가속도에서 경과 시간 뒤의 위치 벡터를 out에 기록하고 out을 반환한다. component-wise
 * 수식은 `initialPosition + initialVelocity * time + 0.5 * acceleration * time * time`이다.
 *
 * `initialPosition`, `initialVelocity`, `acceleration`의 x/y component와 `time`은 모두 finite
 * number여야 한다. `NaN`, `Infinity`, `-Infinity`는 `RangeError`. `time < 0`은 역방향 closed-form
 * evaluation으로 허용한다.
 *
 * overflow로 결과 component가 non-finite면 `RangeError`이고, 실패 전에는 out을 수정하지 않는다.
 * 모든 component를 계산·마감한 뒤 한 번에 commit하므로 out이 `initialPosition`, `initialVelocity`,
 * `acceleration` 중 하나와 같은 object여도 원래 input 값을 기준으로 계산한다. `-0` 결과 component는
 * `0`으로 반환한다.
 *
 * @param out 결과를 기록할 writable output
 * @param initialPosition 초기 위치 벡터 p0
 * @param initialVelocity 초기 속도 벡터 v0
 * @param acceleration 상수 가속도 벡터 a
 * @param time 경과 시간 t. 음수는 역방향 평가다.
 */
export function positionInto<Out extends XYWritable>(
  out: Out,
  initialPosition: XYInput,
  initialVelocity: XYInput,
  acceleration: XYInput,
  time: number
): Out {
  assertFiniteVector(initialPosition, 'initialPosition');
  assertFiniteVector(initialVelocity, 'initialVelocity');
  assertFiniteVector(acceleration, 'acceleration');
  assertFiniteScalar(time, 'time');

  // aliasing 안전: writeXY 전에 모든 input component를 읽는다.
  const p0x = readX(initialPosition);
  const p0y = readY(initialPosition);
  const v0x = readX(initialVelocity);
  const v0y = readY(initialVelocity);
  const ax = readX(acceleration);
  const ay = readY(acceleration);

  const halfTimeSquared = 0.5 * time * time;
  const x = finalizeVectorComponent(p0x + v0x * time + ax * halfTimeSquared, 'position.x');
  const y = finalizeVectorComponent(p0y + v0y * time + ay * halfTimeSquared, 'position.y');

  return writeXY(out, x, y);
}
