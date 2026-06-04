import type { PolylineLike } from '../types';
import { cumulativeLengthsInto } from './cumulative-lengths-into';

/**
 * polyline의 vertex별 누적 arc-length lookup table을 새 number 배열로 반환한다.
 *
 * 결과 개수는 `points.length`와 같고 첫 값은 항상 `0`이다. empty polyline은 빈 배열,
 * single-point polyline은 `[0]`을 반환한다. repeated-point segment는 이전 누적값과 같은 값을
 * 반복한다.
 *
 * 길이는 `Math.hypot` 기반으로 계산한다. 기존 polyline domain과 맞춰 non-finite 좌표 validation은
 * 수행하지 않는다. NaN / Infinity 좌표는 JS 산술 결과를 그대로 전파한다.
 *
 * @param polyline 누적 arc-length를 계산할 polyline
 */
export function cumulativeLengths(polyline: PolylineLike): number[] {
  return cumulativeLengthsInto([], polyline);
}
