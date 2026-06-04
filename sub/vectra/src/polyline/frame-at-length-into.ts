import {
  polylineSampleAtLengthInto,
  polylineSegmentTangentAtLengthInto,
  polylineTotalLength,
  readPolylinePoints,
} from '../internal/polyline';
import { writeXY } from '../internal/xy';
import type { PolylineFrameWritable, PolylineLike, XYWritable } from '../types';

/**
 * polyline의 arclength offset 위치의 point, tangent, left normal을 out frame에 함께 기록한다.
 *
 * point는 `pointAtLengthInto`와 같은 clamped arc-length sample이다. tangent와 normal은
 * `tangentAtLengthInto` / `normalAtLengthInto`와 같은 segment 선택 정책을 사용한다. tangent는
 * target 위치를 포함하는 non-zero segment의 단위 진행 방향, normal은 그 tangent `(tx, ty)`의 left
 * normal `(-ty, tx)`다. `length`는 `[0, totalLength]`로 clamp된다. target이 segment boundary에
 * 정확히 걸리면 point는 boundary point, tangent/normal은 앞쪽(먼저 끝나는) non-zero segment
 * 기준이다. `length` 또는 total length 계산이 NaN이면 point/tangent/normal 모든 component에 NaN을
 * 기록하고 true를 반환한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 frame을 만들 수
 * 없으므로 false를 반환하고 out frame의 point/tangent/normal을 모두 수정하지 않는다.
 *
 * 부호 반전 산술 `-ty`는 `ty`가 `0`일 때 JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다.
 * out frame의 field가 polyline point와 alias되어도 안전하다. 필요한 source 좌표를 local로 먼저
 * 계산한 뒤 out에 기록한다. 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param out point/tangent/normal을 기록할 writable frame output
 * @param polyline frame을 계산할 polyline
 * @param length polyline 시작점부터의 arclength offset
 */
export function frameAtLengthInto(
  out: PolylineFrameWritable<XYWritable>,
  polyline: PolylineLike,
  length: number
): boolean {
  const points = readPolylinePoints(polyline);
  const n = points.length;
  if (n < 2) return false;

  const totalLen = polylineTotalLength(points);
  if (totalLen === 0) return false;

  // tangent를 local로 먼저 계산한다. n >= 2 && totalLen !== 0이므로 항상 true다.
  const tangent = { x: 0, y: 0 };
  polylineSegmentTangentAtLengthInto(tangent, points, length);

  // point도 local로 먼저 계산한다. NaN target은 NaN point로 환원한다.
  const target = Math.max(0, Math.min(length, totalLen));
  const point = { x: Number.NaN, y: Number.NaN };
  if (!Number.isNaN(target)) {
    polylineSampleAtLengthInto(point, points, target);
  }

  writeXY(out.point, point.x, point.y);
  writeXY(out.tangent, tangent.x, tangent.y);
  writeXY(out.normal, -tangent.y, tangent.x);
  return true;
}
