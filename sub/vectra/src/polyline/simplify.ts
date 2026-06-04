import type { PolylineLike, XYObjectWritable } from '../types';
import { simplifyInto } from './simplify-into';

/**
 * Ramer-Douglas-Peucker 알고리즘으로 polyline을 단순화한 새 point 배열을 반환한다.
 *
 * open polyline semantics 전용. closed polygon simplification은 다루지 않는다.
 *
 * `tolerance`는 절대 거리 단위 기본값 1.0이다. `tolerance < 0`이면 RangeError를 던진다.
 * `tolerance === 0`은 허용하며, 동일선상에 없는 모든 point를 유지한다.
 *
 * empty polyline이면 빈 배열을 반환한다. single-point polyline이면 그 점만 담은 배열을 반환한다.
 *
 * @param polyline 단순화할 polyline
 * @param tolerance 허용 최대 수직 거리 (기본값 1.0)
 */
export function simplify(polyline: PolylineLike, tolerance = 1.0): XYObjectWritable[] {
  return simplifyInto([], polyline, tolerance);
}
