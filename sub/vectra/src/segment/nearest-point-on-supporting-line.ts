import type { SegmentLike, XYInput, XYObjectWritable } from '../types';
import { nearestPointOnSupportingLineInto } from './nearest-point-on-supporting-line-into';

/**
 * `point`를 segment의 supporting infinite line에 투영한 점을 새 object로 반환한다.
 *
 * - endpoint clamp 없이 unclamped projection을 반환한다.
 *   `point`가 endpoint 바깥에 있어도 supporting infinite line 위 점을 반환한다.
 *   endpoint-clamped 최근점이 필요하면 `closestPoint`를 사용한다.
 * - zero-length segment는 `point`에 무관하게 시작점을 반환한다.
 * - non-finite 입력은 별도 validation 없이 JavaScript number 연산 결과를 따른다.
 *
 * @param line 기준 segment
 * @param point supporting line에 투영할 point
 */
export function nearestPointOnSupportingLine(line: SegmentLike, point: XYInput): XYObjectWritable {
  return nearestPointOnSupportingLineInto({ x: 0, y: 0 }, line, point);
}
