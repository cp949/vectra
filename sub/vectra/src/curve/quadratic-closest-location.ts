import { readX, readY } from '../internal/xy';
import type { ClosestPointOptions, CurveLocationResult, XYInput } from '../types';
import { findQuadraticClosestLocation } from './bezier-closest-location.internal';

/**
 * quadratic Bezier curve 위에서 point에 가장 가까운 위치를 `CurveLocationResult`로 반환한다.
 *
 * 좌표뿐 아니라 curve-local parameter `t`와 query까지 거리를 함께 반환한다.
 *
 * 알고리즘: 초기 sample(sampleCount개)로 후보 t를 찾고, 각 후보를 Newton-Raphson으로 정제한다.
 * endpoint(t=0, t=1)도 함께 비교해 global minimum을 선택한다.
 * tie-break: 동일 `distanceSquared`에서 작은 `t`를 선택한다.
 *
 * `sampleCount`가 정수가 아니거나 2 미만이거나 non-finite이면 endpoint 두 점만 비교한다.
 * `tolerance`/`maxIterations`이 정책상 invalid이면 기본값으로 fallback한다.
 * `distance`는 `Math.sqrt(distanceSquared)`로 계산하므로 oversized finite 좌표로
 * `distanceSquared`가 `Infinity`가 되면 `distance`도 `Infinity`다.
 * `t`는 `[0, 1]`로 clamp된다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param point 투영 기준 점
 * @param options 수치 최적화 옵션
 */
export function quadraticClosestLocation(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  point: XYInput,
  options?: ClosestPointOptions
): CurveLocationResult {
  const core = findQuadraticClosestLocation(
    readX(p0),
    readY(p0),
    readX(p1),
    readY(p1),
    readX(p2),
    readY(p2),
    readX(point),
    readY(point),
    options
  );
  return {
    point: { x: core.x, y: core.y },
    t: core.t,
    distance: Math.sqrt(core.distanceSquared),
    distanceSquared: core.distanceSquared,
  };
}
