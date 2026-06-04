import type { CircleLike, XYInput, XYObjectWritable } from '../types';
import { tangentPointsFromExternalInto } from './tangent-points-from-external-into';

/**
 * 외부 점에서 원까지의 접선점을 새 배열로 반환한다.
 *
 * externalPoint가 원 내부이면 빈 배열을 반환한다.
 * externalPoint가 원 경계 위이면 접선점 1개(externalPoint 자체와 동일)를 담은 배열을 반환한다.
 * externalPoint가 원 외부이면 접선점 2개를 담은 배열을 반환한다.
 * empty circle(radius <= 0)이면 빈 배열을 반환한다.
 *
 * @param circle 대상 원
 * @param externalPoint 외부 점
 */
export function tangentPointsFromExternal(circle: CircleLike, externalPoint: XYInput): XYObjectWritable[] {
  return tangentPointsFromExternalInto([], circle, externalPoint);
}
