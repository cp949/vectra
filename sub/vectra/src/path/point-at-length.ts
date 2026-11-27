import type { PointWritable } from '../types/flat-shapes.internal';
import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { pointAtLengthInto } from './point-at-length-into';

/**
 * commands 위에서 path start로부터 distance만큼 이동한 새 plain point를 반환한다.
 *
 * `pointAtLengthInto`의 allocating companion이다.
 * distance는 [0, totalLength]로 clamp된다.
 * empty / move-only path (drawing segment 없음) → undefined.
 *
 * @param commands sampling할 path command sequence
 * @param distance path 시작점부터의 arc-length offset
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function pointAtLength(
  commands: readonly PathCommand[],
  distance: number,
  options?: Required<PathMeasurementOptions>
): PointWritable | undefined {
  const out: PointWritable = { x: 0, y: 0 };
  return pointAtLengthInto(out, commands, distance, options) ? out : undefined;
}
