import { readTriangleA, readTriangleB, readTriangleC } from '../internal/triangle';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentWritable, TriangleLike, XYWritable } from '../types';

/**
 * triangle의 index에 해당하는 opposite side를 out에 기록하고 true를 반환한다.
 *
 * index는 vertex의 opposite side를 가리킨다:
 * - index 0 → side BC (vertex a의 맞은편, b→c)
 * - index 1 → side CA (vertex b의 맞은편, c→a)
 * - index 2 → side AB (vertex c의 맞은편, a→b)
 *
 * invalid index(음수, 3 이상, NaN)는 false를 반환하고 out을 수정하지 않는다.
 */
export function sideAtInto(
  out: SegmentWritable<XYWritable, XYWritable>,
  triangle: TriangleLike,
  index: number
): boolean {
  const a = readTriangleA(triangle);
  const b = readTriangleB(triangle);
  const c = readTriangleC(triangle);

  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;

  if (index === 0) {
    // side BC: b→c
    startX = readX(b);
    startY = readY(b);
    endX = readX(c);
    endY = readY(c);
  } else if (index === 1) {
    // side CA: c→a
    startX = readX(c);
    startY = readY(c);
    endX = readX(a);
    endY = readY(a);
  } else if (index === 2) {
    // side AB: a→b
    startX = readX(a);
    startY = readY(a);
    endX = readX(b);
    endY = readY(b);
  } else {
    return false;
  }

  writeXY(out.a, startX, startY);
  writeXY(out.b, endX, endY);
  return true;
}
