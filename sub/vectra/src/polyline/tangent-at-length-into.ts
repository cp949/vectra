import { polylineSegmentTangentAtLengthInto, readPolylinePoints } from '../internal/polyline';
import type { PolylineLike, XYWritable } from '../types';

/**
 * polyline의 arclength offset 위치가 속한 segment의 단위 tangent를 out에 기록한다.
 *
 * tangent는 해당 위치를 포함하는 non-zero segment의 진행 방향 단위 벡터다.
 * vertex 평균 tangent인 `tangentAtIndexInto`와 달리 segment 방향을 그대로 사용한다.
 * `length`는 `[0, totalLength]`로 clamp된다. target이 segment boundary에 정확히 걸리면
 * 앞쪽(먼저 끝나는) non-zero segment 방향을 사용한다. `length`가 0 이하이면 첫 non-zero
 * segment, `totalLength` 이상이면 마지막 non-zero segment 방향이다. zero-length segment는
 * tangent 후보에서 제외한다. `length` 또는 total length 계산이 NaN이면 NaN tangent를 기록한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 tangent를 만들
 * 수 없으므로 false를 반환하고 out을 수정하지 않는다.
 *
 * out이 polyline point와 alias되어도 안전하다. segment 좌표를 local로 먼저 읽은 뒤 out에 기록한다.
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param out tangent를 기록할 writable output
 * @param polyline tangent를 계산할 polyline
 * @param length polyline 시작점부터의 arclength offset
 */
export function tangentAtLengthInto(out: XYWritable, polyline: PolylineLike, length: number): boolean {
  return polylineSegmentTangentAtLengthInto(out, readPolylinePoints(polyline), length);
}
