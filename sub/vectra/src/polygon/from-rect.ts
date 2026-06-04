import type { PolygonWritable, RectLike } from '../types/index';
import { fromRectInto } from './from-rect-into';

/**
 * rect 4-corner vertex로 채운 새 `{ points: [...] }` object를 반환한다.
 *
 * vertex 순서는 `[x, y] → [x+width, y] → [x+width, y+height] → [x, y+height]`이다.
 * negative `width` / `height`는 repair하지 않고 산술 결과 그대로 기록한다 (좌표가 wrap된 결과, wind 방향이 바뀔 수 있어 caller 책임).
 * non-finite component(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 정확히 4개 vertex를 만든다.
 * 매 호출마다 새 `{ points }` object와 새 plain `{ x, y }` element를 생성한다 (companion freshness).
 *
 * @param rect 변환할 rect (object 또는 `[x, y, width, height]` tuple)
 * @returns 새 `{ points: [...] }` PolygonWritable
 */
export function fromRect(rect: RectLike): PolygonWritable {
  const result: PolygonWritable = { points: [] };
  fromRectInto(result.points, rect);
  return result;
}
