import type { PolylineLike, XYObjectWritable } from '../types';
import { tangentsInto } from './tangents-into';

/**
 * polyline의 모든 vertex tangent를 계산한 새 point 배열을 반환한다.
 *
 * 입력 vertex 수만큼 결과를 반환한다. tangent를 계산할 수 없는 vertex는
 * `{ x: 0, y: 0 }`을 push해 index alignment을 유지한다.
 *
 * @param polyline tangent를 계산할 polyline
 */
export function tangents(polyline: PolylineLike): XYObjectWritable[] {
  return tangentsInto([], polyline);
}
