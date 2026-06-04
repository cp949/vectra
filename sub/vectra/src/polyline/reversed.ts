import type { PolylineLike, XYObjectWritable } from '../types';
import { reversedInto } from './reversed-into';

/**
 * polyline의 point 순서를 뒤집은 새 point 배열을 반환한다.
 *
 * `reversePoints`의 ergonomic alias이며 semantic이 동일하다.
 * 대응 `reversedInto`는 input point array와 outPoints가 같은 배열이어도 안전하다.
 * finite 검증은 하지 않는다. NaN/Infinity 좌표는 그대로 전파한다.
 *
 * @param polyline point를 읽을 polyline
 */
export function reversed(polyline: PolylineLike): XYObjectWritable[] {
  return reversedInto([], polyline);
}
