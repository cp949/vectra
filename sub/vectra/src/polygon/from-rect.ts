import type { PolygonWritable, Rect } from '../types/flat-shapes.internal';
import { fromRectInto } from './from-rect-into';

/**
 * rect 4-corner vertex로 채운 새 좌표 배열을 반환한다.
 *
 * vertex 순서는 `[x, y] → [x+width, y] → [x+width, y+height] → [x, y+height]`이다.
 * negative `width` / `height`는 repair하지 않고 산술 결과 그대로 기록한다 (좌표가 wrap된 결과, wind 방향이 바뀔 수 있어 caller 책임).
 * non-finite component(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 정확히 4개 vertex를 만든다.
 *
 * @param rect 변환할 rect (`x, y, width, height`)
 * @returns 새 polygon 좌표 배열 (`[x0, y0, …]`)
 */
export function fromRect(rect: Rect): PolygonWritable {
  const result: PolygonWritable = [];
  fromRectInto(result, rect);
  return result;
}
