import { readTriangleRawCoords } from '../internal/triangle';
import { writeXY } from '../internal/xy';
import type { SegmentWritable, TriangleLike } from '../types';

/**
 * triangle 세 vertex의 median을 한 번에 담는 nested writable container.
 *
 * 각 필드는 한 vertex의 median segment를 가리킨다.
 * - a: vertex A → midpoint(BC) segment
 * - b: vertex B → midpoint(CA) segment
 * - c: vertex C → midpoint(AB) segment
 */
export interface TriangleMediansWritable {
  /** vertex A에서 midpoint(BC)로 향하는 median segment를 기록하는 slot. */
  a: SegmentWritable;

  /** vertex B에서 midpoint(CA)로 향하는 median segment를 기록하는 slot. */
  b: SegmentWritable;

  /** vertex C에서 midpoint(AB)로 향하는 median segment를 기록하는 slot. */
  c: SegmentWritable;
}

/**
 * triangle 세 vertex의 median segment를 한 번에 out에 기록하고 out을 반환한다.
 *
 * 각 segment는 source vertex에서 맞은편 side midpoint로 향한다.
 * - out.a: A → midpoint(BC)
 * - out.b: B → midpoint(CA)
 * - out.c: C → midpoint(AB)
 *
 * out.a, out.b, out.c와 그 내부 .a, .b XY object identity는 보존한다. 좌표 field만 mutate한다.
 *
 * degenerate triangle(collinear, all-same vertex)도 midpoint 산식을 그대로 적용해 세 segment를
 * 모두 기록한다. 실패하지 않고 항상 out을 반환한다.
 * non-finite vertex 좌표는 검증 없이 JS 산술 결과를 그대로 기록한다.
 *
 * aliasing 안전: 모든 triangle 좌표를 local 변수로 읽은 뒤 writeXY를 호출한다. out의 어느 nested
 * XY가 triangle vertex storage와 같은 object여도 결과가 깨지지 않는다.
 *
 * @param out 세 median을 기록할 nested writable container. 내부 segment object identity는 보존된다.
 * @param triangle median을 계산할 triangle
 */
export function mediansInto<Out extends TriangleMediansWritable>(out: Out, triangle: TriangleLike): Out {
  const { ax, ay, bx, by, cx, cy } = readTriangleRawCoords(triangle);

  // 모든 좌표를 local에 읽은 뒤 기록한다. nested aliasing 안전.
  const mbcX = (bx + cx) / 2;
  const mbcY = (by + cy) / 2;
  const mcaX = (cx + ax) / 2;
  const mcaY = (cy + ay) / 2;
  const mabX = (ax + bx) / 2;
  const mabY = (ay + by) / 2;

  // median a: A → midpoint(BC)
  writeXY(out.a.a, ax, ay);
  writeXY(out.a.b, mbcX, mbcY);
  // median b: B → midpoint(CA)
  writeXY(out.b.a, bx, by);
  writeXY(out.b.b, mcaX, mcaY);
  // median c: C → midpoint(AB)
  writeXY(out.c.a, cx, cy);
  writeXY(out.c.b, mabX, mabY);

  return out;
}
