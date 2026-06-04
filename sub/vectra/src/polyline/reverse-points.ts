import type { PolylineLike, XYObjectWritable } from '../types';
import { reversePointsInto } from './reverse-points-into';

/**
 * polyline의 point 순서를 뒤집은 새 point 배열을 반환한다.
 *
 * 대응 `reversePointsInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 * finite 검증은 하지 않는다. NaN/Infinity 좌표는 그대로 전파한다.
 *
 * @param polyline point를 읽을 polyline
 */
export function reversePoints(polyline: PolylineLike): XYObjectWritable[] {
  return reversePointsInto([], polyline);
}
