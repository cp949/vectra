import { readTriangleA, readTriangleB, readTriangleC } from '../internal/triangle';
import { readX, readY, writeXY } from '../internal/xy';
import type { TriangleLike, TriangleWritable, XYWritable } from '../types';

/**
 * 세 side의 midpoint를 vertex로 하는 medial triangle을 out에 기록하고 out을 반환한다.
 *
 * medial triangle의 각 vertex:
 * - out.a = midpoint(a, b)
 * - out.b = midpoint(b, c)
 * - out.c = midpoint(c, a)
 *
 * degenerate triangle(collinear)에서도 각 side의 midpoint를 계산한다.
 * non-finite vertex는 IEEE 754 연산 결과를 그대로 반환한다.
 */
export function medialTriangleInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  triangle: TriangleLike
): Out {
  const a = readTriangleA(triangle);
  const b = readTriangleB(triangle);
  const c = readTriangleC(triangle);

  // aliasing에서도 안전하도록 모든 좌표를 읽은 뒤 기록한다
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(b);
  const by = readY(b);
  const cx = readX(c);
  const cy = readY(c);

  // out.a = midpoint(a, b)
  writeXY(out.a, (ax + bx) / 2, (ay + by) / 2);
  // out.b = midpoint(b, c)
  writeXY(out.b, (bx + cx) / 2, (by + cy) / 2);
  // out.c = midpoint(c, a)
  writeXY(out.c, (cx + ax) / 2, (cy + ay) / 2);

  return out;
}
