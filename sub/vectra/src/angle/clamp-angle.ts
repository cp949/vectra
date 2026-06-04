import { assertFiniteNumbers } from '../math/range.internal';
import { wrapRadiansPositive } from './wrap-radians-positive';

/**
 * angle을 start에서 end까지 CCW inclusive interval로 clamp한다.
 *
 * interval 안이면 angle을 그대로 반환한다.
 * interval 밖이면 circular distance가 더 가까운 boundary를 반환한다.
 * tie distance는 start를 우선한다.
 * start === end 또는 full-turn equivalent이면 zero-length interval로 보고 start를 반환한다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param angle clamp할 angle (radian)
 * @param start CCW interval 시작 angle (radian, inclusive)
 * @param end CCW interval 끝 angle (radian, inclusive)
 */
export function clampAngle(angle: number, start: number, end: number): number {
  assertFiniteNumbers([angle, start, end]);

  const intervalSweep = wrapRadiansPositive(end - start);

  // zero-length interval: start === end 또는 full-turn equivalent
  if (intervalSweep === 0) return start;

  const relAngle = wrapRadiansPositive(angle - start);

  // angle이 CCW interval [start, end] 안에 있으면 그대로 반환한다
  if (relAngle <= intervalSweep) return angle;

  // interval 밖: 각 boundary까지의 circular distance를 비교한다
  const relEnd = wrapRadiansPositive(angle - end);
  const distToStart = Math.min(relAngle, 2 * Math.PI - relAngle);
  const distToEnd = Math.min(relEnd, 2 * Math.PI - relEnd);

  // tie는 start 우선
  return distToStart <= distToEnd ? start : end;
}
