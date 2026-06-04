import { polylineSegmentTangentAtLengthInto, readPolylinePoints } from '../internal/polyline';
import { writeXY } from '../internal/xy';
import type { PolylineLike, XYWritable } from '../types';

/**
 * polyline의 arclength offset 위치가 속한 segment의 단위 left normal을 out에 기록한다.
 *
 * normal은 해당 위치를 포함하는 non-zero segment 단위 tangent `(tx, ty)`의 left normal
 * `(-ty, tx)`다. segment 선택은 `tangentAtLengthInto`와 같다. `length`는 `[0, totalLength]`로
 * clamp된다. target이 segment boundary에 정확히 걸리면 앞쪽(먼저 끝나는) non-zero segment
 * 기준이다. `length`가 0 이하이면 첫 non-zero segment, `totalLength` 이상이면 마지막 non-zero
 * segment 기준이다. zero-length segment는 후보에서 제외한다. `length` 또는 total length 계산이
 * NaN이면 NaN normal을 기록하고 true를 반환한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 normal을 만들 수
 * 없으므로 false를 반환하고 out을 수정하지 않는다.
 *
 * 부호 반전 산술 `-ty`는 `ty`가 `0`일 때 JS signed-zero 규칙에 따라 `-0`을 그대로 기록한다.
 * out이 polyline point와 alias되어도 안전하다. tangent를 local로 먼저 계산한 뒤 out에 기록한다.
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param out left normal을 기록할 writable output
 * @param polyline normal을 계산할 polyline
 * @param length polyline 시작점부터의 arclength offset
 */
export function normalAtLengthInto(out: XYWritable, polyline: PolylineLike, length: number): boolean {
  const tangent = { x: 0, y: 0 };
  if (!polylineSegmentTangentAtLengthInto(tangent, readPolylinePoints(polyline), length)) return false;

  writeXY(out, -tangent.y, tangent.x);
  return true;
}
