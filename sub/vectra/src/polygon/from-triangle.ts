import type { PolygonWritable, Triangle } from '../types/flat-shapes.internal';
import { fromTriangleInto } from './from-triangle-into';

/**
 * triangle 3-vertex로 채운 새 좌표 배열을 반환한다.
 *
 * vertex 순서는 input triangle의 `(x1, y1) → (x2, y2) → (x3, y3)`를 그대로 보존한다.
 * degenerate triangle(`signedArea === 0`, collinear, 동일 vertex 중복 등)은 repair하지 않고 그대로 3개 vertex를 기록한다.
 * non-finite vertex(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 정확히 3개 vertex를 만든다.
 *
 * @param triangle 변환할 triangle (`x1, y1, x2, y2, x3, y3`)
 * @returns 새 polygon 좌표 배열 (`[x0, y0, …]`)
 */
export function fromTriangle(triangle: Triangle): PolygonWritable {
  const result: PolygonWritable = [];
  fromTriangleInto(result, triangle);
  return result;
}
