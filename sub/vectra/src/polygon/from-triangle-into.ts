import { readTriangleRawCoords } from '../internal/triangle';
import type { TriangleLike, XYObjectWritable } from '../types/index';

/**
 * triangle 3-vertex를 out에 새 `{ x, y }` object로 기록하고 out을 반환한다.
 *
 * vertex 순서는 input triangle의 `a → b → c`를 그대로 보존한다.
 * degenerate triangle(`signedArea === 0`, collinear, 동일 vertex 중복 등)은 repair하지 않고 그대로 3개 vertex를 push한다.
 * non-finite vertex(NaN/±Infinity)는 그대로 좌표에 pass-through한다.
 * shape conversion builder는 invalid count 개념이 없어 항상 `out`을 clear한 뒤 정확히 3개 vertex를 push한다.
 *
 * @param out vertex object를 기록할 mutable 배열
 * @param triangle 변환할 triangle (object 또는 `[a, b, c]` tuple, vertex는 XYInput)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function fromTriangleInto<Out extends XYObjectWritable[]>(out: Out, triangle: TriangleLike): Out {
  out.length = 0;

  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);

  out.push({ x: ax, y: ay });
  out.push({ x: bx, y: by });
  out.push({ x: cx, y: cy });

  return out;
}
