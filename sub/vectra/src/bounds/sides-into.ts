import type { Bounds, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * bounds의 4개 변(edge)을 `SegmentWritable` 배열에 push한다.
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
 * empty/inverted bounds와 sentinel bounds에서도 raw 좌표로 4개 변을 push한다.
 * caller가 미리 `isEmpty`로 거른다.
 *
 * @param out 변을 기록할 선분 배열
 * @param bounds 변을 읽을 bounds
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function sidesInto(out: SegmentWritable[], bounds: Bounds): SegmentWritable[] {
  // aliasing 안전 - 모든 입력 좌표를 먼저 읽은 후 기록한다
  const minX = bounds.minX;
  const minY = bounds.minY;
  const maxX = bounds.maxX;
  const maxY = bounds.maxY;

  // 매 호출마다 배열을 비우고 새 선분 객체를 추가한다
  out.length = 0;
  out.push(
    { x1: minX, y1: minY, x2: maxX, y2: minY }, // top
    { x1: maxX, y1: minY, x2: maxX, y2: maxY }, // right
    { x1: maxX, y1: maxY, x2: minX, y2: maxY }, // bottom
    { x1: minX, y1: maxY, x2: minX, y2: minY } // left
  );
  return out;
}
