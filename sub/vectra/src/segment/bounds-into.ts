import type { BoundsWritable, Segment } from '../types/flat-shapes.internal';

/**
 * segment 양 endpoint의 axis-aligned bounding box를 out에 기록하고 out을 반환한다.
 *
 * non-finite endpoint는 IEEE 754 전파 규칙을 따른다.
 * zero-length segment는 점으로 수렴한 경계 상자(minX === maxX, minY === maxY)를 기록한다(inverted 아님).
 *
 * @param out 경계 상자를 기록할 경계 상자 객체
 * @param line 대상 segment
 */
export function boundsInto<Out extends BoundsWritable>(out: Out, line: Segment): Out {
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  out.minX = Math.min(ax, bx);
  out.minY = Math.min(ay, by);
  out.maxX = Math.max(ax, bx);
  out.maxY = Math.max(ay, by);
  return out;
}
