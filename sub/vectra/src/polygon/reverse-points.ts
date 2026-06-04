import type { PolygonLike, XYObjectWritable } from '../types';
import { reversePointsInto } from './reverse-points-into';

/**
 * polygon point 순서를 뒤집은 새 point 배열을 반환한다.
 *
 * 대응 `reversePointsInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 */
export function reversePoints(polygon: PolygonLike): XYObjectWritable[] {
  return reversePointsInto([], polygon);
}
