import type { SegmentWritable, Triangle } from '../types/flat-shapes.internal';

/** triangle vertex를 가리키는 key. median family에서 사용한다. */
export type TriangleVertexKey = 'a' | 'b' | 'c';

/**
 * triangle vertex에서 맞은편 side midpoint로 향하는 median segment를 out에 기록하고 out을 반환한다.
 *
 * vertex semantics:
 * - 'a': vertex A에서 midpoint(BC)로 향하는 segment
 * - 'b': vertex B에서 midpoint(CA)로 향하는 segment
 * - 'c': vertex C에서 midpoint(AB)로 향하는 segment
 *
 * (out.x1, out.y1)는 source vertex, (out.x2, out.y2)는 opposite side midpoint다.
 *
 * runtime invalid vertex key는 false를 반환하고 out을 수정하지 않는다.
 * degenerate triangle(collinear, all-same vertex)도 midpoint 산식을 그대로 적용해 segment를
 * 기록한다.
 * non-finite vertex 좌표는 검증 없이 JS 산술 결과를 그대로 기록한다.
 *
 * 모든 꼭짓점을 먼저 읽으므로 입력과 출력을 같은 객체로 넘겨도 안전하다.
 *
 * @param out median segment를 기록할 선분 객체 ((out.x1, out.y1): source vertex, (out.x2, out.y2): midpoint)
 * @param triangle median을 계산할 triangle
 * @param vertex source vertex key. 'a' | 'b' | 'c' 외 값은 false 반환.
 * @returns out 또는 false(invalid key)
 */
export function medianInto<Out extends SegmentWritable>(
  out: Out,
  triangle: Triangle,
  vertex: TriangleVertexKey
): Out | false {
  if (vertex !== 'a' && vertex !== 'b' && vertex !== 'c') return false;

  const { x1: ax, y1: ay, x2: bx, y2: by, x3: cx, y3: cy } = triangle;

  let sx: number;
  let sy: number;
  let mx: number;
  let my: number;

  if (vertex === 'a') {
    // A → midpoint(BC)
    sx = ax;
    sy = ay;
    mx = (bx + cx) / 2;
    my = (by + cy) / 2;
  } else if (vertex === 'b') {
    // B → midpoint(CA)
    sx = bx;
    sy = by;
    mx = (cx + ax) / 2;
    my = (cy + ay) / 2;
  } else {
    // C → midpoint(AB)
    sx = cx;
    sy = cy;
    mx = (ax + bx) / 2;
    my = (ay + by) / 2;
  }

  out.x1 = sx;
  out.y1 = sy;
  out.x2 = mx;
  out.y2 = my;
  return out;
}
