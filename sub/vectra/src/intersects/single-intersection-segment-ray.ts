import type { Ray, Segment, PointWritable } from '../types/flat-shapes.internal';
import { singleIntersectionSegmentRayInto } from './single-intersection-segment-ray-into';

/**
 * segment와 ray의 단일 교점을 새 object로 반환한다.
 *
 * 교점이 있으면 `{ x, y }` object를 반환하고, 없으면 undefined를 반환한다.
 * collinear/parallel이면 undefined를 반환한다.
 * zero-length segment는 점으로 환원한다. 그 점이 ray 위에 있으면 그 점을, 아니면 undefined를 반환한다.
 * `singleIntersectionSegmentRayInto`의 allocating companion이다.
 *
 * @param line 교점을 구할 segment
 * @param ray 교점을 구할 ray
 * @param epsilon cross product 절대값 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionSegmentRay(line: Segment, ray: Ray, epsilon?: number): PointWritable | undefined {
  const out: PointWritable = { x: 0, y: 0 };
  return singleIntersectionSegmentRayInto(out, line, ray, epsilon) ? out : undefined;
}
