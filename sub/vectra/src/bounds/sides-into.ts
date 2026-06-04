import { readBoundsMax, readBoundsMin } from '../internal/bounds';
import { readX, readY } from '../internal/xy';
import type { BoundsLike, SegmentWritable, XYObjectWritable } from '../types';

/**
 * bounds의 4개 변(edge)을 `SegmentWritable` 배열에 push한다.
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
 * empty/inverted bounds와 sentinel bounds에서도 raw 좌표로 4개 변을 push한다.
 * caller가 미리 `isEmpty`로 거른다.
 *
 * @param out 변을 push할 writable array
 * @param bounds 변을 읽을 bounds
 */
export function sidesInto(out: SegmentWritable<XYObjectWritable, XYObjectWritable>[], bounds: BoundsLike): void {
  // aliasing 안전 - 모든 입력 좌표를 먼저 읽은 후 기록한다
  const min = readBoundsMin(bounds);
  const max = readBoundsMax(bounds);
  const minX = readX(min);
  const minY = readY(min);
  const maxX = readX(max);
  const maxY = readY(max);

  // 매 호출마다 배열을 비우고 각 side에 독립 endpoint object를 push한다
  out.length = 0;
  out.push(
    { a: { x: minX, y: minY }, b: { x: maxX, y: minY } }, // top
    { a: { x: maxX, y: minY }, b: { x: maxX, y: maxY } }, // right
    { a: { x: maxX, y: maxY }, b: { x: minX, y: maxY } }, // bottom
    { a: { x: minX, y: maxY }, b: { x: minX, y: minY } } // left
  );
}
