import type { Bounds, PolygonWritable } from '../types/flat-shapes.internal';
import { fromBoundsInto } from './from-bounds-into';

/**
 * bounds 4-corner vertex로 채운 새 좌표 배열을 반환한다.
 *
 * vertex 순서는 `[minX, minY] → [maxX, minY] → [maxX, maxY] → [minX, maxY]`이다.
 * `min > max` 역전 bounds는 repair하지 않고 같은 4-corner 산식 결과를 그대로 기록한다.
 * non-finite corner(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 정확히 4개 vertex를 만든다.
 *
 * @param bounds 변환할 bounds (`minX, minY, maxX, maxY`)
 * @returns 새 polygon 좌표 배열 (`[x0, y0, …]`)
 */
export function fromBounds(bounds: Bounds): PolygonWritable {
  const result: PolygonWritable = [];
  fromBoundsInto(result, bounds);
  return result;
}
