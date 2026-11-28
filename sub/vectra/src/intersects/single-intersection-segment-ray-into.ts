import { segmentRayPointInto } from '../internal/segment-ray-point.internal';
import type { Ray, Segment, PointWritable } from '../types/flat-shapes.internal';

/**
 * segment와 ray의 단일 교점을 out에 기록하고 true를 반환한다.
 *
 * 교점이 없거나 collinear/parallel이면 false를 반환하고 out을 수정하지 않는다.
 * zero-length segment는 점으로 환원한다. 그 점이 ray 위에 있으면 그 점을 기록하고 true, 아니면 false.
 *
 * @param out 교점 좌표를 기록할 { x, y } 객체. 실패 시 수정하지 않는다.
 * @param line 교점을 구할 segment
 * @param ray 교점을 구할 ray
 * @param epsilon cross product 절대값 및 거리 임계값
 *   생략하면 평행 판정이 `sin θ <= DEFAULT_EPSILON`(scale 불변)이다. 명시하면 `|cross| <= epsilon` 절대 비교다.
 */
export function singleIntersectionSegmentRayInto(
  out: PointWritable,
  line: Segment,
  ray: Ray,
  epsilon?: number
): boolean {
  return segmentRayPointInto(out, line.x1, line.y1, line.x2, line.y2, ray.ox, ray.oy, ray.dx, ray.dy, epsilon);
}
