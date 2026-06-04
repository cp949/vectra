import type { PolylineLike, XYObjectWritable } from '../types';
import { sampleUniformInto } from './sample-uniform-into';

/**
 * polyline을 arc-length 기준 균등 간격으로 샘플링한 새 point 배열을 반환한다.
 *
 * empty polyline(`hasSegments === false`)은 빈 배열을 반환한다.
 * 시작점(distance 0)은 항상 포함된다. `options.includeLast !== false`이면 마지막
 * vertex도 포함한다. 마지막 균등 sample이 끝점과 정확히 같은 좌표이면 중복 push하지 않는다.
 * repeated-point polyline(totalLen === 0)은 시작점 1개만 반환한다.
 *
 * `spacing <= 0`이거나 finite가 아니면 RangeError를 던진다.
 *
 * @param polyline 샘플링할 polyline
 * @param spacing 균등 간격 (arc-length 단위, finite positive number)
 * @param options includeLast — false이면 마지막 vertex를 강제 포함하지 않는다
 */
export function sampleUniform(
  polyline: PolylineLike,
  spacing: number,
  options?: { includeLast?: boolean }
): XYObjectWritable[] {
  return sampleUniformInto([], polyline, spacing, options);
}
