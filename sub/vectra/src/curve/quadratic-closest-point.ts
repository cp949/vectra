import type { ClosestPointOptions, XYInput, XYObjectWritable } from '../types';
import { quadraticClosestPointInto } from './quadratic-closest-point-into';

/**
 * quadratic Bezier curve 위에서 point에 가장 가까운 점을 새 object로 반환한다.
 *
 * `quadraticClosestPointInto`의 allocating companion이다.
 *
 * tie-break: 동일 `distanceSquared`에서 작은 `t`를 선택한다.
 * `sampleCount`가 정수가 아니거나 2 미만이거나 non-finite이면 endpoint 두 점만 비교한다.
 * `tolerance`/`maxIterations`이 정책상 invalid이면 기본값으로 fallback한다.
 * oversized finite 좌표로 내부 `distanceSquared`가 `Infinity`가 되어도 `bx(t)`/`by(t)`는
 * finite 좌표를 그대로 반환한다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param point 투영 기준 점
 * @param options 수치 최적화 옵션
 */
export function quadraticClosestPoint(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  point: XYInput,
  options?: ClosestPointOptions
): XYObjectWritable {
  return quadraticClosestPointInto({ x: 0, y: 0 }, p0, p1, p2, point, options);
}
