import type { PolygonLike, XYInput, XYObjectWritable } from '../types';
import { translatePointsInto } from './translate-points-into';

/**
 * polygon의 모든 point에 offset을 더한 새 point 배열을 반환한다.
 *
 * 대응 `translatePointsInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 *
 * @param polygon point를 읽을 polygon
 * @param offset 각 point에 더할 offset
 */
export function translatePoints(polygon: PolygonLike, offset: XYInput): XYObjectWritable[] {
  return translatePointsInto([], polygon, offset);
}
