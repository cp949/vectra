import { readTriangleA, readTriangleB, readTriangleC } from '../internal/triangle';
import { readX, readY, writeXY } from '../internal/xy';
import type { TriangleLike, XYWritable } from '../types';

/**
 * triangle의 index번째 vertex를 out에 기록하고 true를 반환한다.
 * valid index: 0(a), 1(b), 2(c).
 * invalid index는 false를 반환하고 out을 수정하지 않는다.
 */
export function pointAtIndexInto(out: XYWritable, triangle: TriangleLike, index: number): boolean {
  let vertex: ReturnType<typeof readTriangleA>;
  if (index === 0) {
    vertex = readTriangleA(triangle);
  } else if (index === 1) {
    vertex = readTriangleB(triangle);
  } else if (index === 2) {
    vertex = readTriangleC(triangle);
  } else {
    return false;
  }

  writeXY(out, readX(vertex), readY(vertex));
  return true;
}
