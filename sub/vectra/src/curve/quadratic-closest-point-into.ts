import { readX, readY, writeXY } from '../internal/xy';
import type { ClosestPointOptions, XYInput, XYWritable } from '../types';
import { findQuadraticClosestLocation } from './bezier-closest-location.internal';

/**
 * quadratic Bezier curve 위에서 point에 가장 가까운 점을 out에 기록하고 out을 반환한다.
 *
 * 알고리즘: 초기 sample(sampleCount개)로 후보 t를 찾고, 각 후보를 Newton-Raphson으로 정제한다.
 * endpoint(t=0, t=1)도 함께 비교해 global minimum을 반환한다.
 * tie-break: 동일 `distanceSquared`에서 작은 `t`를 선택한다.
 *
 * `sampleCount`가 정수가 아니거나 2 미만이거나 non-finite이면 endpoint 두 점만 비교한다.
 * `tolerance`/`maxIterations`이 정책상 invalid이면 기본값으로 fallback한다.
 * oversized finite 좌표로 내부 `distanceSquared`가 `Infinity`가 되어도 `bx(t)`/`by(t)`는
 * finite 좌표를 그대로 기록한다 (out에는 finite 점이 들어간다).
 *
 * @param out 결과 point를 기록할 writable output
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param point 투영 기준 점
 * @param options 수치 최적화 옵션
 */
export function quadraticClosestPointInto<Out extends XYWritable>(
  out: Out,
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  point: XYInput,
  options?: ClosestPointOptions
): Out {
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
  return writeXY(out, core.x, core.y);
}
