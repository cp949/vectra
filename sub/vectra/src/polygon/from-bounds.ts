import type { BoundsLike, PolygonWritable } from '../types/index';
import { fromBoundsInto } from './from-bounds-into';

/**
 * bounds 4-corner vertex로 채운 새 `{ points: [...] }` object를 반환한다.
 *
 * vertex 순서는 `[minX, minY] → [maxX, minY] → [maxX, maxY] → [minX, maxY]`이다.
 * `min > max` 역전 bounds는 repair하지 않고 같은 4-corner 산식 결과를 그대로 기록한다.
 * non-finite corner(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 정확히 4개 vertex를 만든다.
 * 매 호출마다 새 `{ points }` object와 새 plain `{ x, y }` element를 생성한다 (companion freshness).
 *
 * @param bounds 변환할 bounds (object 또는 tuple, corner는 XYInput)
 * @returns 새 `{ points: [...] }` PolygonWritable
 */
export function fromBounds(bounds: BoundsLike): PolygonWritable {
  const result: PolygonWritable = { points: [] };
  fromBoundsInto(result.points, bounds);
  return result;
}
