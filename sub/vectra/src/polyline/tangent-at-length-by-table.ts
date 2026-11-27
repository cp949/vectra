import type { Polyline, PointWritable } from '../types/flat-shapes.internal';
import { tangentAtLengthByTableInto } from './tangent-at-length-by-table-into';

/**
 * tangentAtLengthByTableInto의 allocating companion. 단위 tangent를 새 plain {x, y} object로 반환한다.
 *
 * 미리 만든 누적 길이 표를 이분 탐색하며, `tangentAtLength`와 같은 tangent를 반환한다.
 * `cumulativeLengths`는 같은 polyline의 `cumulativeLengths` 결과여야 한다.
 * 표 개수가 `points.length`와 다르면 RangeError를 던진다. empty polyline도 표가 빈 배열이어야 한다.
 * 표 내용은 검증하지 않는다. 비감소 순서가 아니거나 NaN이 있으면 결과는 정의되지 않는다. 이때도 throw하지 않는다.
 * polyline을 바꾸면 표를 다시 만드는 것은 호출자 책임이다.
 *
 * tangent는 arclength offset 위치를 포함하는 non-zero segment의 진행 방향 단위 벡터다.
 * `length`는 `[0, totalLength]`로 clamp된다. target이 segment boundary에 정확히 걸리면
 * 앞쪽(먼저 끝나는) non-zero segment 방향을 사용하고, `length`가 0 이하이면 첫 non-zero
 * segment, `totalLength` 이상이면 마지막 non-zero segment 방향이다. zero-length segment는
 * tangent 후보에서 제외한다. `length` 또는 total length 계산이 NaN이면 NaN tangent를 반환한다.
 *
 * empty / single-point polyline, total length가 0인 repeated-point polyline은 tangent를 만들
 * 수 없으므로 undefined를 반환한다.
 *
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param polyline tangent를 계산할 polyline
 * @param cumulativeLengths polyline의 누적 길이 표. 개수는 vertex 개수와 같아야 한다.
 * @param length polyline 시작점부터의 arclength offset
 */
export function tangentAtLengthByTable(
  polyline: Polyline,
  cumulativeLengths: readonly number[],
  length: number
): PointWritable | undefined {
  const out: PointWritable = { x: 0, y: 0 };
  return tangentAtLengthByTableInto(out, polyline, cumulativeLengths, length) ? out : undefined;
}
