import { readPolylinePoints } from '../internal/polyline';
import { readX, readY, writeXY } from '../internal/xy';
import type { PolylineLike, XYWritable } from '../types';

/**
 * polyline의 index번째 point를 out에 기록한다.
 *
 * invalid index 또는 empty polyline에서는 false를 반환하고 out을 수정하지 않는다.
 * out이 대상 point와 alias되어도 안전하다.
 *
 * @param out point를 기록할 writable output
 * @param polyline point를 읽을 polyline
 * @param index 읽을 point index
 */
export function pointAtIndexInto(out: XYWritable, polyline: PolylineLike, index: number): boolean {
  const points = readPolylinePoints(polyline);
  if (!Number.isInteger(index) || index < 0 || index >= points.length) {
    return false;
  }
  writeXY(out, readX(points[index]), readY(points[index]));
  return true;
}
