import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, TriangleWritable, XYInput, XYWritable } from '../types';

/**
 * base segment endpoint와 apex point로 삼각형을 만들어 out에 기록하고 out을 반환한다.
 *
 * 좌표 정의:
 * - out.a = base.a
 * - out.b = base.b
 * - out.c = apex
 *
 * zero-length base(`base.a === base.b`)도 별도 처리 없이 degenerate triangle로 기록한다.
 * NaN/Infinity 좌표는 validation 없이 그대로 기록한다.
 *
 * aliasing: base와 apex 좌표를 모두 local에 먼저 읽으므로 out의 vertex storage 중 어느
 * 하나와 같은 object여도 안전하다.
 *
 * @param out 삼각형 vertex를 기록할 writable output
 * @param base 첫 두 vertex로 쓸 segment input
 * @param apex 세 번째 vertex point
 */
export function fromSegmentApexInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  base: SegmentLike,
  apex: XYInput
): Out {
  // aliasing 안전을 위해 모든 좌표를 local에 먼저 읽는다
  const baseA = readSegmentA(base);
  const baseB = readSegmentB(base);
  const ax = readX(baseA);
  const ay = readY(baseA);
  const bx = readX(baseB);
  const by = readY(baseB);
  const cx = readX(apex);
  const cy = readY(apex);

  writeXY(out.a, ax, ay);
  writeXY(out.b, bx, by);
  writeXY(out.c, cx, cy);

  return out;
}
