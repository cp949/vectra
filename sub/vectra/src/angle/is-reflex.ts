import { wrapRadiansPositive } from './wrap-radians-positive';

/**
 * 단일 angle scalar가 reflex 영역에 있는지 판정한다.
 *
 * `wrapRadiansPositive(angle)` 기준 `Math.PI < normalized < 2 * Math.PI`이면 `true`다.
 * `normalized === 0`, `normalized === Math.PI`, `0 < normalized < Math.PI`는 `false`다.
 * 두 angle 사이 sweep을 판정하려면 `isReflexSweep`을 쓴다. 단일 angle semantic과 다르다.
 * non-finite 입력은 RangeError를 던진다.
 *
 * @param angle 판정할 angle (radian)
 */
export function isReflex(angle: number): boolean {
  const normalized = wrapRadiansPositive(angle);

  return normalized > Math.PI && normalized < 2 * Math.PI;
}
