import type { TriangleLike, XYInput, XYObjectWritable } from '../types';
import { closestPointOnEdgeInto } from './closest-point-on-edge-into';

/**
 * closestPointOnEdgeInto의 allocating companion. triangle 세 edge 위의 closest point를 새
 * XYObjectWritable로 반환한다.
 *
 * `closestPoint`와 달리 내부/boundary 여부를 보지 않는다. 내부 point도 input 좌표를 그대로
 * 두지 않고 세 edge segment AB, BC, CA의 clamped closest point 중 거리 제곱이 가장 작은 점으로
 * 강제 투영한다. edge 위 boundary point는 같은 좌표를 반환한다. 동거리 tie-break는 strict `<`로
 * AB → BC → CA 순서를 유지한다.
 *
 * degenerate triangle(collinear, 세 vertex가 같은 점 포함)도 세 segment AB, BC, CA의 최단점으로
 * 환원한다. 세 vertex가 모두 같으면 그 vertex를 반환한다.
 *
 * non-finite 좌표는 검증 없이 JS 산술 결과를 그대로 반환한다. 모든 후보 거리 비교가 NaN이면
 * 첫 후보 AB 계산 결과를 반환한다. 항상 실패하지 않는다.
 *
 * @param triangle 대상 triangle
 * @param point closest edge point를 측정할 기준 point
 */
export function closestPointOnEdge(triangle: TriangleLike, point: XYInput): XYObjectWritable {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  return closestPointOnEdgeInto(seed, triangle, point);
}
