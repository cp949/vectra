import type { PolygonWritable, Triangle } from '../types/flat-shapes.internal';

/**
 * triangle 3-vertex를 out에 교대로 저장한 좌표 `[x0, y0, …]`로 기록하고 out을 반환한다.
 *
 * vertex 순서는 input triangle의 `(x1, y1) → (x2, y2) → (x3, y3)`를 그대로 보존한다.
 * degenerate triangle(`signedArea === 0`, collinear, 동일 vertex 중복 등)은 repair하지 않고 그대로 3개 vertex를 push한다.
 * non-finite vertex(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 `out`을 clear한 뒤 정확히 3개 vertex를 push한다.
 *
 * @param out vertex 좌표를 기록할 writable 배열 (`[x0, y0, …]`)
 * @param triangle 변환할 triangle (`x1, y1, x2, y2, x3, y3`)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function fromTriangleInto(out: PolygonWritable, triangle: Triangle): PolygonWritable {
  out.length = 0;

  const { x1, y1, x2, y2, x3, y3 } = triangle;
  out.push(x1, y1, x2, y2, x3, y3);

  return out;
}
