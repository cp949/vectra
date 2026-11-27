import type { Segment, TriangleWritable, Point } from '../types/flat-shapes.internal';

/**
 * base segment endpoint와 apex point로 삼각형을 만들어 out에 기록하고 out을 반환한다.
 *
 * 좌표 정의:
 * - (x1, y1) = 첫 끝점
 * - (x2, y2) = 둘째 끝점
 * - (x3, y3) = apex
 *
 * zero-length base(두 끝점이 일치)도 별도 처리 없이 degenerate triangle로 기록한다.
 * NaN/Infinity 좌표는 validation 없이 그대로 기록한다.
 *
 * 입력 좌표를 먼저 읽은 뒤 결과를 기록한다.
 *
 * @param out 삼각형 vertex를 기록할 삼각형 객체
 * @param base 첫 두 vertex로 쓸 segment input
 * @param apex 세 번째 vertex point
 */
export function fromSegmentApexInto<Out extends TriangleWritable>(out: Out, base: Segment, apex: Point): Out {
  // aliasing 안전을 위해 모든 좌표를 local에 먼저 읽는다
  const { x1: ax, y1: ay, x2: bx, y2: by } = base;
  const cx = apex.x;
  const cy = apex.y;

  out.x1 = ax;
  out.y1 = ay;
  out.x2 = bx;
  out.y2 = by;
  out.x3 = cx;
  out.y3 = cy;

  return out;
}
