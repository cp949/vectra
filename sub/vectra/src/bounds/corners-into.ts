import type { Bounds, PointWritable } from '../types/flat-shapes.internal';

/**
 * bounds의 4개 corner point를 `out` 배열에 push한다.
 *
 * `out.length = 0` 후 `topLeft`, `topRight`, `bottomRight`, `bottomLeft` 순서로 새
 * writable object를 push한다. 반환 후 배열 길이는 항상 4이다.
 *
 * corner 좌표:
 * - `topLeft`:     `(minX, minY)`
 * - `topRight`:    `(maxX, minY)`
 * - `bottomRight`: `(maxX, maxY)`
 * - `bottomLeft`:  `(minX, maxY)`
 *
 * empty/inverted bounds(`maxX < minX || maxY < minY`)와
 * sentinel bounds(`{min:(Infinity,Infinity), max:(-Infinity,-Infinity)}`)에서도
 * raw 좌표로 4개 point를 push한다. caller가 미리 `isEmpty`로 거른다.
 *
 * @param out 꼭짓점을 기록할 점 배열
 * @param bounds corner를 읽을 bounds
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function cornersInto(out: PointWritable[], bounds: Bounds): PointWritable[] {
  // aliasing 안전 - 모든 입력 좌표를 먼저 읽은 후 기록한다
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  // 매 호출마다 배열을 비우고 새 object를 push한다
  out.length = 0;
  out.push(
    { x: minX, y: minY }, // topLeft
    { x: maxX, y: minY }, // topRight
    { x: maxX, y: maxY }, // bottomRight
    { x: minX, y: maxY } // bottomLeft
  );
  return out;
}
