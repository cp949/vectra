import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, SegmentWritable, XYObjectWritable } from '../types';

/**
 * rect의 4개 변(edge)을 `SegmentWritable` 배열에 push한다.
 *
 * `out.length = 0` 후 top, right, bottom, left 순서로 새 `SegmentWritable` object를 push한다.
 * 반환 후 배열 길이는 항상 4이다.
 *
 * 변 정의 (corner 약칭: TL=topLeft, TR=topRight, BR=bottomRight, BL=bottomLeft):
 * - top:    `a = TL`, `b = TR`
 * - right:  `a = TR`, `b = BR`
 * - bottom: `a = BR`, `b = BL`
 * - left:   `a = BL`, `b = TL`
 *
 * 각 side의 endpoint object는 독립 reference이다. 인접 side가 같은 corner 좌표를
 * 공유하더라도 endpoint object를 공유하지 않으므로 한 endpoint mutation이 다른
 * side에 전파되지 않는다.
 * empty rect에서도 raw 좌표로 4개 변을 push한다. zero-length side는 그대로 push한다.
 *
 * @param out 변을 push할 writable array
 * @param rect 변을 읽을 rect
 */
export function sidesInto(out: SegmentWritable<XYObjectWritable, XYObjectWritable>[], rect: RectLike): void {
  // aliasing 안전 - 모든 입력 좌표를 먼저 읽은 후 기록한다
  const x = readRectX(rect);
  const y = readRectY(rect);
  const r = x + readRectWidth(rect);
  const b = y + readRectHeight(rect);

  // 매 호출마다 배열을 비우고 각 side에 독립 endpoint object를 push한다
  out.length = 0;
  out.push(
    { a: { x, y }, b: { x: r, y } }, // top
    { a: { x: r, y }, b: { x: r, y: b } }, // right
    { a: { x: r, y: b }, b: { x, y: b } }, // bottom
    { a: { x, y: b }, b: { x, y } } // left
  );
}
