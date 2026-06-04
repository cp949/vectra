import type { PolylineLike } from '../types';
import { segmentLengthsInto } from './segment-lengths-into';

/**
 * polyline의 인접 point 쌍별 segment 길이를 새 number 배열로 반환한다.
 *
 * 결과 개수는 segment 수(`Math.max(0, points.length - 1)`)와 같다. empty / single-point
 * polyline은 빈 배열을 반환한다. repeated-point segment는 `0`이다.
 *
 * 길이는 `Math.hypot` 기반으로 계산한다. 기존 polyline domain과 맞춰 non-finite 좌표 validation은
 * 수행하지 않는다. NaN / Infinity 좌표는 JS 산술 결과를 그대로 전파한다.
 *
 * @param polyline segment 길이를 계산할 polyline
 */
export function segmentLengths(polyline: PolylineLike): number[] {
  return segmentLengthsInto([], polyline);
}
