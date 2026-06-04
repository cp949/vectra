import type { ClosestPointOptions, XYInput, XYObjectWritable } from '../types';
import { cubicClosestPointInto } from './cubic-closest-point-into';

/**
 * cubic Bezier curve 위에서 point에 가장 가까운 점을 새 object로 반환한다.
 *
 * `cubicClosestPointInto`의 allocating companion이다.
 *
 * tie-break: 동일 `distanceSquared`에서 작은 `t`를 선택한다.
 * `sampleCount`가 정수가 아니거나 2 미만이거나 non-finite이면 endpoint 두 점만 비교한다.
 * `tolerance`/`maxIterations`이 정책상 invalid이면 기본값으로 fallback한다.
 * oversized finite 좌표로 내부 `distanceSquared`가 `Infinity`가 되어도 `bx(t)`/`by(t)`는
 * finite 좌표를 그대로 반환한다.
 *
 * @param p0 curve 시작점
 * @param p1 첫 번째 제어점
 * @param p2 두 번째 제어점
 * @param p3 curve 끝점
 * @param point 투영 기준 점
 * @param options 수치 최적화 옵션
 */
export function cubicClosestPoint(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  p3: XYInput,
  point: XYInput,
  options?: ClosestPointOptions
): XYObjectWritable {
  return cubicClosestPointInto({ x: 0, y: 0 }, p0, p1, p2, p3, point, options);
}
