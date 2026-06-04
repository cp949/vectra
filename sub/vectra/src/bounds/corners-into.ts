import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike } from '../types';

/**
 * bounds의 4개 corner point를 `out` 배열에 push한다.
 *
 * `out.length = 0` 후 `topLeft`, `topRight`, `bottomRight`, `bottomLeft` 순서로 새
 * writable object를 push한다. 반환 후 배열 길이는 항상 4이다.
 *
 * corner 좌표:
 * - `topLeft`:     `(min.x, min.y)`
 * - `topRight`:    `(max.x, min.y)`
 * - `bottomRight`: `(max.x, max.y)`
 * - `bottomLeft`:  `(min.x, max.y)`
 *
 * empty/inverted bounds(`max.x < min.x || max.y < min.y`)와
 * sentinel bounds(`{min:(Infinity,Infinity), max:(-Infinity,-Infinity)}`)에서도
 * raw 좌표로 4개 point를 push한다. caller가 미리 `isEmpty`로 거른다.
 *
 * @param out corner point를 push할 writable array
 * @param bounds corner를 읽을 bounds
 */
export function cornersInto(out: { x: number; y: number }[], bounds: BoundsLike): void {
  // aliasing 안전 - 모든 입력 좌표를 먼저 읽은 후 기록한다
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);

  // 매 호출마다 배열을 비우고 새 object를 push한다
  out.length = 0;
  out.push(
    { x: minX, y: minY }, // topLeft
    { x: maxX, y: minY }, // topRight
    { x: maxX, y: maxY }, // bottomRight
    { x: minX, y: maxY } // bottomLeft
  );
}
