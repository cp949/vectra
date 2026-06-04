import type { TriangleLike, XYInput, XYObjectWritable } from '../types';
import { closestPointInto } from './closest-point-into';

/**
 * closestPointInto의 allocating companion. triangle 위의 closest point를 새 XYObjectWritable로 반환한다.
 *
 * non-degenerate triangle 내부 또는 boundary point는 input point 좌표를 그대로 반환한다.
 * 외부 point는 세 edge segment AB, BC, CA의 clamped closest point 중 거리 제곱이 가장 작은
 * 점을 반환한다. 동거리 tie-break는 strict `<`로 AB → BC → CA 순서를 유지한다.
 *
 * degenerate triangle은 세 segment AB, BC, CA의 최단점으로 환원한다. 세 vertex가 모두 같으면
 * 그 vertex를 반환한다.
 *
 * non-finite 좌표는 검증 없이 JS 산술 결과를 그대로 반환한다. 모든 후보 거리 비교가 NaN이면
 * 첫 후보 AB 계산 결과를 반환한다. 항상 실패하지 않는다.
 *
 *
 * tolerance/iteration option 정책은 `closestPointInto`와 동일하다.
 * @param triangle 대상 triangle
 * @param point closest point를 측정할 기준 point
 */
export function closestPoint(triangle: TriangleLike, point: XYInput): XYObjectWritable {
  const seed: XYObjectWritable = { x: 0, y: 0 };
  return closestPointInto(seed, triangle, point);
}
