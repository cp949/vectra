import type { CurveSpacedPointsOptions, XYInput, XYObjectWritable } from '../types';
import { quadraticSpacedPointsInto } from './quadratic-spaced-points-into';

/**
 * quadratic Bezier curve를 arc-length 기준으로 균등 분포한 새 XYObjectWritable[] 배열을 반환한다.
 *
 * sampling 위치: distance = totalLength * i / (count - 1), i = 0..count-1 (양 끝점 포함).
 * 양 끝점은 t=0 / t=1로 고정해 정확한 start/end point가 된다.
 * uniform t sampling(quadraticSample)과 달리 arc-length 간격을 사용한다.
 * zero-length curve는 start point를 count개 반환한다.
 * 좌표는 검증 없이 사용하므로 NaN/Infinity는 결과 좌표로 pass-through된다.
 * count validation 실패 시 RangeError를 던진다.
 * 성능 최적화가 필요하면 `quadraticSpacedPointsInto`를 사용한다.
 *
 * @param p0 curve 시작점
 * @param p1 curve 제어점
 * @param p2 curve 끝점
 * @param count output point 수. 2 이상 0xffffffff 이하의 safe integer. 범위 밖이면 RangeError.
 * @param options TAtLength 탐색 옵션(segments / tolerance / maxIterations).
 * @returns 새로 만든 XYObjectWritable point 배열
 */
export function quadraticSpacedPoints(
  p0: XYInput,
  p1: XYInput,
  p2: XYInput,
  count: number,
  options?: CurveSpacedPointsOptions
): XYObjectWritable[] {
  return quadraticSpacedPointsInto([], p0, p1, p2, count, options);
}
