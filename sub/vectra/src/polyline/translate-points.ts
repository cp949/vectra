import type { PolylineLike, XYInput, XYObjectWritable } from '../types';
import { translatePointsInto } from './translate-points-into';

/**
 * polyline의 모든 point에 offset을 더한 새 point 배열을 반환한다.
 *
 * 대응 `translatePointsInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param polyline point를 읽을 polyline
 * @param offset 각 point에 더할 offset
 */
export function translatePoints(polyline: PolylineLike, offset: XYInput): XYObjectWritable[] {
  return translatePointsInto([], polyline, offset);
}
