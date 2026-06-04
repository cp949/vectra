import type { PolygonWritable, TriangleLike } from '../types/index';
import { fromTriangleInto } from './from-triangle-into';

/**
 * triangle 3-vertex로 채운 새 `{ points: [...] }` object를 반환한다.
 *
 * vertex 순서는 input triangle의 `a → b → c`를 그대로 보존한다.
 * degenerate triangle(`signedArea === 0`, collinear, 동일 vertex 중복 등)은 repair하지 않고 그대로 3개 vertex를 기록한다.
 * non-finite vertex(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 정확히 3개 vertex를 만든다.
 * 매 호출마다 새 `{ points }` object와 새 plain `{ x, y }` element를 생성한다 (companion freshness).
 *
 * @param triangle 변환할 triangle (object 또는 `[a, b, c]` tuple, vertex는 XYInput)
 * @returns 새 `{ points: [...] }` PolygonWritable
 */
export function fromTriangle(triangle: TriangleLike): PolygonWritable {
  const result: PolygonWritable = { points: [] };
  fromTriangleInto(result.points, triangle);
  return result;
}
