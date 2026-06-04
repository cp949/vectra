import type { PolylineLike, XYObjectWritable } from '../types';
import { pointAtLengthRatioInto } from './point-at-length-ratio-into';

/**
 * polyline의 normalized arclength 위치 ratio에 해당하는 point를 새 plain object로 반환한다.
 *
 * ratio는 [0, 1]로 clamp된다. empty polyline에서는 undefined를 반환한다.
 * single-point polyline 또는 total length가 0인 repeated-point polyline은 첫 point를 반환한다.
 *
 * `pointAtLengthRatioInto`에 위임하는 allocating companion이다.
 *
 * @param polyline sampling할 polyline
 * @param ratio 전체 길이에 대한 normalized 위치 (distance / totalLength)
 */
export function pointAtLengthRatio(polyline: PolylineLike, ratio: number): XYObjectWritable | undefined {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  if (!pointAtLengthRatioInto(seed, polyline, ratio)) return undefined;
  return seed;
}
