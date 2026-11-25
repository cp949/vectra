import {
  assertCumulativeLengthsMatch,
  polylineSampleAtLengthByTableInto,
  readPolylinePoints,
} from '../internal/polyline';
import { readX, readY, writeXY } from '../internal/xy';
import type { PolylineLike, XYWritable } from '../types';

/**
 * 미리 만든 누적 길이 표로 polyline의 normalized arclength 위치 ratio에 해당하는 point를 out에 기록한다.
 *
 * `pointAtLengthRatioInto`와 같은 point를 기록한다. 호출마다 polyline을 순회하지 않고 표를 이분 탐색하므로
 * 한 polyline을 여러 번 조회할 때 쓴다. 호출당 비용은 vertex 개수에 대해 O(log n)이다.
 *
 * `cumulativeLengths`는 같은 polyline의 `cumulativeLengthsInto` 결과여야 한다.
 * 표 개수가 `points.length`와 다르면 out을 수정하기 전에 RangeError를 던진다. empty polyline도 표가 빈 배열이어야 한다.
 * 표 내용은 검증하지 않는다. 비감소 순서가 아니거나 NaN이 있으면 결과는 정의되지 않는다. 이때도 throw하지 않는다.
 * polyline을 바꾸면 표를 다시 만드는 것은 호출자 책임이다.
 *
 * ratio는 [0, 1]로 clamp된다. empty polyline에서는 false를 반환하고 out을 수정하지 않는다.
 * single-point polyline 또는 total length가 0인 repeated-point polyline은 첫 point를 기록한다.
 * out이 polyline point와 alias되어도 안전하다. 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param out point를 기록할 writable output
 * @param polyline sampling할 polyline
 * @param cumulativeLengths polyline의 누적 길이 표. 개수는 vertex 개수와 같아야 한다.
 * @param ratio 전체 길이에 대한 normalized 위치 (distance / totalLength)
 */
export function pointAtLengthRatioByTableInto(
  out: XYWritable,
  polyline: PolylineLike,
  cumulativeLengths: readonly number[],
  ratio: number
): boolean {
  const points = readPolylinePoints(polyline);
  assertCumulativeLengthsMatch(points, cumulativeLengths, 'pointAtLengthRatioByTableInto');
  if (points.length === 0) return false;

  if (points.length === 1) {
    writeXY(out, readX(points[0]), readY(points[0]));
    return true;
  }

  const totalLen = cumulativeLengths[points.length - 1];

  // repeated-point polyline은 sampling 기준 segment가 없으므로 첫 point로 환원한다.
  if (totalLen === 0) {
    writeXY(out, readX(points[0]), readY(points[0]));
    return true;
  }

  const target = Math.max(0, Math.min(1, ratio)) * totalLen;
  polylineSampleAtLengthByTableInto(out, points, cumulativeLengths, target);
  return true;
}
