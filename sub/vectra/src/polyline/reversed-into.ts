import { writeReversedPolylinePointsInto } from '../internal/polyline-collection';
import type { PolylineLike, XYObjectWritable } from '../types';

/**
 * polyline의 point 순서를 뒤집어 outPoints에 새 point object로 기록한다.
 *
 * `reversePointsInto`의 ergonomic alias이며 semantic이 동일하다. 두 함수는 같은
 * internal writer를 공유한다.
 *
 * outPoints는 먼저 clear된 뒤 결과 point가 push되며, 같은 outPoints를 반환한다.
 * polyline point array와 outPoints가 같은 배열이어도 안전하다.
 * finite 검증은 하지 않는다. NaN/Infinity 좌표는 그대로 전파한다.
 *
 * @param outPoints 뒤집힌 point object를 기록할 writable output array
 * @param polyline point를 읽을 polyline
 */
export function reversedInto(outPoints: XYObjectWritable[], polyline: PolylineLike): XYObjectWritable[] {
  return writeReversedPolylinePointsInto(outPoints, polyline);
}
