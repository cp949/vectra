import { assertFiniteNumbers } from '../math/range.internal';
import { wrapRadiansPositive } from './wrap-radians-positive';

const HALF_PI = Math.PI / 2;
const QUADRANT_COUNT = 4;

/**
 * angle의 사분면 번호를 반환한다.
 *
 * `wrapRadiansPositive(angle)` 기준 `[0, π/2)` half-open bucket 번호를 반환한다.
 * 경계값은 다음 bucket에 포함된다. `2π` equivalent는 `0`이다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param angle 판정할 angle (radian)
 */
export function quadrant(angle: number): 0 | 1 | 2 | 3 {
  assertFiniteNumbers([angle]);

  const wrapped = wrapRadiansPositive(angle);
  const bucket = Math.floor(wrapped / HALF_PI);

  // floating point 오차로 bucket이 상한을 초과하면 0으로 돌린다
  return (bucket >= QUADRANT_COUNT ? 0 : bucket) as 0 | 1 | 2 | 3;
}
