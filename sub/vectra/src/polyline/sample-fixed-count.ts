import type { PolylineLike, XYObjectWritable } from '../types';
import { sampleFixedCountInto } from './sample-fixed-count-into';

/**
 * polyline에서 arc-length 기준 균등하게 count개 point를 샘플링한 새 배열을 반환한다.
 *
 * empty polyline(`hasSegments === false`)은 빈 배열을 반환한다.
 * `count === 1`이면 시작점 1개만 반환한다. `count >= 2`이면 시작점과 끝점을 포함해
 * 균등 간격으로 count개를 반환한다.
 * repeated-point polyline(totalLen === 0)은 시작점을 count개 반환한다.
 *
 * `count <= 0` 또는 정수가 아니면 RangeError를 던진다.
 *
 * @param polyline 샘플링할 polyline
 * @param count 추출할 point 수 (positive integer)
 */
export function sampleFixedCount(polyline: PolylineLike, count: number): XYObjectWritable[] {
  return sampleFixedCountInto([], polyline, count);
}
