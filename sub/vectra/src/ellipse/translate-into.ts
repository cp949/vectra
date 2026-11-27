import type { Ellipse, EllipseWritable, Point } from '../types/flat-shapes.internal';

/**
 * ellipse의 center를 offset만큼 평행 이동한 결과를 out에 기록하고 out을 반환한다.
 *
 * radii는 그대로 복사한다. input과 out이 같은 object여도 안전하다.
 *
 * @param out 결과를 기록할 타원 객체
 * @param ellipse 이동할 ellipse
 * @param offset center에 더할 이동 벡터
 */
export function translateInto<Out extends EllipseWritable>(out: Out, ellipse: Ellipse, offset: Point): Out {
  // aliasing 안전 - 입력을 먼저 읽은 후 기록한다
  const { cx, cy, rx, ry } = ellipse;
  const ox = offset.x;
  const oy = offset.y;
  out.cx = cx + ox;
  out.cy = cy + oy;
  out.rx = rx;
  out.ry = ry;
  return out;
}
