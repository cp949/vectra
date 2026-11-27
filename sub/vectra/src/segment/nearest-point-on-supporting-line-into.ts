import type { Segment, Point, PointWritable } from '../types/flat-shapes.internal';

/**
 * `point`를 segment의 supporting infinite line에 투영한 점을 out에 기록하고 out을 반환한다.
 *
 * - endpoint clamp 없이 unclamped projection을 기록한다.
 *   `point`가 endpoint 바깥에 있어도 supporting infinite line 위 점을 기록한다.
 *   endpoint-clamped 최근점이 필요하면 `closestPointInto`를 사용한다.
 * - zero-length segment는 `point`에 무관하게 시작점을 기록한다.
 * - non-finite 입력은 별도 validation 없이 JavaScript number 연산 결과를 따른다.
 * - self-aliasing 안전: write 전 입력 좌표를 local 변수에 읽는다. `out`과 `point`가 같은
 *   object여도 안전하다.
 *
 * @param out 결과를 기록할 점 객체
 * @param line 기준 segment
 * @param point supporting line에 투영할 point
 * @see projectPointInto
 */
export function nearestPointOnSupportingLineInto<Out extends PointWritable>(
  out: Out,
  line: Segment,
  point: Point
): Out {
  const ax = line.x1;
  const ay = line.y1;
  const dx = line.x2 - ax;
  const dy = line.y2 - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    out.x = ax;
    out.y = ay;
    return out;
  }
  const px = point.x - ax;
  const py = point.y - ay;
  const t = (px * dx + py * dy) / lenSq;
  out.x = ax + t * dx;
  out.y = ay + t * dy;
  return out;
}
