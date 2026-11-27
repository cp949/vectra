import type { Polyline, PointWritable } from '../types/flat-shapes.internal';
import { pointAtLengthByTableInto } from './point-at-length-by-table-into';

/**
 * pointAtLengthByTableInto의 allocating companion. 새 plain {x, y} object를 반환한다.
 *
 * 미리 만든 누적 길이 표를 이분 탐색하며, `pointAtLength`와 같은 point를 반환한다.
 * `cumulativeLengths`는 같은 polyline의 `cumulativeLengths` 결과여야 한다.
 * 표 개수가 `points.length`와 다르면 RangeError를 던진다. empty polyline도 표가 빈 배열이어야 한다.
 * 표 내용은 검증하지 않는다. 비감소 순서가 아니거나 NaN이 있으면 결과는 정의되지 않는다. 이때도 throw하지 않는다.
 * polyline을 바꾸면 표를 다시 만드는 것은 호출자 책임이다.
 *
 * length는 [0, totalLength]로 clamp된다. empty polyline에서는 undefined를 반환한다.
 * single-point polyline 또는 total length가 0인 repeated-point polyline은 첫 point를 반환한다.
 * 기존 polyline domain과 맞춰 non-finite 좌표 validation은 수행하지 않는다.
 *
 * @param polyline sampling할 polyline
 * @param cumulativeLengths polyline의 누적 길이 표. 개수는 vertex 개수와 같아야 한다.
 * @param length polyline 시작점부터의 arclength offset
 */
export function pointAtLengthByTable(
  polyline: Polyline,
  cumulativeLengths: readonly number[],
  length: number
): PointWritable | undefined {
  const seed: PointWritable = { x: 0, y: 0 };
  if (!pointAtLengthByTableInto(seed, polyline, cumulativeLengths, length)) return undefined;
  return seed;
}
