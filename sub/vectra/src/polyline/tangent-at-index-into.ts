import { polylineVertexTangentInto, readPolylinePoints } from '../internal/polyline';
import type { PolylineLike, XYWritable } from '../types';

/**
 * polyline의 index번째 vertex에서 tangent를 계산해 out에 기록하고 true를 반환한다.
 *
 * tangent는 인접 edge 방향의 정규화된 평균이다. 끝점은 단일 edge 방향을 사용한다.
 * zero-length adjacent edge는 무시하고 유효한 edge 방향만 평균한다. 유효한 인접 edge가
 * 없으면 out을 수정하지 않고 false를 반환한다.
 *
 * index가 범위 밖이거나 비정수이면 false를 반환하고 out을 수정하지 않는다.
 * empty / single-point polyline은 항상 false를 반환한다.
 *
 * @param out tangent를 기록할 writable output
 * @param polyline tangent를 계산할 polyline
 * @param index vertex index (0-based integer)
 */
export function tangentAtIndexInto<Out extends XYWritable>(out: Out, polyline: PolylineLike, index: number): boolean {
  if (!Number.isInteger(index)) return false;

  const pts = readPolylinePoints(polyline);
  const n = pts.length;

  if (index < 0 || index >= n) return false;

  return polylineVertexTangentInto(out, pts, index);
}
