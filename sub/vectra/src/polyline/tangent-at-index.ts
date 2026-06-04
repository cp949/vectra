import type { PolylineLike } from '../types';
import { tangentAtIndexInto } from './tangent-at-index-into';

/**
 * polyline의 index번째 vertex에서 tangent를 계산해 새 object로 반환한다.
 *
 * tangent는 인접 edge 방향의 정규화된 평균이다. 끝점은 단일 edge 방향을 사용한다.
 * zero-length adjacent edge는 무시하고 유효한 edge 방향만 평균한다.
 *
 * index가 범위 밖이거나 비정수이면 undefined를 반환한다.
 * empty / single-point polyline 또는 유효한 인접 edge가 없으면 undefined를 반환한다.
 *
 * @param polyline tangent를 계산할 polyline
 * @param index vertex index (0-based integer)
 */
export function tangentAtIndex(polyline: PolylineLike, index: number): { x: number; y: number } | undefined {
  const out = { x: 0, y: 0 };
  return tangentAtIndexInto(out, polyline, index) ? out : undefined;
}
