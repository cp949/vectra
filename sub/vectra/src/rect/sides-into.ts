import type { Rect, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * rect의 4개 변(edge)을 `SegmentWritable` 배열에 push한다.
 *
 * `out.length = 0` 후 top, right, bottom, left 순서로 새 `SegmentWritable` object를 push한다.
 * 반환 후 배열 길이는 항상 4이다.
 *
 * 변 정의 (corner 약칭: TL=topLeft, TR=topRight, BR=bottomRight, BL=bottomLeft):
 * - top:    `(x1, y1) = TL`, `(x2, y2) = TR`
 * - right:  `(x1, y1) = TR`, `(x2, y2) = BR`
 * - bottom: `(x1, y1) = BR`, `(x2, y2) = BL`
 * - left:   `(x1, y1) = BL`, `(x2, y2) = TL`
 *
 * 각 변은 두 끝점의 좌표를 담은 독립 선분 객체다.
 * empty rect에서도 raw 좌표로 4개 변을 push한다. zero-length side는 그대로 push한다.
 *
 * @param out 변을 기록할 선분 배열
 * @param rect 변을 읽을 rect
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function sidesInto(out: SegmentWritable[], rect: Rect): SegmentWritable[] {
  // aliasing 안전 - 모든 입력 좌표를 먼저 읽은 후 기록한다
  const x = rect.x;
  const y = rect.y;
  const r = x + rect.width;
  const b = y + rect.height;

  // 매 호출마다 배열을 비우고 새 선분 객체를 추가한다
  out.length = 0;
  out.push(
    { x1: x, y1: y, x2: r, y2: y }, // top
    { x1: r, y1: y, x2: r, y2: b }, // right
    { x1: r, y1: b, x2: x, y2: b }, // bottom
    { x1: x, y1: b, x2: x, y2: y } // left
  );
  return out;
}
