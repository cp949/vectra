import type { PolygonLike } from '../types';
import { boundingCircleInto } from './bounding-circle-into';

/**
 * polygon을 감싸는 approximate enclosing circle을 반환한다.
 *
 * Ritter algorithm 기반 근사 최소 외접원.
 * empty polygon(pointCount === 0): `{ center: { x: 0, y: 0 }, radius: 0 }`.
 *
 * @param polygon 외접원을 계산할 polygon
 */
export function boundingCircle(polygon: PolygonLike): { center: { x: number; y: number }; radius: number } {
  return boundingCircleInto({ center: { x: 0, y: 0 }, radius: 0 }, polygon);
}
