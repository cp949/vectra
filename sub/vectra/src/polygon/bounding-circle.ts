import { createZeroCircle } from '../internal/circle';
import type { Polygon, CircleWritable } from '../types/flat-shapes.internal';
import { boundingCircleInto } from './bounding-circle-into';

/**
 * polygon을 감싸는 approximate enclosing circle을 반환한다.
 *
 * Ritter algorithm 기반 근사 최소 외접원.
 * empty polygon(pointCount === 0): `{ cx: 0, cy: 0, r: 0 }`.
 *
 * @param polygon 외접원을 계산할 polygon
 */
export function boundingCircle(polygon: Polygon): CircleWritable {
  return boundingCircleInto(createZeroCircle(), polygon);
}
