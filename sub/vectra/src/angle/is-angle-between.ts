import { assertFiniteNumbers } from '../math/range.internal';
import { wrapRadiansPositive } from './wrap-radians-positive';

/**
 * angle이 start에서 end로 가는 CCW 호 안에 포함되면 true를 반환한다.
 *
 * start와 end 경계는 inclusive이다. wrap-around를 지원한다.
 * 구현: `wrapRadiansPositive(angle - start)`가 `[0, wrapRadiansPositive(end - start)]` 범위에 있으면 true.
 *
 * 주의: `end - start`가 0 또는 2π의 배수이면 sweep이 0이 되어 start 위치만 포함된다.
 * "전체 원" 범위는 이 함수로 표현할 수 없다.
 *
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param angle 검사할 angle (radian)
 * @param start CCW 호의 시작 angle (radian)
 * @param end CCW 호의 끝 angle (radian)
 */
export function isAngleBetween(angle: number, start: number, end: number): boolean {
  assertFiniteNumbers([angle, start, end]);

  // angle - start와 end - start를 모두 [0, 2π) 범위로 정규화해 호환 비교한다.
  // wrapRadians([-π, π))을 쓰면 π 경계에서 -π로 매핑돼 false를 잘못 반환한다.
  const relAngle = wrapRadiansPositive(angle - start);
  const sweep = wrapRadiansPositive(end - start);

  return relAngle <= sweep;
}
