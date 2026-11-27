import type { PointWritable, Rect } from '../types/flat-shapes.internal';

/**
 * rect의 4개 corner point를 `out` 배열에 push한다.
 *
 * `out.length = 0` 후 `topLeft`, `topRight`, `bottomRight`, `bottomLeft` 순서로 새
 * writable object를 push한다. 반환 후 배열 길이는 항상 4이다.
 *
 * corner 좌표:
 * - `topLeft`:     `(rect.x, rect.y)`
 * - `topRight`:    `(rect.x + rect.width, rect.y)`
 * - `bottomRight`: `(rect.x + rect.width, rect.y + rect.height)`
 * - `bottomLeft`:  `(rect.x, rect.y + rect.height)`
 *
 * empty rect(`width <= 0 || height <= 0`)에서도 raw 좌표로 4개 point를 push한다.
 * zero-length 또는 negative dimension에서 corner가 겹치거나 역전되는 경우도 그대로 push한다.
 *
 * @param out 꼭짓점을 기록할 점 배열
 * @param rect corner를 읽을 rect
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function cornersInto(out: PointWritable[], rect: Rect): PointWritable[] {
  // aliasing 안전 - 모든 입력 좌표를 먼저 읽은 후 기록한다
  const x = rect.x;
  const y = rect.y;
  const r = x + rect.width;
  const b = y + rect.height;

  // 매 호출마다 배열을 비우고 새 object를 push한다
  out.length = 0;
  out.push(
    { x, y }, // topLeft
    { x: r, y }, // topRight
    { x: r, y: b }, // bottomRight
    { x, y: b } // bottomLeft
  );
  return out;
}
