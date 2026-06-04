import { polylineSampleAtLengthInto, polylineTotalLength, readPolylinePoints } from '../internal/polyline';
import { readX, readY, writeXY } from '../internal/xy';
import type { PolylineLike, XYWritable } from '../types';

/**
 * polyline의 normalized arclength 위치 ratio에 해당하는 point를 out에 기록한다.
 *
 * ratio는 [0, 1]로 clamp된다. empty polyline에서는 false를 반환하고 out을 수정하지 않는다.
 * single-point polyline 또는 total length가 0인 repeated-point polyline은 첫 point를 기록한다.
 * out이 polyline point와 alias되어도 안전하다.
 *
 * @param out point를 기록할 writable output
 * @param polyline sampling할 polyline
 * @param ratio 전체 길이에 대한 normalized 위치 (distance / totalLength)
 */
export function pointAtLengthRatioInto(out: XYWritable, polyline: PolylineLike, ratio: number): boolean {
  const points = readPolylinePoints(polyline);
  if (points.length === 0) return false;

  if (points.length === 1) {
    writeXY(out, readX(points[0]), readY(points[0]));
    return true;
  }

  const totalLen = polylineTotalLength(points);

  // repeated-point polyline은 sampling 기준 segment가 없으므로 첫 point로 환원한다.
  if (totalLen === 0) {
    writeXY(out, readX(points[0]), readY(points[0]));
    return true;
  }

  const target = Math.max(0, Math.min(1, ratio)) * totalLen;
  polylineSampleAtLengthInto(out, points, target);
  return true;
}
