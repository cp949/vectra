import { readPolylinePoints } from '../internal/polyline';
import type { PolylineLike } from '../types';

/**
 * polyline이 하나 이상의 segment를 갖는지 반환한다.
 *
 * empty polyline과 single-point polyline은 false를 반환한다.
 * relation wrapper에서 segment 처리 가능 여부를 판별할 때 사용한다.
 *
 * @param polyline 확인할 polyline
 */
export function hasSegments(polyline: PolylineLike): boolean {
  return readPolylinePoints(polyline).length >= 2;
}
