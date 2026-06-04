import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';
import { assertFiniteScalar, finalizeScalarResult } from './scalar.internal';

/**
 * vector kinematics 입력의 x/y component가 모두 finite number인지 검증한다. 위반 시 `RangeError`.
 *
 * tuple과 object input을 모두 읽는다. `NaN`, `Infinity`, `-Infinity`는 모두 위반이다. 음수와
 * `0`은 허용한다. 검증은 읽기만 하므로 input/output aliasing에 안전하다.
 *
 * @param input 검증할 좌표 input
 * @param name error message에 사용할 인자 이름. component는 `${name}.x`, `${name}.y`로 표시한다.
 */
export function assertFiniteVector(input: XYInput, name: string): void {
  assertFiniteScalar(readX(input), `${name}.x`);
  assertFiniteScalar(readY(input), `${name}.y`);
}

/**
 * vector kinematics 결과 component를 마감한다. 결과가 finite하지 않으면 `RangeError`, `-0`이면
 * `0`을 반환한다.
 *
 * 모든 입력이 finite하게 검증된 뒤에도 곱셈/덧셈 overflow로 component가 `Infinity`,
 * `-Infinity`, `NaN`이 될 수 있다. scalar finalization과 동일 정책을 component 단위로 적용한다.
 *
 * @param result 검증하고 canonicalize할 component 결과
 * @param name error message에 사용할 결과 component 이름
 */
export function finalizeVectorComponent(result: number, name: string): number {
  return finalizeScalarResult(result, name);
}
