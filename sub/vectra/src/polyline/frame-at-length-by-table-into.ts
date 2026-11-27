import {
  assertCumulativeLengthsMatch,
  polylineSampleAtLengthByTableInto,
  polylineSegmentTangentAtLengthByTableInto,
} from '../internal/polyline';
import type { PolylineFrameWritable } from '../types';
import type { Polyline, PointWritable } from '../types/flat-shapes.internal';

/**
 * 미리 만든 누적 길이 표로 polyline의 arclength offset 위치의 point, tangent, left normal을 out frame에 함께 기록한다.
 *
 * `frameAtLengthInto`와 같은 frame과 반환값을 낸다. 호출마다 polyline을 순회하지 않고 표를 이분 탐색하므로
 * 한 polyline을 여러 번 조회할 때 쓴다. 호출당 비용은 vertex 개수에 대해 O(log n)이다.
 *
 * `cumulativeLengths`는 같은 polyline의 `cumulativeLengthsInto` 결과여야 한다.
 * 표 개수가 `points.length`와 다르면 out을 수정하기 전에 RangeError를 던진다. empty polyline도 표가 빈 배열이어야 한다.
 * 표 내용은 검증하지 않는다. 비감소 순서가 아니거나 NaN이 있으면 결과는 정의되지 않는다. 이때도 throw하지 않는다.
 * polyline을 바꾸면 표를 다시 만드는 것은 호출자 책임이다.
 *
 * point는 `pointAtLengthByTableInto`와 같은 clamped arc-length sample이다. tangent는 target 위치를 포함하는
 * non-zero segment의 단위 진행 방향, normal은 그 tangent `(tx, ty)`의 left normal `(-ty, tx)`다.
 * `length`는 `[0, totalLength]`로 clamp된다. target이 segment boundary에 정확히 걸리면 point는
 * boundary point, tangent/normal은 앞쪽(먼저 끝나는) non-zero segment 기준이다. `length` 또는
 * total length 계산이 NaN이면 point/tangent/normal 모든 component에 NaN을 기록하고 true를 반환한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 frame을 만들 수
 * 없으므로 false를 반환하고 out frame의 point/tangent/normal을 모두 수정하지 않는다.
 *
 * 부호 반전 산술 `-ty`는 `ty`가 `0`일 때 JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다.
 * out frame의 field가 polyline point와 alias되어도 안전하다. 필요한 source 좌표를 local로 먼저
 * 계산한 뒤 out에 기록한다. 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param out point/tangent/normal을 기록할 writable frame output (`point`, `tangent`, `normal`의 각 `x`, `y`)
 * @param polyline frame을 계산할 polyline
 * @param cumulativeLengths polyline의 누적 길이 표. 개수는 vertex 개수와 같아야 한다.
 * @param length polyline 시작점부터의 arclength offset
 */
export function frameAtLengthByTableInto(
  out: PolylineFrameWritable<PointWritable>,
  polyline: Polyline,
  cumulativeLengths: readonly number[],
  length: number
): boolean {
  const points = polyline;
  assertCumulativeLengthsMatch(points, cumulativeLengths, 'frameAtLengthByTableInto');
  const n = points.length;
  if (n < 2) return false;

  const totalLen = cumulativeLengths[n - 1];
  if (totalLen === 0) return false;

  // tangent를 local로 먼저 계산한다. n >= 2 && totalLen !== 0이므로 항상 true다.
  const tangent = { x: 0, y: 0 };
  polylineSegmentTangentAtLengthByTableInto(tangent, points, cumulativeLengths, length);

  // point도 local로 먼저 계산한다. NaN target은 NaN point로 환원한다.
  const target = Math.max(0, Math.min(length, totalLen));
  const point = { x: Number.NaN, y: Number.NaN };
  if (!Number.isNaN(target)) {
    polylineSampleAtLengthByTableInto(point, points, cumulativeLengths, target);
  }

  out.point.x = point.x;
  out.point.y = point.y;
  out.tangent.x = tangent.x;
  out.tangent.y = tangent.y;
  out.normal.x = -tangent.y;
  out.normal.y = tangent.x;
  return true;
}
