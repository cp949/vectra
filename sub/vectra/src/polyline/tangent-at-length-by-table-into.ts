import {
  assertCumulativeLengthsMatch,
  polylineSegmentTangentAtLengthByTableInto,
  readPolylinePoints,
} from '../internal/polyline';
import type { PolylineLike, XYWritable } from '../types';

/**
 * 미리 만든 누적 길이 표로 polyline의 arclength offset 위치가 속한 segment의 단위 tangent를 out에 기록한다.
 *
 * `tangentAtLengthInto`와 같은 tangent와 반환값을 낸다. 호출마다 polyline을 순회하지 않고 표를 이분 탐색하므로
 * 한 polyline을 여러 번 조회할 때 쓴다. 호출당 비용은 vertex 개수에 대해 O(log n)이다.
 *
 * `cumulativeLengths`는 같은 polyline의 `cumulativeLengthsInto` 결과여야 한다.
 * 표 개수가 `points.length`와 다르면 out을 수정하기 전에 RangeError를 던진다. empty polyline도 표가 빈 배열이어야 한다.
 * 표 내용은 검증하지 않는다. 비감소 순서가 아니거나 NaN이 있으면 결과는 정의되지 않는다. 이때도 throw하지 않는다.
 * polyline을 바꾸면 표를 다시 만드는 것은 호출자 책임이다.
 *
 * tangent는 해당 위치를 포함하는 non-zero segment의 진행 방향 단위 벡터다.
 * `length`는 `[0, totalLength]`로 clamp된다. target이 segment boundary에 정확히 걸리면
 * 앞쪽(먼저 끝나는) non-zero segment 방향을 사용한다. `length`가 0 이하이면 첫 non-zero
 * segment, `totalLength` 이상이면 마지막 non-zero segment 방향이다. zero-length segment는
 * tangent 후보에서 제외한다. `length` 또는 total length 계산이 NaN이면 NaN tangent를 기록한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 tangent를 만들
 * 수 없으므로 false를 반환하고 out을 수정하지 않는다.
 *
 * out이 polyline point와 alias되어도 안전하다. 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param out tangent를 기록할 writable output
 * @param polyline tangent를 계산할 polyline
 * @param cumulativeLengths polyline의 누적 길이 표. 개수는 vertex 개수와 같아야 한다.
 * @param length polyline 시작점부터의 arclength offset
 */
export function tangentAtLengthByTableInto(
  out: XYWritable,
  polyline: PolylineLike,
  cumulativeLengths: readonly number[],
  length: number
): boolean {
  const points = readPolylinePoints(polyline);
  assertCumulativeLengthsMatch(points, cumulativeLengths, 'tangentAtLengthByTableInto');
  return polylineSegmentTangentAtLengthByTableInto(out, points, cumulativeLengths, length);
}
