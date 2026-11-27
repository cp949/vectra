import type { Matrix, Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * segment의 두 endpoint에 matrix transform을 적용한 결과를 out에 기록하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 선분 객체
 * @param line 변환할 segment
 * @param matrix 적용할 matrix
 */
export function transformInto<Out extends SegmentWritable>(out: Out, line: Segment, matrix: Matrix): Out {
  // aliasing 안전: 모든 좌표와 matrix component를 먼저 읽는다
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const tx = matrix.tx;
  const ty = matrix.ty;
  out.x1 = a * ax + c * ay + tx;
  out.y1 = b * ax + d * ay + ty;
  out.x2 = a * bx + c * by + tx;
  out.y2 = b * bx + d * by + ty;
  return out;
}
