import type { PathCommand, PathMeasurementOptions, XYInput, XYObjectWritable } from '../types/index';
import { closestPointInto } from './closest-point-into';

/**
 * commands 위에서 point에 가장 가까운 새 plain point를 반환한다.
 *
 * `closestPointInto`의 allocating companion이다.
 * empty path → undefined.
 * Move-only path → 첫 MoveCommand 위치(또는 implicit origin)를 담은 새 object 반환.
 *
 *
 * tolerance/iteration option 정책은 `closestPointInto`와 동일하다.
 * @param commands 탐색 대상 path command sequence
 * @param point 가장 가까운 점을 찾을 기준 좌표
 * @param options flatten 옵션 (flatness, maxRecursion)
 */
export function closestPoint(
  commands: readonly PathCommand[],
  point: XYInput,
  options?: PathMeasurementOptions
): XYObjectWritable | undefined {
  const out: XYObjectWritable = { x: 0, y: 0 };
  return closestPointInto(out, commands, point, options) ? out : undefined;
}
